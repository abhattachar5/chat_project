import { ApplicationRef, createComponent, EnvironmentInjector, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { InsuranceChatWidgetModule } from './insurance-chat-widget.module';
import { ChatWidgetShellComponent } from './components/chat-widget-shell/chat-widget-shell.component';
import { WidgetConfigService } from './services/widget-config.service';
import { ThemeService } from './services/theme.service';
import { WidgetConfig } from './models/widget-config.model';

/**
 * Global API for embedding the widget via script tag
 */
export class InsuranceChatWidget {
  private static initialized = false;
  private static appRef: ApplicationRef | null = null;
  private static injector: EnvironmentInjector | null = null;
  private static zone: NgZone | null = null;

  /**
   * Initialize the widget with configuration
   */
  static init(config: WidgetConfig): void {
    if (this.initialized) {
      console.warn('Widget already initialized. Reinitializing...');
    }

    this.initializeAngular().then(() => {
      this.zone!.run(() => {
        const configService = this.injector!.get(WidgetConfigService);
        const themeService = this.injector!.get(ThemeService);

        // Initialize configuration
        configService.init(config);

        // Apply theme
        if (config.theme) {
          themeService.applyTheme(config.theme);
        }

        // Mount component
        this.mountWidget(config.mount);

        this.initialized = true;
      });
    });
  }

  /**
   * End the current session (if any)
   */
  static end(): void {
    // This will be implemented in Phase 2 with session management
    console.log('Ending session...');
  }

  /**
   * Initialize Angular application
   */
  private static async initializeAngular(): Promise<void> {
    if (this.appRef) {
      return Promise.resolve();
    }

    // This is a simplified initialization
    // In a real implementation, you would bootstrap the Angular app properly
    return new Promise((resolve) => {
      // Create injector
      this.zone = new NgZone({ enableLongStackTrace: false });
      this.zone.run(() => {
        // For now, we'll create a simple initialization
        // Full Angular bootstrap will be handled differently for embedding
        resolve();
      });
    });
  }

  /**
   * Mount the widget component
   */
  private static mountWidget(selector?: string): void {
    let mountPoint: HTMLElement;

    if (selector) {
      mountPoint = document.querySelector(selector) as HTMLElement;
      if (!mountPoint) {
        throw new Error(`Mount point not found: ${selector}`);
      }
    } else {
      // Default: append to body
      mountPoint = document.body;
    }

    // Create and mount component
    if (this.injector) {
      const componentRef = createComponent(ChatWidgetShellComponent, {
        hostElement: mountPoint,
        environmentInjector: this.injector,
      });
      this.appRef = componentRef.injector.get(ApplicationRef);
    }
  }
}

// Expose to global window object
declare global {
  interface Window {
    InsuranceChatWidget: typeof InsuranceChatWidget;
  }
}

if (typeof window !== 'undefined') {
  window.InsuranceChatWidget = InsuranceChatWidget;
}

