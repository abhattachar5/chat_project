import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  signal,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ChatMessage, MessageRole } from '../../models/message.model';
import { QuestionEnvelope } from '../../models/widget-config.model';

@Component({
  selector: 'ins-message-list',
  standalone: true,
  imports: [CommonModule, ScrollingModule, MatCardModule, MatIconModule],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss'],
})
export class MessageListComponent implements OnInit, OnDestroy {
  @Input() messages = signal<ChatMessage[]>([]);
  @Input() currentQuestion: QuestionEnvelope | null = null;

  private cdr = inject(ChangeDetectorRef);
  private scrollContainer: HTMLElement | null = null;

  ngOnInit(): void {
    // Auto-scroll to bottom when new messages are added
    this.messages().forEach(() => {
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  /**
   * Scroll to bottom of message list
   */
  scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
    }
  }

  /**
   * Set scroll container reference
   */
  setScrollContainer(element: HTMLElement): void {
    this.scrollContainer = element;
  }

  /**
   * Get message role class
   */
  getMessageRoleClass(role: MessageRole): string {
    return `ins-message--${role}`;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  /**
   * Check if should show timestamp
   */
  shouldShowTimestamp(index: number): boolean {
    if (index === 0) return true;

    const current = this.messages()[index];
    const previous = this.messages()[index - 1];

    if (!previous) return true;

    const currentTime = new Date(current.timestamp).getTime();
    const previousTime = new Date(previous.timestamp).getTime();
    const diffMins = (currentTime - previousTime) / 60000;

    // Show timestamp if more than 5 minutes difference
    return diffMins > 5;
  }

  /**
   * Mask sensitive content
   */
  maskContent(content: string, isSensitive: boolean): string {
    if (!isSensitive) {
      return content;
    }
    // Simple masking - replace characters with • except spaces and punctuation
    return content.replace(/[A-Za-z0-9]/g, '•');
  }
}

