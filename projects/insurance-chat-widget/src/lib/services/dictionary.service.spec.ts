import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DictionaryService } from './dictionary.service';
import { WidgetConfigService } from './widget-config.service';
import { IdempotencyService } from './idempotency.service';
import { of } from 'rxjs';

describe('DictionaryService', () => {
  let service: DictionaryService;
  let httpMock: HttpTestingController;
  let configService: WidgetConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WidgetConfigService, IdempotencyService],
    });
    service = TestBed.inject(DictionaryService);
    httpMock = TestBed.inject(HttpTestingController);
    configService = TestBed.inject(WidgetConfigService);

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

  describe('search', () => {
    it('should search dictionary successfully', (done) => {
      const mockResults = [
        { code: 'ASTHMA', label: 'Asthma', category: 'respiratory' },
        { code: 'ASTHMATIC', label: 'Asthmatic', category: 'respiratory' },
      ];

      service.search('asthma').subscribe({
        next: (results) => {
          expect(results).toEqual(mockResults);
          done();
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/dictionary/search') &&
        request.params.get('q') === 'asthma'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResults);
    });

    it('should return empty array for empty query', (done) => {
      service.search('').subscribe({
        next: (results) => {
          expect(results).toEqual([]);
          done();
        },
      });
    });

    it('should handle search errors', (done) => {
      service.search('test').subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          done();
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/dictionary/search')
      );
      req.flush({ error: 'Search failed' }, { status: 500, statusText: 'Server Error' });
    });

    it('should cache search results', (done) => {
      const mockResults = [{ code: 'TEST', label: 'Test Condition' }];

      // First search
      service.search('test').subscribe({
        next: (results) => {
          expect(results).toEqual(mockResults);
          
          // Second search should use cache
          service.search('test').subscribe({
            next: (cachedResults) => {
              expect(cachedResults).toEqual(mockResults);
              // Should only make one HTTP request
              done();
            },
          });
        },
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('/v1/dictionary/search')
      );
      req.flush(mockResults);
    });
  });

  describe('clearCache', () => {
    it('should clear search cache', () => {
      expect(() => service.clearCache()).not.toThrow();
    });
  });
});

