import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { WidgetConfigService } from './widget-config.service';
import { IdempotencyService } from './idempotency.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let configService: WidgetConfigService;
  let idempotencyService: IdempotencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WidgetConfigService, IdempotencyService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(WidgetConfigService);
    idempotencyService = TestBed.inject(IdempotencyService);

    // Initialize config
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

  describe('get', () => {
    it('should make GET request with correct URL', () => {
      const mockData = { id: '1', name: 'Test' };
      service.get<{ id: string; name: string }>('/test').subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/test');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should include Authorization header when token provided', () => {
      configService.updateConfig({ authToken: 'test-token' });
      service.get('/test').subscribe();

      const req = httpMock.expectOne('https://api.example.com/test');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });
  });

  describe('post', () => {
    it('should make POST request with body and idempotency key', () => {
      const mockData = { id: '1' };
      const body = { name: 'Test' };
      service.post<{ id: string }>('/test', body).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/test');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      expect(req.request.headers.has('Idempotency-Key')).toBe(true);
      req.flush(mockData);
    });

    it('should retry on 500 error', (done) => {
      let retryCount = 0;
      service.post('/test', {}).subscribe({
        next: () => {
          expect(retryCount).toBeGreaterThan(0);
          done();
        },
        error: (err) => {
          fail('Should have retried and succeeded');
        },
      });

      const firstReq = httpMock.expectOne('https://api.example.com/test');
      firstReq.flush({ error: 'Server Error' }, { status: 500, statusText: 'Server Error' });
      retryCount++;

      // Retry request
      const retryReq = httpMock.expectOne('https://api.example.com/test');
      retryReq.flush({ success: true });
    });
  });

  describe('put', () => {
    it('should make PUT request with body', () => {
      const mockData = { id: '1', updated: true };
      const body = { name: 'Updated' };
      service.put<{ id: string; updated: boolean }>('/test/1', body).subscribe((data) => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('https://api.example.com/test/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockData);
    });
  });

  describe('delete', () => {
    it('should make DELETE request', () => {
      service.delete('/test/1').subscribe();

      const req = httpMock.expectOne('https://api.example.com/test/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});

