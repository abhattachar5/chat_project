import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { WidgetConfigService } from './widget-config.service';
import { IdempotencyService } from './idempotency.service';
import {
  StartSessionRequest,
  Session,
  QuestionEnvelope,
  AnswerEnvelope,
  ValidationError,
  Transcript,
} from '../models/widget-config.model';

export interface ApiError {
  code: string;
  message: string;
  status?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private configService = inject(WidgetConfigService);
  private idempotencyService = inject(IdempotencyService);

  /**
   * Get base URL for API based on environment
   */
  private getBaseUrl(): string {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Widget not initialized. Call InsuranceChatWidget.init() first.');
    }

    // If custom API URL is provided, use it (for demo/testing)
    if (config.apiBaseUrl) {
      return config.apiBaseUrl;
    }

    // In production, this would come from tenant configuration
    const baseUrls: Record<string, string> = {
      prod: 'https://api.provider.example',
      staging: 'https://api-staging.provider.example',
      dev: 'https://api-dev.provider.example',
    };

    return baseUrls[config.environment] || baseUrls.dev;
  }

  /**
   * Get default headers with JWT and idempotency key
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
   * Start a new session
   */
  startSession(request: StartSessionRequest): Observable<Session> {
    const url = `${this.getBaseUrl()}/v1/sessions`;
    const headers = this.getHeaders(true);

    return this.http.post<Session>(url, request, { headers }).pipe(
      retry({
        count: 3,
        delay: (_error: HttpErrorResponse, retryCount: number) => {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, retryCount) * 1000;
          return timer(delay);
        },
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get session status
   */
  getSession(sessionId: string): Observable<Session> {
    const url = `${this.getBaseUrl()}/v1/sessions/${sessionId}`;
    const headers = this.getHeaders();

    return this.http.get<Session>(url, { headers }).pipe(catchError(this.handleError));
  }

  /**
   * End/cancel session
   */
  endSession(sessionId: string): Observable<void> {
    const url = `${this.getBaseUrl()}/v1/sessions/${sessionId}`;
    const headers = this.getHeaders();

    return this.http.delete<void>(url, { headers }).pipe(catchError(this.handleError));
  }

  /**
   * Get next question
   */
  getNextQuestion(sessionId: string): Observable<QuestionEnvelope> {
    const url = `${this.getBaseUrl()}/v1/sessions/${sessionId}/next-question`;
    const headers = this.getHeaders();

    return this.http.get<QuestionEnvelope>(url, { headers }).pipe(catchError(this.handleError));
  }

  /**
   * Submit answer
   */
  submitAnswer(sessionId: string, answer: AnswerEnvelope): Observable<QuestionEnvelope> {
    const url = `${this.getBaseUrl()}/v1/sessions/${sessionId}/answers`;
    const headers = this.getHeaders(true);

    return this.http.post<{ accepted: boolean; nextQuestion: QuestionEnvelope & { progress?: number } }>(url, answer, { headers }).pipe(
      map((response) => {
        const envelope = response.nextQuestion;
        return {
          ...envelope,
          sessionId, // Ensure sessionId is included
        };
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get transcript
   */
  getTranscript(sessionId: string): Observable<Transcript> {
    const url = `${this.getBaseUrl()}/v1/sessions/${sessionId}/transcript`;
    const headers = this.getHeaders();

    return this.http.get<Transcript>(url, { headers }).pipe(catchError(this.handleError));
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
      
      if (error.status === 422) {
        // Validation error
        const validationError = error.error as ValidationError;
        errorMessage = validationError.message || 'Validation failed';
        errorCode = validationError.code || 'validation_error';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please check your JWT token.';
        errorCode = 'auth_error';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
        errorCode = 'forbidden_error';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
        errorCode = 'not_found';
      } else if (error.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
        errorCode = 'network_error';
      } else {
        errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }

    const apiError: ApiError = {
      code: errorCode,
      message: errorMessage,
      status: error.status,
    };

    return throwError(() => apiError);
  };
}

