import { Injectable, signal } from '@angular/core';
import { WidgetConfig } from '../models/widget-config.model';

@Injectable({
  providedIn: 'root',
})
export class WidgetConfigService {
  private configSignal = signal<WidgetConfig | null>(null);

  /**
   * Initialize the widget configuration
   */
  init(config: WidgetConfig): void {
    this.validateConfig(config);
    this.configSignal.set(config);
  }

  /**
   * Get current configuration
   */
  getConfig(): WidgetConfig | null {
    return this.configSignal();
  }

  /**
   * Get configuration as signal (for reactive updates)
   */
  getConfigSignal() {
    return this.configSignal.asReadonly();
  }

  /**
   * Validate required configuration fields
   */
  private validateConfig(config: WidgetConfig): void {
    const requiredFields: (keyof WidgetConfig)[] = ['jwt', 'tenantId', 'applicationId', 'environment'];
    
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required configuration: ${field}`);
      }
    }

    // Validate JWT format (basic check)
    if (typeof config.jwt !== 'string' || config.jwt.split('.').length !== 3) {
      console.warn('Invalid JWT format detected');
    }

    // Validate environment
    const validEnvironments = ['prod', 'staging', 'dev'];
    if (!validEnvironments.includes(config.environment)) {
      throw new Error(`Invalid environment: ${config.environment}. Must be one of: ${validEnvironments.join(', ')}`);
    }

    // Set defaults
    if (!config.locale) {
      config.locale = 'en-GB';
    }

    if (!config.features) {
      config.features = {
        voice: true,
        showProgress: true,
        allowBackNav: false,
      };
    }
  }

  /**
   * Update theme configuration at runtime
   */
  updateTheme(theme: WidgetConfig['theme']): void {
    const current = this.configSignal();
    if (current) {
      this.configSignal.set({ ...current, theme });
    }
  }

  /**
   * Clear configuration (useful for cleanup)
   */
  clear(): void {
    this.configSignal.set(null);
  }
}

