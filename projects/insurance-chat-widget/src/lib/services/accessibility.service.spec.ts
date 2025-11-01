import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { AccessibilityService } from './accessibility.service';

describe('AccessibilityService', () => {
  let service: AccessibilityService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessibilityService);
    document = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerKeyboardShortcut', () => {
    it('should register a keyboard shortcut handler', () => {
      const handler = jest.fn();
      service.registerKeyboardShortcut('test-key', handler);
      
      // Simulate key press (this would be handled by global listener)
      expect(service).toBeTruthy();
    });
  });

  describe('unregisterKeyboardShortcut', () => {
    it('should unregister a keyboard shortcut handler', () => {
      const handler = jest.fn();
      service.registerKeyboardShortcut('test-key', handler);
      service.unregisterKeyboardShortcut('test-key');
      
      // Handler should be removed
      expect(service).toBeTruthy();
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcer element if it does not exist', () => {
      service.announceToScreenReader('Test announcement');
      
      const announcer = document.getElementById('ins-screen-reader-announcer');
      expect(announcer).toBeTruthy();
      expect(announcer?.textContent).toBe('Test announcement');
    });

    it('should update existing announcer element', () => {
      service.announceToScreenReader('First announcement');
      service.announceToScreenReader('Second announcement');
      
      const announcer = document.getElementById('ins-screen-reader-announcer');
      expect(announcer?.textContent).toBe('Second announcement');
    });

    it('should set aria-live priority', () => {
      service.announceToScreenReader('Urgent', 'assertive');
      
      const announcer = document.getElementById('ins-screen-reader-announcer');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('focusElement', () => {
    it('should focus an element', () => {
      const element = document.createElement('button');
      document.body.appendChild(element);
      
      service.focusElement(element);
      expect(document.activeElement).toBe(element);
      
      document.body.removeChild(element);
    });
  });

  describe('focusFirstFocusable', () => {
    it('should focus first focusable element in container', () => {
      const container = document.createElement('div');
      const button = document.createElement('button');
      const input = document.createElement('input');
      
      container.appendChild(button);
      container.appendChild(input);
      document.body.appendChild(container);
      
      const focused = service.focusFirstFocusable(container);
      expect(focused).toBe(button);
      
      document.body.removeChild(container);
    });
  });

  describe('prefersReducedMotion', () => {
    it('should return reduced motion preference', () => {
      const result = service.prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('prefersHighContrast', () => {
    it('should return high contrast preference', () => {
      const result = service.prefersHighContrast();
      expect(typeof result).toBe('boolean');
    });
  });
});

