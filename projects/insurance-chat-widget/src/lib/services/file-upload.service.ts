import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpProgressEvent, HttpUploadProgressEvent } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { WidgetConfigService } from './widget-config.service';
import { IdempotencyService } from './idempotency.service';
import { AnalyticsService } from './analytics.service';
import { UploadFile, UploadResponse, FileValidationResult, FileRequirements } from '../models/upload.model';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private configService = inject(WidgetConfigService);
  private idempotencyService = inject(IdempotencyService);
  private analyticsService = inject(AnalyticsService);

  // File requirements from FRD
  private readonly fileRequirements: FileRequirements = {
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 5,
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    ],
  };

  private readonly allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
  private readonly allowedMimeTypes = this.fileRequirements.allowedTypes;

  private uploadFiles$ = new BehaviorSubject<UploadFile[]>([]);
  public uploadFiles = this.uploadFiles$.asObservable();

  /**
   * Validate file before upload
   */
  validateFile(file: File, existingFilesCount: number = 0): FileValidationResult {
    const errors: string[] = [];

    // Check file count
    if (existingFilesCount >= this.fileRequirements.maxFiles) {
      errors.push(`Maximum ${this.fileRequirements.maxFiles} files allowed`);
    }

    // Check file size
    if (file.size > this.fileRequirements.maxSize) {
      errors.push(`File size exceeds ${this.fileRequirements.maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type by extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.allowedExtensions.some(ext => fileName.endsWith(ext));

    // Check file type by MIME type
    const hasValidMimeType = this.allowedMimeTypes.includes(file.type);

    if (!hasValidExtension && !hasValidMimeType) {
      errors.push('File type not supported. Please use PDF, JPG, PNG, or DOCX');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate multiple files
   */
  validateFiles(files: File[], existingFilesCount: number = 0): FileValidationResult {
    const errors: string[] = [];
    const totalFiles = existingFilesCount + files.length;

    if (totalFiles > this.fileRequirements.maxFiles) {
      errors.push(`Cannot add more than ${this.fileRequirements.maxFiles} files. You already have ${existingFilesCount} file(s).`);
      return { valid: false, errors };
    }

    // Calculate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > this.fileRequirements.maxSize) {
      errors.push(`Total file size exceeds ${this.fileRequirements.maxSize / (1024 * 1024)}MB limit`);
    }

    // Validate each file
    for (const file of files) {
      const validation = this.validateFile(file, existingFilesCount);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get file requirements for display
   */
  getFileRequirements(): FileRequirements {
    return { ...this.fileRequirements };
  }

  /**
   * Get allowed file types for display
   */
  getAllowedTypesDisplay(): string {
    return 'PDF, JPG, PNG, DOCX';
  }

  /**
   * Upload a single file
   */
  uploadFile(file: File, sessionId: string): Observable<UploadFile> {
    const uploadFile: UploadFile = {
      id: this.generateFileId(),
      file,
      status: 'queued',
      progress: 0,
    };

    // Add to upload files list
    this.addUploadFile(uploadFile);

    // Update status to uploading
    this.updateUploadFile(uploadFile.id, { status: 'uploading' });

    // Day 2 Phase 4: Audit event - Upload started
    this.analyticsService.intakeUploadStarted(sessionId, uploadFile.id);
    
    const startTime = Date.now();

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    // Get base URL
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/v1/intake/files`;

    // Get headers (without Content-Type to let browser set it with boundary)
    const headers = this.getHeaders(false);

    // Upload file with progress tracking
    return this.http.post<UploadResponse>(url, formData, {
      headers,
      reportProgress: true,
      observe: 'events',
    }).pipe(
      map((event: HttpEvent<UploadResponse>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progressEvent = event as HttpUploadProgressEvent;
            if (progressEvent.total) {
              const progress = Math.round((100 * progressEvent.loaded) / progressEvent.total);
              this.updateUploadFile(uploadFile.id, { progress });
            }
            return uploadFile;

          case HttpEventType.Response:
            const response = event.body!;
            const duration = Date.now() - startTime;
            
            // Day 2 Phase 4: Audit event - Upload finished
            if (response.status === 'uploaded' || response.status === 'completed') {
              this.analyticsService.intakeUploadFinished(sessionId, response.fileId || uploadFile.id, duration);
            }
            
            this.updateUploadFile(uploadFile.id, {
              fileId: response.fileId,
              status: response.status === 'uploaded' ? 'scanning' : response.status === 'failed' ? 'failed' : 'scanning',
              progress: 100,
            });
            return uploadFile;

          default:
            return uploadFile;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const errorInfo = this.handleError(error);
        
        // Day 2 Phase 4: Audit event - Upload failed
        this.analyticsService.intakeUploadFailed(
          sessionId,
          uploadFile.id,
          errorInfo.code,
          errorInfo.message
        );
        
        this.updateUploadFile(uploadFile.id, {
          status: 'failed',
          error: this.getErrorMessage(error),
        });
        return throwError(() => errorInfo);
      })
    );
  }

  /**
   * Get base URL for API
   */
  private getBaseUrl(): string {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Widget not initialized. Call InsuranceChatWidget.init() first.');
    }

    const baseUrls: Record<string, string> = {
      prod: 'https://api.provider.example',
      staging: 'https://api-staging.provider.example',
      dev: 'https://api-dev.provider.example',
    };

    return baseUrls[config.environment] || baseUrls.dev;
  }

  /**
   * Get headers for upload request
   */
  private getHeaders(requireIdempotency = false): HttpHeaders {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Widget not initialized');
    }

    let headers = new HttpHeaders({
      Authorization: `Bearer ${config.jwt}`,
      // Don't set Content-Type - browser will set it with boundary for multipart/form-data
    });

    if (requireIdempotency) {
      const idempotencyKey = this.idempotencyService.generateKey();
      headers = headers.set('Idempotency-Key', idempotencyKey);
    }

    return headers;
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add upload file to list
   */
  private addUploadFile(uploadFile: UploadFile): void {
    const currentFiles = this.uploadFiles$.value;
    this.uploadFiles$.next([...currentFiles, uploadFile]);
  }

  /**
   * Update upload file status
   */
  updateUploadFile(id: string, updates: Partial<UploadFile>): void {
    const currentFiles = this.uploadFiles$.value;
    const index = currentFiles.findIndex(f => f.id === id);
    if (index !== -1) {
      const updated = { ...currentFiles[index], ...updates };
      const newFiles = [...currentFiles];
      newFiles[index] = updated;
      this.uploadFiles$.next(newFiles);
    }
  }

  /**
   * Remove upload file
   */
  removeUploadFile(id: string): void {
    const currentFiles = this.uploadFiles$.value;
    this.uploadFiles$.next(currentFiles.filter(f => f.id !== id));
  }

  /**
   * Clear all upload files
   */
  clearUploadFiles(): void {
    this.uploadFiles$.next([]);
  }

  /**
   * Get error message from HTTP error
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return `Network error: ${error.error.message}`;
    }

    switch (error.status) {
      case 400:
        return error.error?.message || 'Invalid file format';
      case 413:
        return 'File too large';
      case 415:
        return 'Unsupported file type';
      case 0:
        return 'Network error. Please check your connection';
      default:
        return error.error?.message || `Upload failed: ${error.status}`;
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): { code: string; message: string; status?: number } {
    return {
      code: `upload_error_${error.status || 'unknown'}`,
      message: this.getErrorMessage(error),
      status: error.status,
    };
  }
}

