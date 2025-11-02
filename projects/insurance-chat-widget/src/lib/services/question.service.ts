import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';
import { PrefillService } from './prefill.service';
import { QuestionEnvelope } from '../models/widget-config.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private sessionService = inject(SessionService);
  private prefillService = inject(PrefillService);

  /**
   * Get current question from session
   */
  getCurrentQuestion(): QuestionEnvelope | null {
    return this.sessionService.question();
  }

  /**
   * Fetch next question
   */
  fetchNextQuestion(): Observable<QuestionEnvelope> {
    return this.sessionService.getNextQuestion();
  }

  /**
   * Check if current question is terminal
   */
  isTerminal(): boolean {
    const question = this.getCurrentQuestion();
    return question?.isTerminal || false;
  }

  /**
   * Get adaptive prompt for first medical history question
   * If prefill exists, returns prompt acknowledging confirmed conditions
   */
  getAdaptivePrompt(): string | null {
    const question = this.getCurrentQuestion();
    
    // Check if question has prefill context
    if (question?.prefillContext?.adaptivePrompt) {
      return question.prefillContext.adaptivePrompt;
    }

    // Check if prefill service has confirmed conditions
    if (this.prefillService.hasPrefillAnswers()) {
      const conditions = this.prefillService.getConfirmedConditionLabels();
      if (conditions.length > 0) {
        // Generate adaptive prompt
        const conditionsText = conditions.join(', ');
        return `We noted ${conditionsText} from your documents. Please confirm this and add any other conditions you'd like to declare.`;
      }
    }

    return null;
  }

  /**
   * Check if current question has prefill context
   */
  hasPrefillContext(): boolean {
    const question = this.getCurrentQuestion();
    return !!(question?.prefillContext?.confirmedConditions?.length);
  }

  /**
   * Get confirmed conditions for current question
   */
  getConfirmedConditions(): string[] {
    const question = this.getCurrentQuestion();
    return question?.prefillContext?.confirmedConditions || [];
  }
}

