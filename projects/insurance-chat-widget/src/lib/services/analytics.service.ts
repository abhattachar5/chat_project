import { Injectable, inject } from '@angular/core';
import { WidgetConfigService } from './widget-config.service';
import { AnalyticsEvent } from '../models/widget-config.model';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private configService = inject(WidgetConfigService);

  /**
   * Emit an analytics event to the host-provided callback
   */
  emit(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const config = this.configService.getConfig();
    
    if (!config?.analytics) {
      // Silently fail if no analytics callback provided
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    try {
      config.analytics(fullEvent);
    } catch (error) {
      console.error('Error emitting analytics event:', error);
    }
  }

  /**
   * Helper methods for common events
   */
  viewChatOpened(sessionId: string): void {
    this.emit({
      event: 'view.chat_opened',
      sessionId,
    });
  }

  questionViewed(sessionId: string, questionId: string): void {
    this.emit({
      event: 'question.viewed',
      sessionId,
      questionId,
    });
  }

  answerSubmitted(sessionId: string, questionId: string, inputMode: 'text' | 'voice' | 'file', latencyMs?: number): void {
    this.emit({
      event: 'answer.submitted',
      sessionId,
      questionId,
      inputMode,
      latency_ms: latencyMs,
    });
  }

  asrPartial(sessionId: string, utteranceId: string, text: string, confidence?: number): void {
    this.emit({
      event: 'asr.partial',
      sessionId,
      questionId: utteranceId,
      inputMode: 'voice',
      // Store additional data in event payload
      partialText: text,
      confidence,
    } as AnalyticsEvent);
  }

  asrFinal(sessionId: string, utteranceId: string, text: string, confidence?: number): void {
    this.emit({
      event: 'asr.final',
      sessionId,
      questionId: utteranceId,
      inputMode: 'voice',
      finalText: text,
      confidence,
    } as AnalyticsEvent);
  }

  ttsStart(sessionId: string, questionId: string): void {
    this.emit({
      event: 'tts.start',
      sessionId,
      questionId,
    });
  }

  ttsEnd(sessionId: string, questionId: string): void {
    this.emit({
      event: 'tts.end',
      sessionId,
      questionId,
    });
  }

  errorDisplayed(sessionId: string | undefined, errorCode: string, errorMessage: string): void {
    this.emit({
      event: 'error.displayed',
      sessionId,
      errorCode,
      errorMessage,
    } as AnalyticsEvent);
  }

  // Day 2 Phase 4: Intake Audit Events

  /**
   * Audit event: Upload started
   */
  intakeUploadStarted(sessionId: string, fileId?: string): void {
    this.emit({
      event: 'intake.upload_started',
      sessionId,
      fileId,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Upload finished
   */
  intakeUploadFinished(sessionId: string, fileId: string, durationMs?: number): void {
    this.emit({
      event: 'intake.upload_finished',
      sessionId,
      fileId,
      duration_ms: durationMs,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Upload failed
   */
  intakeUploadFailed(sessionId: string, fileId: string, errorCode: string, errorMessage: string): void {
    this.emit({
      event: 'intake.upload_failed',
      sessionId,
      fileId,
      errorCode,
      errorMessage,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Extraction started
   */
  intakeExtractStarted(sessionId: string, fileId: string): void {
    this.emit({
      event: 'intake.extract_started',
      sessionId,
      fileId,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Extraction finished
   */
  intakeExtractFinished(sessionId: string, fileId: string, durationMs?: number, candidateCount?: number): void {
    this.emit({
      event: 'intake.extract_finished',
      sessionId,
      fileId,
      duration_ms: durationMs,
      candidateCount,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Candidates presented
   */
  intakeCandidatesPresented(sessionId: string, candidateCount: number, averageConfidence?: number): void {
    this.emit({
      event: 'intake.candidates_presented',
      sessionId,
      candidateCount,
      averageConfidence,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Condition confirmed
   */
  intakeConfirmed(sessionId: string, candidateId: string, conditionCode: string): void {
    this.emit({
      event: 'intake.confirmed',
      sessionId,
      candidateId,
      conditionCode,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Condition rejected
   */
  intakeRejected(sessionId: string, candidateId: string, conditionCode: string): void {
    this.emit({
      event: 'intake.rejected',
      sessionId,
      candidateId,
      conditionCode,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Manual condition added
   */
  intakeManualAdd(sessionId: string, conditionCode: string, conditionLabel: string): void {
    this.emit({
      event: 'intake.manual_add',
      sessionId,
      conditionCode,
      conditionLabel,
    } as AnalyticsEvent);
  }

  /**
   * Audit event: Prefill submitted
   */
  intakePrefillSubmitted(sessionId: string, prefillCount: number): void {
    this.emit({
      event: 'intake.prefill_submitted',
      sessionId,
      prefillCount,
    } as AnalyticsEvent);
  }
}

