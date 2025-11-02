import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ApiError } from './api.service';
import { WidgetConfigService } from './widget-config.service';
import { AnalyticsService } from './analytics.service';

export interface ErrorState {
  code: string;
  message: string;
  timestamp: string;
  retryable: boolean;
  severity: 'error' | 'warning' | 'info';
}

export interface ErrorCatalog {
  [key: string]: {
    message: string;
    retryable: boolean;
    severity: 'error' | 'warning' | 'info';
    action?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  private snackBar = inject(MatSnackBar);
  private configService = inject(WidgetConfigService);
  private analyticsService = inject(AnalyticsService);

  // Error catalog mapping
  private errorCatalog: ErrorCatalog = {
    // Network errors
    network_error: {
      message: 'Network error. Please check your connection.',
      retryable: true,
      severity: 'error',
      action: 'retry',
    },
    network_offline: {
      message: 'You\'re offline. We\'ll retry automatically when connection resumes.',
      retryable: true,
      severity: 'warning',
      action: 'wait',
    },

    // Authentication errors
    auth_error: {
      message: 'Authentication failed. Please refresh the page.',
      retryable: false,
      severity: 'error',
    },
    forbidden_error: {
      message: 'Access denied. Please check your permissions.',
      retryable: false,
      severity: 'error',
    },

    // Voice errors
    mic_denied: {
      message: 'Microphone access denied. You can continue by typing.',
      retryable: false,
      severity: 'warning',
      action: 'type_instead',
    },
    asr_unavailable: {
      message: 'Voice service temporarily unavailable. Switching to text mode.',
      retryable: true,
      severity: 'warning',
      action: 'use_text',
    },
    tts_unavailable: {
      message: 'Text-to-speech temporarily unavailable.',
      retryable: true,
      severity: 'info',
    },

    // Server errors
    rules_timeout: {
      message: 'Taking longer than expected. You can retry or continue later.',
      retryable: true,
      severity: 'warning',
      action: 'retry',
    },
    validation_error: {
      message: 'Please check your input and try again.',
      retryable: false,
      severity: 'error',
    },
    not_found: {
      message: 'Resource not found.',
      retryable: false,
      severity: 'error',
    },

    // Generic errors
    unknown_error: {
      message: 'An unexpected error occurred. Please try again.',
      retryable: true,
      severity: 'error',
      action: 'retry',
    },

    // Day 2 Phase 6: Intake-specific errors
    // File upload errors
    upload_error_400: {
      message: 'Invalid file format. Please check the file and try again.',
      retryable: true,
      severity: 'error',
      action: 'retry',
    },
    upload_error_413: {
      message: 'File too large. Maximum size is 20MB. Please use a smaller file.',
      retryable: false,
      severity: 'error',
      action: 'resize_file',
    },
    upload_error_415: {
      message: 'Unsupported file type. Please use PDF, JPG, PNG, or DOCX.',
      retryable: false,
      severity: 'error',
      action: 'convert_file',
    },
    upload_error_0: {
      message: 'Upload failed. Please check your connection and try again.',
      retryable: true,
      severity: 'error',
      action: 'retry',
    },
    upload_timeout: {
      message: 'Upload timeout. Please check your connection and try again.',
      retryable: true,
      severity: 'warning',
      action: 'retry',
    },
    too_many_files: {
      message: 'Maximum 5 files allowed. Please remove some files and try again.',
      retryable: false,
      severity: 'error',
      action: 'remove_files',
    },

    // Extraction errors
    extraction_failed: {
      message: 'Failed to extract conditions from document. Please try uploading again or continue without upload.',
      retryable: true,
      severity: 'warning',
      action: 'retry_or_skip',
    },
    extraction_timeout: {
      message: 'Extraction is taking longer than expected. You can wait or skip this step.',
      retryable: true,
      severity: 'warning',
      action: 'wait_or_skip',
    },
    no_candidates_found: {
      message: 'No medical conditions detected in your documents. You can continue with the interview.',
      retryable: false,
      severity: 'info',
      action: 'continue',
    },
    low_confidence_candidates: {
      message: 'Some conditions have low confidence. Please review carefully.',
      retryable: false,
      severity: 'warning',
      action: 'review',
    },

    // Dictionary search errors
    dictionary_search_failed: {
      message: 'Search temporarily unavailable. You can add conditions manually.',
      retryable: true,
      severity: 'warning',
      action: 'retry',
    },

    // Confirmation errors
    confirmation_failed: {
      message: 'Failed to save your selections. Please try again.',
      retryable: true,
      severity: 'error',
      action: 'retry',
    },
    confirmation_validation_error: {
      message: 'Please select at least one condition or add a new one.',
      retryable: false,
      severity: 'error',
      action: 'select_condition',
    },
  };

  // Current error state
  private currentError = signal<ErrorState | null>(null);

  // Public signal
  error = this.currentError.asReadonly();

  /**
   * Handle error
   */
  handleError(error: ApiError | Error | string, context?: string): ErrorState {
    let errorState: ErrorState;

    if (typeof error === 'string') {
      errorState = this.createErrorState(error, 'Unknown error');
    } else if (error instanceof Error) {
      errorState = this.createErrorState('unknown_error', error.message);
    } else {
      errorState = this.createErrorState(error.code, error.message);
    }

    // Update current error
    this.currentError.set(errorState);

    // Show snackbar
    this.showErrorSnackbar(errorState, context);

    // Analytics
    const config = this.configService.getConfig();
    if (config) {
      this.analyticsService.errorDisplayed(
        context || '',
        errorState.code,
        errorState.message
      );
    }

    return errorState;
  }

  /**
   * Handle network offline state
   */
  handleNetworkOffline(): void {
    const errorState = this.createErrorState('network_offline', 'You\'re offline.');
    this.currentError.set(errorState);
    this.showErrorSnackbar(errorState);
  }

  /**
   * Handle network online state
   */
  handleNetworkOnline(): void {
    this.clearError();
    this.showSuccessSnackbar('Connection restored.');
  }

  /**
   * Clear current error
   */
  clearError(): void {
    this.currentError.set(null);
  }

  /**
   * Check if current error is retryable
   */
  isRetryable(): boolean {
    const error = this.currentError();
    return error?.retryable || false;
  }

  /**
   * Create error state from code and message
   */
  private createErrorState(code: string, message: string): ErrorState {
    const catalogEntry = this.errorCatalog[code] || this.errorCatalog['unknown_error'];

    return {
      code,
      message: catalogEntry.message || message,
      timestamp: new Date().toISOString(),
      retryable: catalogEntry.retryable,
      severity: catalogEntry.severity,
    };
  }

  /**
   * Show error snackbar
   */
  private showErrorSnackbar(errorState: ErrorState, context?: string): void {
    const config: MatSnackBarConfig = {
      duration: errorState.retryable ? 5000 : 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [`ins-snackbar--${errorState.severity}`],
    };

    let message = errorState.message;
    if (context) {
      message = `${context}: ${message}`;
    }

    this.snackBar.open(message, errorState.retryable ? 'Retry' : undefined, config);
  }

  /**
   * Show success snackbar
   */
  private showSuccessSnackbar(message: string): void {
    this.snackBar.open(message, undefined, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['ins-snackbar--success'],
    });
  }

  /**
   * Show info snackbar
   */
  showInfo(message: string, action?: string): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['ins-snackbar--info'],
    });
  }

  /**
   * Show warning snackbar
   */
  showWarning(message: string, action?: string): void {
    this.snackBar.open(message, action, {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['ins-snackbar--warning'],
    });
  }
}

