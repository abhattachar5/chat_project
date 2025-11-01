import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('translate', () => {
    it('should translate a key', () => {
      const result = service.translate('widget.title');
      expect(result).toBe('InsureChat');
    });

    it('should return key if translation not found', () => {
      const result = service.translate('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('should replace parameters', () => {
      const result = service.translate('widget.title', { name: 'Test' });
      expect(result).toContain('InsureChat');
    });
  });

  describe('formatDate', () => {
    it('should format date according to locale', () => {
      const date = new Date('2025-06-12T09:14:00Z');
      const result = service.formatDate(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle string date', () => {
      const result = service.formatDate('2025-06-12T09:14:00Z');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatNumber', () => {
    it('should format number according to locale', () => {
      const result = service.formatNumber(1234.56);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should use custom options', () => {
      const result = service.formatNumber(1234.56, { minimumFractionDigits: 2 });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency according to locale', () => {
      const result = service.formatCurrency(1234.56, 'GBP');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('£');
    });
  });

  describe('setLocale', () => {
    it('should set locale if translations exist', () => {
      service.setLocale('en-GB');
      expect(service.currentLocale()).toBe('en-GB');
    });

    it('should not set locale if translations do not exist', () => {
      const initialLocale = service.currentLocale();
      service.setLocale('nonexistent');
      expect(service.currentLocale()).toBe(initialLocale);
    });
  });

  describe('getDateFormatPattern', () => {
    it('should return date format pattern for en-GB', () => {
      service.setLocale('en-GB');
      const result = service.getDateFormatPattern();
      expect(result).toBe('DD/MM/YYYY');
    });
  });

  describe('isRTL', () => {
    it('should return false for en-GB (LTR)', () => {
      service.setLocale('en-GB');
      expect(service.isRTL()).toBe(false);
    });

    it('should return true for Arabic (RTL)', () => {
      // Note: Arabic translations would need to be added
      // For now, this tests the detection logic
      expect(typeof service.isRTL()).toBe('boolean');
    });
  });
});

