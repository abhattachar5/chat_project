import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { WidgetConfigService } from './widget-config.service';
import { AnalyticsService } from './analytics.service';
import { Session, StartSessionRequest, QuestionEnvelope } from '../models/widget-config.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private apiService = inject(ApiService);
  private configService = inject(WidgetConfigService);
  private analyticsService = inject(AnalyticsService);

  // Session state
  private currentSession = signal<Session | null>(null);
  private currentQuestion = signal<QuestionEnvelope | null>(null);
  private isLoading = signal(false);
  private error = signal<string | null>(null);

  // Public signals
  session = this.currentSession.asReadonly();
  question = this.currentQuestion.asReadonly();
  loading = this.isLoading.asReadonly();
  sessionError = this.error.asReadonly();

  // Computed signals
  isActive = computed(() => {
    const session = this.currentSession();
    return session?.status === 'active';
  });

  isCompleted = computed(() => {
    const session = this.currentSession();
    return session?.status === 'completed';
  });

  sessionId = computed(() => {
    return this.currentSession()?.id || null;
  });

  /**
   * Start a new interview session
   */
  startSession(consent: { recordingAccepted: boolean; timestamp: string }): Observable<Session> {
    const config = this.configService.getConfig();
    if (!config) {
      return throwError(() => new Error('Widget not initialized'));
    }

    this.isLoading.set(true);
    this.error.set(null);

    const request: StartSessionRequest = {
      tenantId: config.tenantId,
      applicationId: config.applicationId,
      locale: config.locale || 'en-GB',
      theme: config.theme,
      consent,
    };

    return this.apiService.startSession(request).pipe(
      tap((session) => {
        this.currentSession.set(session);
        this.isLoading.set(false);
        this.analyticsService.viewChatOpened(session.id);
      }),
      catchError((error) => {
        this.error.set(error.message || 'Failed to start session');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current session status
   */
  getSession(): Observable<Session> {
    const sessionId = this.sessionId();
    if (!sessionId) {
      return throwError(() => new Error('No active session'));
    }

    return this.apiService.getSession(sessionId).pipe(
      tap((session) => {
        this.currentSession.set(session);
      }),
      catchError((error) => {
        this.error.set(error.message || 'Failed to get session');
        return throwError(() => error);
      })
    );
  }

  /**
   * End/cancel the current session
   */
  endSession(): Observable<void> {
    const sessionId = this.sessionId();
    if (!sessionId) {
      return throwError(() => new Error('No active session'));
    }

    this.isLoading.set(true);

    return this.apiService.endSession(sessionId).pipe(
      tap(() => {
        this.currentSession.set(null);
        this.currentQuestion.set(null);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        this.error.set(error.message || 'Failed to end session');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the next question
   */
  getNextQuestion(): Observable<QuestionEnvelope> {
    const sessionId = this.sessionId();
    if (!sessionId) {
      return throwError(() => new Error('No active session'));
    }

    this.isLoading.set(true);
    this.error.set(null);

    return this.apiService.getNextQuestion(sessionId).pipe(
      tap((envelope) => {
        this.currentQuestion.set(envelope);
        this.isLoading.set(false);

        // Analytics
        if (envelope.question?.id) {
          this.analyticsService.questionViewed(sessionId, envelope.question.id);
        }
      }),
      catchError((error) => {
        this.error.set(error.message || 'Failed to get next question');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Set current question (for programmatic updates)
   */
  setCurrentQuestion(envelope: QuestionEnvelope | null): void {
    this.currentQuestion.set(envelope);
    
    // Update session progress if provided in envelope
    if (envelope?.progress !== undefined && this.currentSession()) {
      this.currentSession.set({
        ...this.currentSession()!,
        progress: envelope.progress,
      });
    }
  }

  /**
   * Clear session and reset state
   */
  clearSession(): void {
    this.currentSession.set(null);
    this.currentQuestion.set(null);
    this.error.set(null);
    this.isLoading.set(false);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }
}

