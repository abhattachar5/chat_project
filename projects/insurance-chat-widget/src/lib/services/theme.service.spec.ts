import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from './theme.service';
import { WidgetConfigService } from './widget-config.service';
import { ThemeConfig } from '../models/widget-config.model';

describe('ThemeService', () => {
  let service: ThemeService;
  let document: Document;
  let configService: WidgetConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WidgetConfigService],
    });
    service = TestBed.inject(ThemeService);
    document = TestBed.inject(DOCUMENT);
    configService = TestBed.inject(WidgetConfigService);

    configService.initializeConfig({
      apiBaseUrl: 'https://api.example.com',
      tenantId: 'test-tenant',
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('applyTheme', () => {
    it('should apply theme to document root', () => {
      const theme: ThemeConfig = {
        palette: {
          primary: '#FF0000',
          secondary: '#00FF00',
        },
        density: 'compact',
        darkMode: false,
      };

      service.applyTheme(theme);
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--ins-primary')).toBe('#FF0000');
      expect(root.style.getPropertyValue('--ins-secondary')).toBe('#00FF00');
    });

    it('should apply dark mode class', () => {
      const theme: ThemeConfig = {
        darkMode: true,
      };

      service.applyTheme(theme);
      expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    });

    it('should remove dark mode class when darkMode is false', () => {
      const root = document.documentElement;
      root.classList.add('dark-mode');

      const theme: ThemeConfig = {
        darkMode: false,
      };

      service.applyTheme(theme);
      expect(root.classList.contains('dark-mode')).toBe(false);
    });
  });

  describe('initializeTheme', () => {
    it('should initialize theme from config', () => {
      configService.updateConfig({
        theme: {
          palette: {
            primary: '#0000FF',
          },
        },
      });

      service.initializeTheme();
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--ins-primary')).toBe('#0000FF');
    });

    it('should not apply theme if config has no theme', () => {
      configService.updateConfig({});
      service.initializeTheme();
      // Should not throw
      expect(service).toBeTruthy();
    });
  });

  describe('prefersReducedMotion', () => {
    it('should check prefers-reduced-motion media query', () => {
      const result = service.prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('prefersHighContrast', () => {
    it('should check prefers-contrast media query', () => {
      const result = service.prefersHighContrast();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('initializeAccessibility', () => {
    it('should apply reduced motion and high contrast styles', () => {
      service.initializeAccessibility();
      // Should not throw
      expect(service).toBeTruthy();
    });
  });
});

