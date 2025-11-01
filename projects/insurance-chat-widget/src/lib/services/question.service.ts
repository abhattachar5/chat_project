import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';
import { QuestionEnvelope } from '../models/widget-config.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private sessionService = inject(SessionService);

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
}

