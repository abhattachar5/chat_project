import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Service for managing internationalization and locale settings
 * This provides a foundation for i18n support. Full Angular i18n
 * can be integrated later for complete translation support.
 */
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private document = inject(DOCUMENT);
  
  // Current locale
  currentLocale = signal<string>('en-GB');
  
  // Translation strings (can be replaced with full i18n later)
  private translations: Record<string, Record<string, string>> = {
    'en-GB': {
      'widget.title': 'InsureChat',
      'widget.subtitle': 'Application interview',
      'widget.open': 'Open chat widget',
      'widget.close': 'Close chat widget',
      'widget.minimize': 'Minimize chat widget',
      'tab.chat': 'Chat',
      'tab.transcript': 'Transcript',
      'message.empty': 'No messages yet. The conversation will begin shortly.',
      'message.assistant': 'Assistant',
      'message.user': 'You',
      'input.placeholder': 'Type your answer...',
      'input.submit': 'Submit answer',
      'input.submit.shortcut': 'Press Enter to submit',
      'input.voice.start': 'Start voice input',
      'input.voice.start.shortcut': 'Press Alt+V to activate',
      'progress.label': 'Interview progress',
      'progress.complete': 'complete',
      'navigation.back': 'Go back to previous question',
      'navigation.forward': 'Go to next question',
      'completion.title': 'Thank you!',
      'completion.message': 'Your interview has been completed.',
      'completion.review': 'You can review your responses in the Transcript tab.',
      'completion.submitted': 'Your interview data has been submitted successfully.',
      'error.retry': 'Retry',
      'error.network': 'Network error. Please check your connection.',
      'error.session': 'Session error. Please try again.',
    },
  };

  constructor() {
    this.initializeLocale();
  }

  /**
   * Initialize locale from browser or config
   */
  private initializeLocale(): void {
    if (this.document?.defaultView?.navigator?.language) {
      const browserLocale = this.document.defaultView.navigator.language;
      // Map common browser locales to supported locales
      if (browserLocale.startsWith('en')) {
        this.currentLocale.set('en-GB');
      } else {
        // Default to en-GB for now
        this.currentLocale.set('en-GB');
      }
    } else {
      this.currentLocale.set('en-GB');
    }
  }

  /**
   * Set locale
   */
  setLocale(locale: string): void {
    if (this.translations[locale]) {
      this.currentLocale.set(locale);
    }
  }

  /**
   * Get translated string
   */
  translate(key: string, params?: Record<string, string>): string {
    const locale = this.currentLocale();
    const translations = this.translations[locale] || this.translations['en-GB'];
    let text = translations[key] || key;

    // Replace parameters
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(`{{${paramKey}}}`, params[paramKey]);
      });
    }

    return text;
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = this.currentLocale();
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return dateObj.toLocaleString(locale, options || defaultOptions);
  }

  /**
   * Format number according to locale
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.currentLocale();
    return number.toLocaleString(locale, options);
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, currency: string = 'GBP', options?: Intl.NumberFormatOptions): string {
    const locale = this.currentLocale();
    const currencyOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      ...options,
    };
    return amount.toLocaleString(locale, currencyOptions);
  }

  /**
   * Get locale-specific date format pattern
   */
  getDateFormatPattern(): string {
    const locale = this.currentLocale();
    // Return pattern based on locale
    switch (locale) {
      case 'en-GB':
        return 'DD/MM/YYYY';
      case 'en-US':
        return 'MM/DD/YYYY';
      default:
        return 'DD/MM/YYYY';
    }
  }

  /**
   * Check if locale is RTL (right-to-left)
   */
  isRTL(): boolean {
    const locale = this.currentLocale();
    // List of RTL locales
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.some((rtl) => locale.startsWith(rtl));
  }
}

