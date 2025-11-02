import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AnswerService } from './answer.service';
import { IntakeService } from './intake.service';
import { SessionService } from './session.service';
import { AnalyticsService } from './analytics.service';
import { AnswerEnvelope, QuestionEnvelope } from '../models/widget-config.model';
import { PrefillAnswer, ConfirmationResponse } from '../models/intake.model';

@Injectable({
  providedIn: 'root',
})
export class PrefillService {
  private answerService = inject(AnswerService);
  private intakeService = inject(IntakeService);
  private sessionService = inject(SessionService);
  private analyticsService = inject(AnalyticsService);

  // Store prefill answers
  private prefillAnswers$ = signal<PrefillAnswer[]>([]);
  public prefillAnswers = this.prefillAnswers$.asObservable();

  // Computed signal for confirmed conditions
  public confirmedConditions = computed(() => {
    return this.prefillAnswers$().map(prefill => ({
      questionId: prefill.questionId,
      answer: prefill.answer,
      evidenceRefs: prefill.evidenceRefs,
      source: 'prefill' as const,
    }));
  });

  /**
   * Store prefill answers from confirmation response
   */
  storePrefillAnswers(response: ConfirmationResponse): void {
    this.prefillAnswers$.set(response.prefill || []);
    
    // Emit analytics event
    const sessionId = this.getSessionId();
    if (sessionId) {
      this.analyticsService.emitEvent({
        event: 'intake.prefill_stored',
        sessionId,
        timestamp: new Date().toISOString(),
        confirmedCount: response.confirmedCount,
        rejectedCount: response.rejectedCount,
      });
    }
  }

  /**
   * Get prefill answers
   */
  getPrefillAnswers(): PrefillAnswer[] {
    return this.prefillAnswers$();
  }

  /**
   * Check if prefill answers exist
   */
  hasPrefillAnswers(): boolean {
    return this.prefillAnswers$().length > 0;
  }

  /**
   * Get prefill answer for a specific question
   */
  getPrefillAnswer(questionId: string): PrefillAnswer | undefined {
    return this.prefillAnswers$().find(prefill => prefill.questionId === questionId);
  }

  /**
   * Submit all prefill answers sequentially
   * Returns the last question envelope after all submissions
   */
  submitPrefillAnswers(sessionId: string): Observable<QuestionEnvelope> {
    const prefillAnswers = this.prefillAnswers$();
    
    if (prefillAnswers.length === 0) {
      return new Observable(observer => {
        observer.error(new Error('No prefill answers to submit'));
      });
    }

    // Submit the first prefill answer (typically there's one main prefill for medical history)
    // The orchestrator should handle merging multiple prefills if needed
    // In production, you might want to submit all sequentially or wait for orchestrator to handle them
    return this.submitPrefillAnswer(sessionId, prefillAnswers[0]);
  }

  /**
   * Submit a single prefill answer
   */
  private submitPrefillAnswer(
    sessionId: string,
    prefill: PrefillAnswer
  ): Observable<QuestionEnvelope> {
    // Day 2 Phase 4: Audit event - Prefill submitted
    this.analyticsService.intakePrefillSubmitted(sessionId, 1);

    // Use AnswerService's submitAnswer which creates the envelope
    return this.answerService.submitAnswer(
      prefill.questionId,
      prefill.answer,
      'file',
      {
        source: 'prefill',
        evidenceRefs: prefill.evidenceRefs,
      } as any
    );
  }

  /**
   * Remove a prefill answer
   */
  removePrefillAnswer(questionId: string): void {
    const current = this.prefillAnswers$();
    const updated = current.filter(prefill => prefill.questionId !== questionId);
    this.prefillAnswers$.set(updated);

    // Emit analytics event
    const sessionId = this.getSessionId();
    if (sessionId) {
      this.analyticsService.emitEvent({
        event: 'intake.prefill_removed',
        sessionId,
        timestamp: new Date().toISOString(),
        questionId,
      });
    }
  }

  /**
   * Update a prefill answer
   */
  updatePrefillAnswer(questionId: string, answer: string | string[]): void {
    const current = this.prefillAnswers$();
    const updated = current.map(prefill =>
      prefill.questionId === questionId
        ? { ...prefill, answer }
        : prefill
    );
    this.prefillAnswers$.set(updated);

    // Emit analytics event
    const sessionId = this.getSessionId();
    if (sessionId) {
      this.analyticsService.emitEvent({
        event: 'intake.prefill_updated',
        sessionId,
        timestamp: new Date().toISOString(),
        questionId,
      });
    }
  }

  /**
   * Clear all prefill answers
   */
  clearPrefillAnswers(): void {
    this.prefillAnswers$.set([]);
  }

  /**
   * Get confirmed condition labels for adaptive prompt
   */
  getConfirmedConditionLabels(): string[] {
    // This would typically come from the confirmation response
    // For now, we'll extract from prefill answers
    return this.prefillAnswers$().map(prefill => {
      if (typeof prefill.answer === 'string') {
        return prefill.answer;
      }
      if (Array.isArray(prefill.answer)) {
        return prefill.answer.join(', ');
      }
      return 'Condition';
    });
  }

  /**
   * Get session ID (helper method)
   */
  private getSessionId(): string | null {
    return this.sessionService.sessionId() || null;
  }
}

