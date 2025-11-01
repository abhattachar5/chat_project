import { TestBed } from '@angular/core/testing';
import { WidgetConfigService } from './widget-config.service';
import { WidgetConfig } from '../models/widget-config.model';

describe('WidgetConfigService', () => {
  let service: WidgetConfigService;
  const mockConfig: WidgetConfig = {
    apiBaseUrl: 'https://api.example.com',
    tenantId: 'test-tenant',
    theme: {
      palette: {
        primary: '#0D47A1',
        secondary: '#1976D2',
      },
      density: 'comfortable',
      darkMode: false,
    },
    analytics: {
      enabled: true,
      onEvent: () => {},
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WidgetConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeConfig', () => {
    it('should initialize config from provided config', () => {
      service.initializeConfig(mockConfig);
      const config = service.getConfig();
      expect(config).toEqual(mockConfig);
    });

    it('should merge provided config with defaults', () => {
      const partialConfig: Partial<WidgetConfig> = {
        apiBaseUrl: 'https://api.example.com',
      };
      service.initializeConfig(partialConfig as WidgetConfig);
      const config = service.getConfig();
      expect(config?.apiBaseUrl).toBe('https://api.example.com');
    });
  });

  describe('getConfig', () => {
    it('should return null if config not initialized', () => {
      const config = service.getConfig();
      expect(config).toBeNull();
    });

    it('should return config after initialization', () => {
      service.initializeConfig(mockConfig);
      const config = service.getConfig();
      expect(config).toEqual(mockConfig);
    });
  });

  describe('updateConfig', () => {
    it('should update config partially', () => {
      service.initializeConfig(mockConfig);
      service.updateConfig({ tenantId: 'new-tenant' });
      const config = service.getConfig();
      expect(config?.tenantId).toBe('new-tenant');
      expect(config?.apiBaseUrl).toBe('https://api.example.com');
    });
  });
});

