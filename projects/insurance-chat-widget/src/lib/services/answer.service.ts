import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService, ApiError } from './api.service';
import { SessionService } from './session.service';
import { AnalyticsService } from './analytics.service';
import { AnswerEnvelope, QuestionEnvelope, ValidationError } from '../models/widget-config.model';

@Injectable({
  providedIn: 'root',
})
export class AnswerService {
  private apiService = inject(ApiService);
  private sessionService = inject(SessionService);
  private analyticsService = inject(AnalyticsService);

  /**
   * Submit an answer
   */
  submitAnswer(
    questionId: string,
    answer: string | number | boolean | string[] | Record<string, unknown>,
    inputMode: 'text' | 'voice' | 'file' = 'text',
    meta?: { asrConfidence?: number; rawAudioRef?: string }
  ): Observable<QuestionEnvelope> {
    const sessionId = this.sessionService.sessionId();
    if (!sessionId) {
      return throwError(() => new Error('No active session'));
    }

    const startTime = Date.now();

    const answerEnvelope: AnswerEnvelope = {
      questionId,
      answer,
      inputMode,
      timestamp: new Date().toISOString(),
      meta,
    };

    return this.apiService.submitAnswer(sessionId, answerEnvelope).pipe(
      tap((envelope) => {
        const latency = Date.now() - startTime;

        // Update session with next question
        this.sessionService.setCurrentQuestion(envelope);

        // Analytics
        this.analyticsService.answerSubmitted(sessionId, questionId, inputMode, latency);
      }),
      catchError((error: ApiError) => {
        // Handle validation errors
        if (error.status === 422) {
          // Validation error - will be handled by component
          const sessionId = this.sessionService.sessionId();
          if (sessionId) {
            this.analyticsService.errorDisplayed(sessionId, error.code, error.message);
          }
        }

        return throwError(() => error);
      })
    );
  }
}

