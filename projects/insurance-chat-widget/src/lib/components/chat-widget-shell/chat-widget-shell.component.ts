import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  effect,
  runInInjectionContext,
  Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
// WidgetConfigService not needed - services handle config
import { ThemeService } from '../../services/theme.service';
import { AccessibilityService } from '../../services/accessibility.service';
import { SessionService } from '../../services/session.service';
import { QuestionService } from '../../services/question.service';
import { AnswerService } from '../../services/answer.service';
import { ChatMessage } from '../../models/message.model';
import { QuestionEnvelope } from '../../models/widget-config.model';
import { MessageListComponent } from '../message-list/message-list.component';
import { InputBarComponent } from '../input-bar/input-bar.component';
import { TranscriptTabComponent } from '../transcript-tab/transcript-tab.component';
import { ProgressIndicatorComponent } from '../progress-indicator/progress-indicator.component';
import { CompletionScreenComponent } from '../completion-screen/completion-screen.component';
import { NavigationControlsComponent } from '../navigation-controls/navigation-controls.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ins-chat-widget-shell',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MessageListComponent,
    InputBarComponent,
    TranscriptTabComponent,
    ProgressIndicatorComponent,
    CompletionScreenComponent,
    NavigationControlsComponent,
  ],
  templateUrl: './chat-widget-shell.component.html',
  styleUrls: ['./chat-widget-shell.component.scss'],
})
export class ChatWidgetShellComponent implements OnInit, OnDestroy {
  // Config service not used directly - services use it
  private themeService = inject(ThemeService);
  private accessibilityService = inject(AccessibilityService);
  private sessionService = inject(SessionService);
  private questionService = inject(QuestionService);
  private answerService = inject(AnswerService);
  private injector = inject(Injector);
  private subscriptions = new Subscription();

  isExpanded = signal(false);
  
  // Public method to expand widget (for demo/testing)
  expand(): void {
    this.isExpanded.set(true);
  }
  activeTab = signal<'chat' | 'transcript'>('chat');
  messages = signal<ChatMessage[]>([]);
  currentQuestion = computed(() => this.questionService.getCurrentQuestion());
  isLoading = computed(() => this.sessionService.loading());
  error = computed(() => this.sessionService.sessionError());
  sessionId = computed(() => this.sessionService.sessionId());
  isCompleted = computed(() => this.currentQuestion()?.isTerminal || false);
  progress = computed(() => this.sessionService.session()?.progress || 0);
  allowBackNav = signal(false); // Will be set by rules engine

  ngOnInit(): void {
    // Initialize theme and accessibility
    this.themeService.initializeTheme();
    this.themeService.initializeAccessibility();

    // Register keyboard shortcuts
    this.accessibilityService.registerKeyboardShortcut('escape', () => {
      if (this.isExpanded()) {
        this.close();
      }
    });

    // Auto-start session when component initializes
    this.startSession();

    // Watch for question changes - must run in injection context and allow signal writes
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const question = this.currentQuestion();
        if (question) {
          this.addQuestionToMessages(question);
        }
      }, { allowSignalWrites: true });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.accessibilityService.unregisterKeyboardShortcut('escape');
  }

  /**
   * Start a new session
   */
  startSession(): void {
    const consent = {
      recordingAccepted: false, // Will be updated when consent dialog is implemented
      timestamp: new Date().toISOString(),
    };

    const sub = this.sessionService.startSession(consent).subscribe({
      next: () => {
        // Fetch first question
        this.fetchNextQuestion();
      },
      error: (error) => {
        console.error('Failed to start session:', error);
        this.addSystemMessage('Failed to start session. Please try again.');
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Fetch next question
   */
  fetchNextQuestion(): void {
    const sub = this.questionService.fetchNextQuestion().subscribe({
      next: () => {
        // Question will be added to messages via effect
      },
      error: (error) => {
        console.error('Failed to fetch question:', error);
        this.addSystemMessage('Failed to load question. Please try again.');
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Handle answer submission
   */
  onAnswerSubmit(answer: string | number | boolean | string[] | Record<string, unknown>): void {
    const question = this.currentQuestion();
    if (!question || !question.question) {
      console.warn('No current question to submit answer to');
      return;
    }

    // Add user message to chat
    this.addUserMessage(answer.toString());

    // Submit answer
    const sub = this.answerService
      .submitAnswer(question.question.id, answer)
      .subscribe({
        next: (envelope) => {
          console.log('Answer submitted successfully, received envelope:', envelope);
          
          // Check if terminal
          if (envelope.isTerminal) {
            this.addSystemMessage('Thank you! Your interview has been completed.');
          } else if (envelope.question) {
            // Next question will be loaded automatically via effect
            // The effect watches currentQuestion() and will add it to messages
            console.log('Next question received:', envelope.question.prompt);
          } else {
            console.warn('Received envelope without question:', envelope);
          }
        },
        error: (error) => {
          console.error('Failed to submit answer:', error);
          const errorMsg = error.message || 'Failed to submit answer. Please try again.';
          this.addSystemMessage(errorMsg);
        },
      });

    this.subscriptions.add(sub);
  }

  /**
   * Add question to messages
   * Prevents duplicate questions from being added
   */
  private addQuestionToMessages(envelope: QuestionEnvelope): void {
    if (!envelope.question) {
      return;
    }

    // Check if this question was already added to prevent duplicates
    const questionId = envelope.question.id;
    const existingMessage = this.messages().find(
      (msg) => msg.questionId === questionId || msg.id === `question-${questionId}`
    );
    
    if (existingMessage) {
      // Question already exists, skip adding it again
      return;
    }

    const message: ChatMessage = {
      id: `question-${envelope.question.id}`,
      role: 'assistant',
      content: envelope.question.prompt,
      timestamp: new Date().toISOString(),
      questionId: envelope.question.id,
      sensitive: envelope.question.constraints?.sensitive || false,
    };

    this.messages.update((msgs) => [...msgs, message]);
  }

  /**
   * Add user message
   */
  private addUserMessage(content: string): void {
    const message: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    this.messages.update((msgs) => [...msgs, message]);
  }

  /**
   * Add system message
   */
  private addSystemMessage(content: string): void {
    const message: ChatMessage = {
      id: `system-${Date.now()}`,
      role: 'system',
      content,
      timestamp: new Date().toISOString(),
    };

    this.messages.update((msgs) => [...msgs, message]);
  }

  /**
   * Refresh/restart the session
   */
  refresh(): void {
    // Clear messages
    this.messages.set([]);
    
    // Clear session
    this.sessionService.clearSession();
    
    // Restart session
    this.startSession();
  }

  /**
   * Toggle minimize/expand
   */
  toggleMinimize(): void {
    this.isExpanded.update((value) => !value);
  }

  /**
   * Close widget
   */
  close(): void {
    this.isExpanded.set(false);
    
    // End session if active
    if (this.sessionId()) {
      this.sessionService.endSession().subscribe();
    }
  }

  /**
   * Switch tab
   */
  switchTab(tab: 'chat' | 'transcript'): void {
    this.activeTab.set(tab);
  }

  /**
   * Handle back navigation
   */
  onGoBack(): void {
    if (!this.allowBackNav()) {
      return;
    }

    // Navigate to previous question
    // This would fetch the previous question from the orchestrator
    // For now, just log the action
    console.log('Navigate to previous question');
  }

  /**
   * Handle forward navigation
   */
  onGoForward(): void {
    // Navigate to next question
    // This would be used if user wants to skip or go forward
    console.log('Navigate to next question');
  }
}

