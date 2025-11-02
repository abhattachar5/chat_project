import { Component, EventEmitter, inject, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { FileUploadService } from '../../services/file-upload.service';
import { UploadFile } from '../../models/upload.model';

@Component({
  selector: 'ins-medical-report-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatListModule,
    MatSnackBarModule,
    DragDropModule,
  ],
  templateUrl: './medical-report-upload.component.html',
  styleUrls: ['./medical-report-upload.component.scss'],
})
export class MedicalReportUploadComponent implements OnInit, OnDestroy {
  @Output() filesUploaded = new EventEmitter<string[]>(); // Emit fileIds when files are uploaded
  @Output() skip = new EventEmitter<void>();
  @Output() continueClicked = new EventEmitter<void>();

  private fileUploadService = inject(FileUploadService);
  private snackBar = inject(MatSnackBar);

  uploadFiles: UploadFile[] = [];
  private uploadSub?: Subscription;

  // Session ID - should be injected/obtained from session service
  sessionId = ''; // TODO: Get from SessionService

  // File requirements
  maxSizeMB = 20;
  maxFiles = 5;
  allowedTypes = 'PDF, JPG, PNG, DOCX';

  // Drag and drop state
  isDragging = false;
  dragCounter = 0;

  ngOnInit(): void {
    // Subscribe to upload files changes
    this.uploadSub = this.fileUploadService.uploadFiles.subscribe(files => {
      this.uploadFiles = files;
      this.checkUploadComplete();
    });
  }

  ngOnDestroy(): void {
    this.uploadSub?.unsubscribe();
  }

  /**
   * Handle file selection via file picker
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
    // Reset input value to allow selecting same file again
    input.value = '';
  }

  /**
   * Handle drag enter
   */
  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    if (event.dataTransfer?.items && event.dataTransfer.items.length > 0) {
      this.isDragging = true;
    }
  }

  /**
   * Handle drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.isDragging = false;
    }
  }

  /**
   * Handle drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    this.dragCounter = 0;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  /**
   * Handle files from drag-drop or file picker
   */
  private handleFiles(files: File[]): void {
    if (files.length === 0) {
      return;
    }

    // Validate files
    const validation = this.fileUploadService.validateFiles(files, this.uploadFiles.length);
    
    if (!validation.valid) {
      validation.errors.forEach(error => {
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
      return;
    }

    // Upload files
    files.forEach(file => {
      if (!this.sessionId) {
        this.snackBar.open('Session not initialized. Please wait...', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.fileUploadService.uploadFile(file, this.sessionId).subscribe({
        next: (uploadFile) => {
          // Upload progress handled in service
          console.log('Upload progress:', uploadFile);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Upload failed. Please try again.', 'Close', {
            duration: 5000,
          });
        },
      });
    });
  }

  /**
   * Remove a file
   */
  removeFile(fileId: string): void {
    this.fileUploadService.removeUploadFile(fileId);
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(file: UploadFile): string {
    const name = file.file.name.toLowerCase();
    if (name.endsWith('.pdf')) return 'picture_as_pdf';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) return 'image';
    if (name.endsWith('.docx')) return 'description';
    return 'insert_drive_file';
  }

  /**
   * Get status icon
   */
  getStatusIcon(file: UploadFile): string {
    switch (file.status) {
      case 'queued':
        return 'schedule';
      case 'uploading':
        return 'cloud_upload';
      case 'scanning':
        return 'search';
      case 'extracted':
        return 'check_circle';
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  }

  /**
   * Get status color
   */
  getStatusColor(file: UploadFile): string {
    switch (file.status) {
      case 'queued':
        return 'warn';
      case 'uploading':
        return 'primary';
      case 'scanning':
        return 'accent';
      case 'extracted':
        return 'primary';
      case 'failed':
        return 'warn';
      default:
        return '';
    }
  }

  /**
   * Get status text for display
   */
  getStatusText(file: UploadFile): string {
    switch (file.status) {
      case 'queued':
        return 'Queued';
      case 'uploading':
        return `Uploading ${file.progress}%`;
      case 'scanning':
        return 'Scanning...';
      case 'extracted':
        return 'Ready';
      case 'failed':
        return 'Failed';
      default:
        return file.status;
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Handle skip button
   */
  onSkip(): void {
    this.skip.emit();
  }

  /**
   * Handle continue button
   */
  onContinue(): void {
    // Allow continuing even without files (optional step)
    // But check if files are being uploaded
    const uploading = this.uploadFiles.some(f => 
      f.status === 'uploading' || f.status === 'scanning'
    );

    if (uploading) {
      this.snackBar.open('Please wait for all files to finish uploading.', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.continueClicked.emit();
  }

  /**
   * Check if upload is complete and emit fileIds
   */
  private checkUploadComplete(): void {
    const completedFiles = this.uploadFiles.filter(f => 
      f.status === 'extracted' && f.fileId
    );

    if (completedFiles.length > 0 && completedFiles.length === this.uploadFiles.length) {
      const fileIds = completedFiles.map(f => f.fileId!).filter(Boolean);
      this.filesUploaded.emit(fileIds);
    }
  }

  /**
   * Open file picker (keyboard accessible)
   */
  openFilePicker(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.jpg,.jpeg,.png,.docx';
    input.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.handleFiles(Array.from(target.files));
      }
    });
    input.click();
  }
}
