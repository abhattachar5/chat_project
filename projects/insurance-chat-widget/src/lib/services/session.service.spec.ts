import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SessionService } from './session.service';
import { ApiService } from './api.service';
import { WidgetConfigService } from './widget-config.service';
import { IdempotencyService } from './idempotency.service';

describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;
  let configService: WidgetConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, WidgetConfigService, IdempotencyService],
    });
    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(WidgetConfigService);

    configService.initializeConfig({
      apiBaseUrl: 'https://api.example.com',
      tenantId: 'test-tenant',
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startSession', () => {
    it('should create a new session', (done) => {
      const mockSession = {
        id: 'session-123',
        status: 'active',
        progress: 0,
      };

      service.startSession({ recordingAccepted: false, timestamp: new Date().toISOString() }).subscribe((session) => {
        expect(session.id).toBe('session-123');
        expect(service.sessionId()).toBe('session-123');
        done();
      });

      const req = httpMock.expectOne('https://api.example.com/v1/sessions');
      expect(req.request.method).toBe('POST');
      req.flush(mockSession);
    });

    it('should handle session creation error', (done) => {
      service.startSession({ recordingAccepted: false, timestamp: new Date().toISOString() }).subscribe({
        next: () => fail('Should have failed'),
        error: (err) => {
          expect(err).toBeTruthy();
          done();
        },
      });

      const req = httpMock.expectOne('https://api.example.com/v1/sessions');
      req.flush({ error: 'Failed' }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getSession', () => {
    it('should fetch session by id', (done) => {
      const mockSession = {
        id: 'session-123',
        status: 'active',
        progress: 0.5,
      };

      service.getSession('session-123').subscribe((session) => {
        expect(session.id).toBe('session-123');
        expect(session.progress).toBe(0.5);
        done();
      });

      const req = httpMock.expectOne('https://api.example.com/v1/sessions/session-123');
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });
  });

  describe('endSession', () => {
    it('should end the current session', (done) => {
      // First start a session
      service.startSession({ recordingAccepted: false, timestamp: new Date().toISOString() }).subscribe(() => {
        service.endSession().subscribe(() => {
          expect(service.sessionId()).toBeNull();
          done();
        });

        const req = httpMock.expectOne((r) => r.url.includes('/v1/sessions') && r.method === 'POST');
        req.flush({ id: 'session-123' });
        
        const endReq = httpMock.expectOne((r) => r.url.includes('/v1/sessions') && r.method === 'DELETE');
        endReq.flush({});
      });

      const startReq = httpMock.expectOne('https://api.example.com/v1/sessions');
      startReq.flush({ id: 'session-123' });
    });
  });

  describe('signals', () => {
    it('should provide loading signal', () => {
      expect(service.loading).toBeDefined();
      expect(typeof service.loading()).toBe('boolean');
    });

    it('should provide session signal', () => {
      expect(service.session).toBeDefined();
      expect(service.session()).toBeNull();
    });

    it('should provide sessionId signal', () => {
      expect(service.sessionId).toBeDefined();
      expect(service.sessionId()).toBeNull();
    });
  });
});

