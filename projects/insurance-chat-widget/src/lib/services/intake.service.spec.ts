import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IntakeService } from './intake.service';
import { WidgetConfigService } from './widget-config.service';
import { IdempotencyService } from './idempotency.service';
import { AnalyticsService } from './analytics.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('IntakeService', () => {
  let service: IntakeService;
  let httpMock: HttpTestingController;
  let configService: WidgetConfigService;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WidgetConfigService, IdempotencyService, AnalyticsService],
    });
    service = TestBed.inject(IntakeService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(WidgetConfigService);
    analyticsService = TestBed.inject(AnalyticsService);

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

  describe('getExtractionSummary', () => {
    it('should get extraction summary successfully', (done) => {
      const mockSummary = {
        sessionId: 'session-123',
        status: 'completed',
        extractionStatus: 'completed',
        candidates: [
          {
            id: 'candidate-1',
            originalTerm: 'Asthma',
            canonical: { code: 'ASTHMA', label: 'Asthma' },
            confidence: 0.9,
            evidence: {
              docId: 'doc-1',
              page: 1,
              snippet: 'Patient has asthma',
            },
          },
        ],
      };

      service.getExtractionSummary('session-123').subscribe({
        next: (summary) => {
          expect(summary).toEqual(mockSummary);
          done();
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/summary') &&
        request.params.get('sessionId') === 'session-123'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);
    });

    it('should handle extraction summary errors', (done) => {
      service.getExtractionSummary('session-123').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/summary')
      );
      req.flush({ error: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('pollExtractionSummary', () => {
    it('should poll until extraction completes', fakeAsync((done) => {
      const sessionId = 'session-123';
      const fileId = 'file-123';
      
      spyOn(analyticsService, 'intakeExtractStarted').and.callThrough();
      spyOn(analyticsService, 'intakeExtractFinished').and.callThrough();
      spyOn(analyticsService, 'intakeCandidatesPresented').and.callThrough();

      const mockProcessingSummary = {
        sessionId,
        status: 'processing',
        extractionStatus: 'processing',
        candidates: [],
      };

      const mockCompletedSummary = {
        sessionId,
        status: 'completed',
        extractionStatus: 'completed',
        candidates: [
          {
            id: 'candidate-1',
            originalTerm: 'Asthma',
            canonical: { code: 'ASTHMA', label: 'Asthma' },
            confidence: 0.9,
            evidence: {
              docId: 'doc-1',
              page: 1,
              snippet: 'Patient has asthma',
            },
          },
        ],
      };

      service.pollExtractionSummary(sessionId, fileId).subscribe({
        next: (summary) => {
          if (summary.status === 'completed') {
            expect(analyticsService.intakeExtractStarted).toHaveBeenCalled();
            expect(analyticsService.intakeExtractFinished).toHaveBeenCalled();
            expect(analyticsService.intakeCandidatesPresented).toHaveBeenCalled();
            done();
          }
        },
      });

      // First poll - processing
      tick(2000);
      const req1 = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/summary')
      );
      req1.flush(mockProcessingSummary);

      // Second poll - completed
      tick(2000);
      const req2 = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/summary')
      );
      req2.flush(mockCompletedSummary);
    }));

    it('should timeout after max poll time', fakeAsync((done) => {
      const sessionId = 'session-123';
      const fileId = 'file-123';

      const mockProcessingSummary = {
        sessionId,
        status: 'processing',
        extractionStatus: 'processing',
        candidates: [],
      };

      service.pollExtractionSummary(sessionId, fileId).subscribe({
        next: (summary) => {
          // Should eventually timeout
          if (summary.extractionStatus === 'failed') {
            expect(summary.error).toContain('timeout');
            done();
          }
        },
      });

      // Poll multiple times until timeout
      for (let i = 0; i < 31; i++) {
        tick(2000);
        const req = httpMock.expectOne((request) =>
          request.url.includes('/v1/intake/summary')
        );
        req.flush(mockProcessingSummary);
      }
    }));
  });

  describe('submitConfirmations', () => {
    it('should submit confirmations successfully', (done) => {
      const mockPayload = {
        sessionId: 'session-123',
        confirmed: [
          {
            candidateId: 'candidate-1',
            status: 'active',
          },
        ],
        rejected: ['candidate-2'],
      };

      const mockResponse = {
        sessionId: 'session-123',
        confirmedCount: 1,
        rejectedCount: 1,
        prefill: [],
      };

      service.submitConfirmations(mockPayload).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/confirmations')
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      expect(req.request.headers.has('Idempotency-Key')).toBe(true);
      req.flush(mockResponse);
    });

    it('should handle confirmation submission errors', (done) => {
      const mockPayload = {
        sessionId: 'session-123',
        confirmed: [],
        rejected: [],
      };

      service.submitConfirmations(mockPayload).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/intake/confirmations')
      );
      req.flush({ error: 'Validation failed' }, { status: 422, statusText: 'Unprocessable Entity' });
    });
  });
});

