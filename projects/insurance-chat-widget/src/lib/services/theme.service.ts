import { Injectable, inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WidgetConfigService } from './widget-config.service';
import { ThemeConfig } from '../models/widget-config.model';

/**
 * Service for managing theme tokens and CSS custom properties at runtime
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private document = inject(DOCUMENT);
  private configService = inject(WidgetConfigService);
  private rendererFactory = inject(RendererFactory2);

  constructor() {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Apply theme configuration to the document root
   */
  applyTheme(theme: ThemeConfig): void {
    if (!this.document?.documentElement) {
      return;
    }

    const root = this.document.documentElement;

    // Apply palette colors
    if (theme.palette) {
      if (theme.palette.primary) {
        this.renderer.setStyle(root, '--ins-primary', theme.palette.primary);
        this.renderer.setStyle(root, '--mdc-theme-primary', theme.palette.primary);
      }

      if (theme.palette.secondary) {
        this.renderer.setStyle(root, '--ins-secondary', theme.palette.secondary);
        this.renderer.setStyle(root, '--mdc-theme-secondary', theme.palette.secondary);
      }

      if (theme.palette.error) {
        this.renderer.setStyle(root, '--ins-error', theme.palette.error);
        this.renderer.setStyle(root, '--mdc-theme-error', theme.palette.error);
      }

      if (theme.palette.surface) {
        this.renderer.setStyle(root, '--ins-surface', theme.palette.surface);
        this.renderer.setStyle(root, '--mdc-theme-surface', theme.palette.surface);
      }
    }

    // Apply density
    if (theme.density) {
      this.renderer.setAttribute(root, 'data-density', theme.density);
    }

    // Apply dark mode
    if (theme.darkMode !== undefined) {
      if (theme.darkMode) {
        this.renderer.addClass(root, 'dark-mode');
      } else {
        this.renderer.removeClass(root, 'dark-mode');
      }
    }

    // Update Material theme classes
    this.updateMaterialTheme(theme);
  }

  /**
   * Initialize theme from widget configuration
   */
  initializeTheme(): void {
    const config = this.configService.getConfig();
    if (config?.theme) {
      this.applyTheme(config.theme);
    }
  }

  /**
   * Update Material theme classes based on configuration
   */
  private updateMaterialTheme(theme: ThemeConfig): void {
    if (!this.document?.body) {
      return;
    }

    // Material density
    const densityClass = theme.darkMode ? `mat-${theme.density || 'comfortable'}` : `mat-${theme.density || 'comfortable'}`;
    this.renderer.setAttribute(this.document.body, 'data-density', theme.density || 'comfortable');
  }

  /**
   * Get current theme configuration
   */
  getCurrentTheme(): ThemeConfig | null {
    const config = this.configService.getConfig();
    return config?.theme || null;
  }

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion(): boolean {
    if (!this.document?.defaultView) {
      return false;
    }

    const mediaQuery = this.document.defaultView.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  }

  /**
   * Check if high contrast mode is active
   */
  prefersHighContrast(): boolean {
    if (!this.document?.defaultView) {
      return false;
    }

    const mediaQuery = this.document.defaultView.matchMedia('(prefers-contrast: high)');
    return mediaQuery.matches;
  }

  /**
   * Apply reduced motion styles
   */
  applyReducedMotionStyles(): void {
    const root = this.document?.documentElement;
    if (!root) {
      return;
    }

    if (this.prefersReducedMotion()) {
      this.renderer.setAttribute(root, 'data-reduced-motion', 'true');
    } else {
      this.renderer.removeAttribute(root, 'data-reduced-motion');
    }
  }

  /**
   * Apply high contrast styles
   */
  applyHighContrastStyles(): void {
    const root = this.document?.documentElement;
    if (!root) {
      return;
    }

    if (this.prefersHighContrast()) {
      this.renderer.setAttribute(root, 'data-high-contrast', 'true');
    } else {
      this.renderer.removeAttribute(root, 'data-high-contrast');
    }
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibility(): void {
    this.applyReducedMotionStyles();
    this.applyHighContrastStyles();
  }
}

