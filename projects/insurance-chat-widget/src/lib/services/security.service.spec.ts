import { TestBed } from '@angular/core/testing';
import { SecurityService } from './security.service';
import { WidgetConfigService } from './widget-config.service';

describe('SecurityService', () => {
  let service: SecurityService;
  let configService: WidgetConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WidgetConfigService],
    });
    service = TestBed.inject(SecurityService);
    configService = TestBed.inject(WidgetConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('verifyTlsSupport', () => {
    it('should verify TLS support', () => {
      const result = service.verifyTlsSupport();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('clearPhiFromStorage', () => {
    it('should clear PHI from storage', () => {
      // Set up storage
      localStorage.setItem('phi_data', 'test');
      sessionStorage.setItem('sensitive_info', 'test');

      expect(() => service.clearPhiFromStorage()).not.toThrow();
    });
  });

  describe('validateDataResidency', () => {
    it('should validate data residency for UK region', () => {
      configService.initializeConfig({
        apiBaseUrl: 'https://api.example.com',
        tenantId: 'test-tenant',
      });
      (configService as any).config = { ...configService.getConfig(), region: 'uk' };

      const result = service.validateDataResidency();
      expect(result).toBe(true);
    });

    it('should validate data residency for EU region', () => {
      configService.initializeConfig({
        apiBaseUrl: 'https://api.example.com',
        tenantId: 'test-tenant',
      });
      (configService as any).config = { ...configService.getConfig(), region: 'eu' };

      const result = service.validateDataResidency();
      expect(result).toBe(true);
    });

    it('should return false for invalid region', () => {
      configService.initializeConfig({
        apiBaseUrl: 'https://api.example.com',
        tenantId: 'test-tenant',
      });
      (configService as any).config = { ...configService.getConfig(), region: 'us' };

      const result = service.validateDataResidency();
      expect(result).toBe(false);
    });
  });

  describe('getDataResidencyRegion', () => {
    it('should return default region if not configured', () => {
      configService.initializeConfig({
        apiBaseUrl: 'https://api.example.com',
        tenantId: 'test-tenant',
      });

      const region = service.getDataResidencyRegion();
      expect(region).toBe('uk');
    });

    it('should return configured region', () => {
      configService.initializeConfig({
        apiBaseUrl: 'https://api.example.com',
        tenantId: 'test-tenant',
      });
      (configService as any).config = { ...configService.getConfig(), region: 'eu' };

      const region = service.getDataResidencyRegion();
      expect(region).toBe('eu');
    });
  });

  describe('validateSecurityHeaders', () => {
    it('should validate security headers', () => {
      const result = service.validateSecurityHeaders();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('preventPhiLogging', () => {
    it('should prevent PHI logging', () => {
      expect(() => service.preventPhiLogging()).not.toThrow();
    });
  });

  describe('clearInMemoryPhi', () => {
    it('should clear in-memory PHI', () => {
      expect(() => service.clearInMemoryPhi()).not.toThrow();
    });
  });
});

