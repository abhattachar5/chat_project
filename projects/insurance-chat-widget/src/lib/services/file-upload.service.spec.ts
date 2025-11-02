import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FileUploadService } from './file-upload.service';
import { WidgetConfigService } from './widget-config.service';
import { IdempotencyService } from './idempotency.service';
import { AnalyticsService } from './analytics.service';
import { UploadFile } from '../models/upload.model';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let httpMock: HttpTestingController;
  let configService: WidgetConfigService;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WidgetConfigService, IdempotencyService, AnalyticsService],
    });
    service = TestBed.inject(FileUploadService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(WidgetConfigService);
    analyticsService = TestBed.inject(AnalyticsService);

    // Initialize config
    configService.initializeConfig({
      apiBaseUrl: 'https://api.example.com',
      tenantId: 'test-tenant',
      jwt: 'test-jwt',
      environment: 'dev',
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateFile', () => {
    it('should validate valid file', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = service.validateFile(file, 0);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file exceeding size limit', () => {
      const largeFile = new File(['x'.repeat(21 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });
      const result = service.validateFile(largeFile, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject unsupported file type', () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
      const result = service.validateFile(file, 0);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject when max file count exceeded', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = service.validateFile(file, 5);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateFiles', () => {
    it('should validate multiple valid files', () => {
      const files = [
        new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const result = service.validateFiles(files, 0);
      expect(result.valid).toBe(true);
    });

    it('should reject when total files exceed max count', () => {
      const files = Array.from({ length: 6 }, (_, i) =>
        new File(['test'], `test${i}.pdf`, { type: 'application/pdf' })
      );
      const result = service.validateFiles(files, 0);
      expect(result.valid).toBe(false);
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', (done) => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const sessionId = 'test-session';

      spyOn(analyticsService, 'intakeUploadStarted').and.callThrough();

      service.uploadFile(file, sessionId).subscribe({
        next: (uploadFile) => {
          expect(uploadFile.file).toBe(file);
          expect(uploadFile.status).toBe('scanning');
          expect(analyticsService.intakeUploadStarted).toHaveBeenCalledWith(sessionId, uploadFile.id);
          done();
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/files')
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt');

      req.flush({
        fileId: 'file-123',
        status: 'uploaded',
        message: 'File uploaded successfully',
      });
    });

    it('should handle upload progress', (done) => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const sessionId = 'test-session';

      let progressCount = 0;
      service.uploadFile(file, sessionId).subscribe({
        next: (uploadFile) => {
          if (uploadFile.progress > 0) {
            progressCount++;
          }
          if (uploadFile.status === 'scanning') {
            expect(progressCount).toBeGreaterThan(0);
            done();
          }
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/files')
      );

      // Simulate progress events
      req.event({
        type: 1, // UploadProgress
        loaded: 50,
        total: 100,
      } as any);

      req.event({
        type: 1, // UploadProgress
        loaded: 100,
        total: 100,
      } as any);

      req.flush({
        fileId: 'file-123',
        status: 'uploaded',
      });
    });

    it('should handle upload failure', (done) => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const sessionId = 'test-session';

      spyOn(analyticsService, 'intakeUploadFailed').and.callThrough();

      service.uploadFile(file, sessionId).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(analyticsService.intakeUploadFailed).toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/files')
      );
      req.flush({ error: 'Upload failed' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getFileRequirements', () => {
    it('should return file requirements', () => {
      const requirements = service.getFileRequirements();
      expect(requirements.maxSize).toBe(20 * 1024 * 1024);
      expect(requirements.maxFiles).toBe(5);
      expect(requirements.allowedTypes.length).toBeGreaterThan(0);
    });
  });

  describe('getAllowedTypesDisplay', () => {
    it('should return allowed types as string', () => {
      const types = service.getAllowedTypesDisplay();
      expect(typeof types).toBe('string');
      expect(types).toContain('PDF');
    });
  });

  describe('removeUploadFile', () => {
    it('should remove file from list', (done) => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const sessionId = 'test-session';

      service.uploadFile(file, sessionId).subscribe(() => {
        service.uploadFiles.subscribe((files) => {
          const initialCount = files.length;
          if (initialCount > 0) {
            const fileId = files[0].id;
            service.removeUploadFile(fileId);
            service.uploadFiles.subscribe((updatedFiles) => {
              expect(updatedFiles.length).toBe(initialCount - 1);
              expect(updatedFiles.find((f) => f.id === fileId)).toBeUndefined();
              done();
            });
          }
        });
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/files')
      );
      req.flush({
        fileId: 'file-123',
        status: 'uploaded',
      });
    });
  });

  describe('clearUploadFiles', () => {
    it('should clear all upload files', (done) => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const sessionId = 'test-session';

      service.uploadFile(file, sessionId).subscribe(() => {
        service.uploadFiles.subscribe((files) => {
          if (files.length > 0) {
            service.clearUploadFiles();
            service.uploadFiles.subscribe((clearedFiles) => {
              expect(clearedFiles.length).toBe(0);
              done();
            });
          }
        });
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/files')
      );
      req.flush({
        fileId: 'file-123',
        status: 'uploaded',
      });
    });
  });
});

