import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionService } from '../../services/session.service';
import { QuestionService } from '../../services/question.service';

@Component({
  selector: 'ins-navigation-controls',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './navigation-controls.component.html',
  styleUrls: ['./navigation-controls.component.scss'],
})
export class NavigationControlsComponent {
  private sessionService = inject(SessionService);
  private questionService = inject(QuestionService);

  @Input() allowBackNav = signal(false);
  @Input() isFirstQuestion = signal(false);
  @Output() goBack = new EventEmitter<void>();
  @Output() goForward = new EventEmitter<void>();

  // Computed states
  canGoBack = computed(() => {
    return this.allowBackNav() && !this.isFirstQuestion();
  });

  canGoForward = computed(() => {
    return this.allowForwardNav();
  });

  /**
   * Handle back button click
   */
  onBack(): void {
    if (this.canGoBack()) {
      this.goBack.emit();
    }
  }

  /**
   * Handle forward button click
   */
  onForward(): void {
    if (this.canGoForward()) {
      this.goForward.emit();
    }
  }

  /**
   * Get back button tooltip
   */
  getBackTooltip(): string {
    if (!this.allowBackNav()) {
      return 'Back navigation not allowed by rules engine';
    }
    if (this.isFirstQuestion()) {
      return 'This is the first question';
    }
    return 'Go back to previous question';
  }

  /**
   * Get forward button tooltip
   */
  getForwardTooltip(): string {
    return 'Go to next question';
  }
}

