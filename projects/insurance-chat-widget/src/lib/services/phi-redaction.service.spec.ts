import { TestBed } from '@angular/core/testing';
import { PhiRedactionService } from './phi-redaction.service';

describe('PhiRedactionService', () => {
  let service: PhiRedactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhiRedactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('redact', () => {
    it('should redact NHS numbers', () => {
      const text = 'Patient NHS number: 123 456 7890';
      const redacted = service.redact(text);
      expect(redacted).toContain('•••');
      expect(redacted).not.toContain('123 456 7890');
    });

    it('should redact dates of birth', () => {
      const text = 'Date of birth: 01/01/1990';
      const redacted = service.redact(text);
      expect(redacted).toContain('••/••/••••');
      expect(redacted).not.toContain('01/01/1990');
    });

    it('should redact email addresses', () => {
      const text = 'Contact: patient@example.com';
      const redacted = service.redact(text);
      expect(redacted).toContain('••••@••••.•••');
      expect(redacted).not.toContain('patient@example.com');
    });

    it('should redact postcodes', () => {
      const text = 'Address: SW1A 1AA, London';
      const redacted = service.redact(text);
      expect(redacted).toContain('••• •••');
      expect(redacted).not.toContain('SW1A 1AA');
    });

    it('should redact address keywords', () => {
      const text = 'Patient lives on High Street';
      const redacted = service.redact(text);
      expect(redacted).toContain('••••');
      expect(redacted).not.toContain('Street');
    });

    it('should handle multiple PHI patterns', () => {
      const text = 'Patient: John Doe, NHS: 123 456 7890, DOB: 01/01/1990, Email: john@example.com';
      const redacted = service.redact(text);
      expect(redacted).toContain('•••');
      expect(redacted).not.toContain('123 456 7890');
      expect(redacted).not.toContain('01/01/1990');
      expect(redacted).not.toContain('john@example.com');
    });

    it('should handle text without PHI', () => {
      const text = 'This is a normal medical report without sensitive information.';
      const redacted = service.redact(text);
      expect(redacted).toBe(text);
    });

    it('should handle empty string', () => {
      const redacted = service.redact('');
      expect(redacted).toBe('');
    });

    it('should respect redaction options', () => {
      const text = 'NHS: 123 456 7890, DOB: 01/01/1990';
      const redacted = service.redact(text, { redactNhsNumbers: false });
      expect(redacted).toContain('123 456 7890');
      expect(redacted).toContain('••/••/••••');
    });
  });

  describe('getPhiWarning', () => {
    it('should return warning message', () => {
      const warning = service.getPhiWarning();
      expect(typeof warning).toBe('string');
      expect(warning.length).toBeGreaterThan(0);
    });
  });
});

