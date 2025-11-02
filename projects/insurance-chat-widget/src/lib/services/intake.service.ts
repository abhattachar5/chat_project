import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, interval, of } from 'rxjs';
import { catchError, switchMap, takeWhile, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { WidgetConfigService } from './widget-config.service';
import { IdempotencyService } from './idempotency.service';
import { AnalyticsService } from './analytics.service';
import { ExtractionSummary, ConfirmationPayload, ConfirmationResponse } from '../models/intake.model';

@Injectable({
  providedIn: 'root',
})
export class IntakeService {
  private http = inject(HttpClient);
  private apiService = inject(ApiService);
  private configService = inject(WidgetConfigService);
  private idempotencyService = inject(IdempotencyService);
  private analyticsService = inject(AnalyticsService);

  private readonly POLL_INTERVAL = 2000; // Poll every 2 seconds
  private readonly MAX_POLL_TIME = 60000; // Max 60 seconds polling

  /**
   * Get extraction summary for a session
   */
  getExtractionSummary(sessionId: string): Observable<ExtractionSummary> {
    const url = `${this.getBaseUrl()}/v1/intake/summary`;
    const headers = this.getHeaders();
    const params = { sessionId };

    return this.http.get<ExtractionSummary>(url, { headers, params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Poll for extraction summary until completed
   */
  pollExtractionSummary(
    sessionId: string,
    fileId?: string,
    onProgress?: (summary: ExtractionSummary) => void
  ): Observable<ExtractionSummary> {
    const startTime = Date.now();
    let extractStartLogged = false;

    // Day 2 Phase 4: Audit event - Extraction started
    if (fileId) {
      this.analyticsService.intakeExtractStarted(sessionId, fileId);
      extractStartLogged = true;
    }

    return interval(this.POLL_INTERVAL).pipe(
      switchMap(() => this.getExtractionSummary(sessionId)),
      tap(summary => {
        // Log extraction start on first poll if not already logged
        if (!extractStartLogged && fileId && summary.candidates.length > 0) {
          this.analyticsService.intakeExtractStarted(sessionId, fileId);
          extractStartLogged = true;
        }

        // Log extraction finished when status changes to completed
        if (extractStartLogged && fileId && summary.status === 'completed') {
          const duration = Date.now() - startTime;
          const candidateCount = summary.candidates.length;
          const avgConfidence = summary.candidates.length > 0
            ? summary.candidates.reduce((sum, c) => sum + c.confidence, 0) / summary.candidates.length
            : undefined;
          
          this.analyticsService.intakeExtractFinished(sessionId, fileId, duration, candidateCount);
          this.analyticsService.intakeCandidatesPresented(sessionId, candidateCount, avgConfidence);
        }

        if (onProgress) {
          onProgress(summary);
        }
      }),
      takeWhile(
        summary => {
          const elapsed = Date.now() - startTime;
          return (
            summary.extractionStatus === 'processing' &&
            elapsed < this.MAX_POLL_TIME
          );
        },
        true // Inclusive - emit last value
      ),
      map(summary => {
        // Return the last summary with final status
        if (summary.extractionStatus === 'processing' && Date.now() - startTime >= this.MAX_POLL_TIME) {
          return {
            ...summary,
            extractionStatus: 'failed' as const,
            error: 'Extraction timeout. Please try again.',
          };
        }
        return summary;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Submit confirmations
   */
  submitConfirmations(payload: ConfirmationPayload): Observable<ConfirmationResponse> {
    const url = `${this.getBaseUrl()}/v1/intake/confirmations`;
    const headers = this.getHeaders(true);

    return this.http.post<ConfirmationResponse>(url, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get base URL for API
   */
  private getBaseUrl(): string {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Widget not initialized. Call InsuranceChatWidget.init() first.');
    }

    const baseUrls: Record<string, string> = {
      prod: 'https://api.provider.example',
      staging: 'https://api-staging.provider.example',
      dev: 'https://api-dev.provider.example',
    };

    return baseUrls[config.environment] || baseUrls.dev;
  }

  /**
   * Get headers for request
   */
  private getHeaders(requireIdempotency = false): HttpHeaders {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Widget not initialized');
    }

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.jwt}`,
    });

    if (requireIdempotency) {
      const idempotencyKey = this.idempotencyService.generateKey();
      headers = headers.set('Idempotency-Key', idempotencyKey);
    }

    return headers;
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';
    let errorCode = 'unknown_error';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      errorCode = 'client_error';
    } else {
      // Server-side error
      errorCode = `http_${error.status}`;

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request';
          errorCode = 'invalid_request';
          break;
        case 404:
          errorMessage = 'Extraction summary not found';
          errorCode = 'not_found';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation failed';
          errorCode = 'validation_error';
          break;
        case 0:
          errorMessage = 'Network error. Please check your connection.';
          errorCode = 'network_error';
          break;
        default:
          errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }

    const apiError = {
      code: errorCode,
      message: errorMessage,
      status: error.status,
    };

    return throwError(() => apiError);
  };
}

