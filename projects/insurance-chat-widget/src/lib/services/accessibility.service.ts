import { Injectable, inject, signal, effect, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Service for managing accessibility features including keyboard navigation,
 * focus management, and screen reader support
 */
@Injectable({
  providedIn: 'root',
})
export class AccessibilityService implements OnDestroy {
  private document = inject(DOCUMENT);
  private keyListeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  private focusHistory: HTMLElement[] = [];
  private currentFocusElement: HTMLElement | null = null;

  // Signals for accessibility state
  isReducedMotion = signal(false);
  isHighContrast = signal(false);

  constructor() {
    this.initializeMediaQueries();
    this.setupGlobalKeyboardHandlers();
  }

  ngOnDestroy(): void {
    this.removeGlobalKeyboardHandlers();
  }

  /**
   * Initialize media queries for accessibility preferences
   */
  private initializeMediaQueries(): void {
    if (!this.document?.defaultView) {
      return;
    }

    // Check prefers-reduced-motion
    const reducedMotionQuery = this.document.defaultView.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion.set(reducedMotionQuery.matches);
    reducedMotionQuery.addEventListener('change', (e) => {
      this.isReducedMotion.set(e.matches);
      this.applyReducedMotionStyles();
    });

    // Check prefers-contrast (high contrast mode)
    const highContrastQuery = this.document.defaultView.matchMedia('(prefers-contrast: high)');
    this.isHighContrast.set(highContrastQuery.matches);
    highContrastQuery.addEventListener('change', (e) => {
      this.isHighContrast.set(e.matches);
      this.applyHighContrastStyles();
    });

    // Apply initial styles
    this.applyReducedMotionStyles();
    this.applyHighContrastStyles();
  }

  /**
   * Apply reduced motion styles
   */
  private applyReducedMotionStyles(): void {
    const root = this.document?.documentElement;
    if (!root) {
      return;
    }

    if (this.isReducedMotion()) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }
  }

  /**
   * Apply high contrast styles
   */
  private applyHighContrastStyles(): void {
    const root = this.document?.documentElement;
    if (!root) {
      return;
    }

    if (this.isHighContrast()) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }
  }

  /**
   * Setup global keyboard handlers
   */
  private setupGlobalKeyboardHandlers(): void {
    if (!this.document?.defaultView) {
      return;
    }

    this.document.defaultView.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
  }

  /**
   * Remove global keyboard handlers
   */
  private removeGlobalKeyboardHandlers(): void {
    if (!this.document?.defaultView) {
      return;
    }

    this.document.defaultView.removeEventListener('keydown', this.handleGlobalKeyDown.bind(this));
  }

  /**
   * Handle global keyboard events
   */
  private handleGlobalKeyDown(event: KeyboardEvent): void {
    // Handle Escape key for closing modals/dialogs
    if (event.key === 'Escape') {
      const handler = this.keyListeners.get('escape');
      if (handler) {
        handler(event);
      }
    }

    // Handle Tab key for focus management
    if (event.key === 'Tab' && !event.shiftKey) {
      this.handleFocusForward(event);
    } else if (event.key === 'Tab' && event.shiftKey) {
      this.handleFocusBackward(event);
    }

    // Handle Alt+V for voice input (global shortcut)
    if (event.altKey && event.key.toLowerCase() === 'v' && !event.ctrlKey && !event.metaKey) {
      const handler = this.keyListeners.get('alt-v');
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    }
  }

  /**
   * Register a keyboard shortcut handler
   */
  registerKeyboardShortcut(key: string, handler: (event: KeyboardEvent) => void): void {
    this.keyListeners.set(key, handler);
  }

  /**
   * Unregister a keyboard shortcut handler
   */
  unregisterKeyboardShortcut(key: string): void {
    this.keyListeners.delete(key);
  }

  /**
   * Handle forward tab navigation
   */
  private handleFocusForward(event: KeyboardEvent): void {
    // Focus trap logic can be added here
    // For now, we just track focus
    const activeElement = this.document?.activeElement as HTMLElement;
    if (activeElement) {
      this.focusHistory.push(activeElement);
      this.currentFocusElement = activeElement;
    }
  }

  /**
   * Handle backward tab navigation (Shift+Tab)
   */
  private handleFocusBackward(event: KeyboardEvent): void {
    // Focus trap logic can be added here
    const activeElement = this.document?.activeElement as HTMLElement;
    if (activeElement) {
      this.focusHistory.push(activeElement);
      this.currentFocusElement = activeElement;
    }
  }

  /**
   * Announce a message to screen readers
   */
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = this.document?.getElementById('ins-screen-reader-announcer');
    if (!announcer) {
      // Create announcer if it doesn't exist
      const div = this.document?.createElement('div');
      if (!div) {
        return;
      }
      div.id = 'ins-screen-reader-announcer';
      div.className = 'ins-sr-only';
      div.setAttribute('role', 'status');
      div.setAttribute('aria-live', priority);
      div.setAttribute('aria-atomic', 'true');
      this.document?.body.appendChild(div);
      div.textContent = message;
    } else {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
    }

    // Clear the message after a delay to allow re-announcement
    setTimeout(() => {
      const el = this.document?.getElementById('ins-screen-reader-announcer');
      if (el) {
        el.textContent = '';
      }
    }, 1000);
  }

  /**
   * Move focus to an element
   */
  focusElement(element: HTMLElement | null): void {
    if (element && typeof element.focus === 'function') {
      element.focus();
      this.currentFocusElement = element;
    }
  }

  /**
   * Move focus to first focusable element in a container
   */
  focusFirstFocusable(container: HTMLElement): HTMLElement | null {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstFocusable = focusableElements[0] || null;

    if (firstFocusable) {
      this.focusElement(firstFocusable);
    }

    return firstFocusable;
  }

  /**
   * Get all focusable elements in a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  }

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion(): boolean {
    return this.isReducedMotion();
  }

  /**
   * Check if high contrast mode is active
   */
  prefersHighContrast(): boolean {
    return this.isHighContrast();
  }
}

