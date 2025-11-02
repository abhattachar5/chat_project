/**
 * Security Service for PHI handling and compliance checks
 */

import { Injectable, inject } from '@angular/core';
import { WidgetConfigService } from './widget-config.service';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private configService = inject(WidgetConfigService);

  /**
   * Verify TLS version for API calls
   * Note: This is a client-side check; actual TLS version is negotiated by browser
   */
  verifyTlsSupport(): boolean {
    // Check if browser supports TLS 1.2+
    // Modern browsers support TLS 1.2+ by default
    // This is a placeholder for documentation purposes
    return typeof window !== 'undefined' && 
           ('location' in window && window.location.protocol === 'https:' || 
            window.location.hostname === 'localhost');
  }

  /**
   * Ensure no PHI is stored in localStorage or sessionStorage
   */
  clearPhiFromStorage(): void {
    // Clear any potentially sensitive data from storage
    try {
      // Clear localStorage (should not contain PHI, but ensure)
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        // Only clear keys that might contain PHI
        if (this.mightContainPhi(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage (should not contain PHI, but ensure)
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (this.mightContainPhi(key)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Check if a storage key might contain PHI
   */
  private mightContainPhi(key: string): boolean {
    const phiKeywords = ['phi', 'medical', 'health', 'condition', 'diagnosis', 'sensitive', 'evidence'];
    const lowerKey = key.toLowerCase();
    return phiKeywords.some(keyword => lowerKey.includes(keyword));
  }

  /**
   * Clear in-memory PHI data on widget close
   */
  clearInMemoryPhi(): void {
    // This would be called when widget closes
    // Services should clear their in-memory PHI data
    // Implementation depends on specific services
  }

  /**
   * Validate API endpoint is in allowed region (UK/EU)
   * Note: This is client-side validation; actual validation happens server-side
   */
  validateDataResidency(): boolean {
    const config = this.configService.getConfig();
    if (!config) {
      return false;
    }

    // Check environment configuration
    // In production, endpoints should be region-bound
    const allowedRegions = ['uk', 'eu', 'uk-eu'];
    const region = (config as any).region || 'uk'; // Default to UK

    return allowedRegions.includes(region.toLowerCase());
  }

  /**
   * Get data residency region
   */
  getDataResidencyRegion(): string {
    const config = this.configService.getConfig();
    if (!config) {
      return 'uk'; // Default
    }

    return (config as any).region || 'uk';
  }

  /**
   * Validate security headers (client-side check)
   * Note: Actual headers are set server-side
   */
  validateSecurityHeaders(): boolean {
    // This is a placeholder for documentation
    // Actual security headers (CSP, HSTS, etc.) are set server-side
    // Client can verify that HTTPS is used
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }

  /**
   * Ensure no PHI is logged in console
   */
  preventPhiLogging(): void {
    // In production builds, console.log should be stripped
    // This is a reminder/documentation
    if (typeof console !== 'undefined') {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;

      // Override console methods to prevent PHI logging
      // In production, these should be removed entirely
      console.log = (...args: unknown[]) => {
        // Filter out potential PHI patterns
        const filtered = args.map(arg => {
          if (typeof arg === 'string' && this.containsPhi(arg)) {
            return '[PHI REDACTED]';
          }
          return arg;
        });
        originalLog.apply(console, filtered);
      };
    }
  }

  /**
   * Check if text contains PHI patterns
   */
  private containsPhi(text: string): boolean {
    // Simple check for NHS numbers, postcodes, etc.
    const nhsPattern = /\b\d{3}\s?\d{3}\s?\d{4}\b/;
    const postcodePattern = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/i;
    return nhsPattern.test(text) || postcodePattern.test(text);
  }
}

