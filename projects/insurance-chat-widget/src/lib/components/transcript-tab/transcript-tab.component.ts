import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { SessionService } from '../../services/session.service';
import { ApiService } from '../../services/api.service';
import { Transcript, TranscriptItem } from '../../models/widget-config.model';
import { Subscription } from 'rxjs';

export type TranscriptFilter = 'all' | 'user' | 'assistant' | 'system';

@Component({
  selector: 'ins-transcript-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonToggleModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './transcript-tab.component.html',
  styleUrls: ['./transcript-tab.component.scss'],
})
export class TranscriptTabComponent implements OnInit, OnDestroy {
  private sessionService = inject(SessionService);
  private apiService = inject(ApiService);
  private subscriptions = new Subscription();

  // Transcript data
  transcript = signal<Transcript | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Filter and search
  selectedFilter = signal<TranscriptFilter>('all');
  searchQuery = signal<string>('');

  // Computed filtered transcript
  filteredTranscript = computed(() => {
    const transcriptData = this.transcript();
    if (!transcriptData || !transcriptData.items) {
      return [];
    }

    let items = [...transcriptData.items];

    // Apply filter
    const filter = this.selectedFilter();
    if (filter !== 'all') {
      items = items.filter((item) => item.role === filter);
    }

    // Apply search
    const search = this.searchQuery().toLowerCase().trim();
    if (search) {
      items = items.filter((item) => {
        const text = item.text.toLowerCase();
        return text.includes(search);
      });
    }

    return items;
  });

  // Get session ID
  sessionId = computed(() => this.sessionService.sessionId());

  ngOnInit(): void {
    // Load transcript when component initializes
    effect(() => {
      const sessionId = this.sessionId();
      if (sessionId) {
        this.loadTranscript();
      }
    });

    // Reload transcript when session changes
    const sessionSub = this.sessionService.session().subscribe(() => {
      this.loadTranscript();
    });

    this.subscriptions.add(sessionSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load transcript from API
   */
  loadTranscript(): void {
    const sessionId = this.sessionId();
    if (!sessionId) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const sub = this.apiService.getTranscript(sessionId).subscribe({
      next: (transcript) => {
        this.transcript.set(transcript);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to load transcript');
        this.isLoading.set(false);
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Set filter
   */
  setFilter(filter: TranscriptFilter): void {
    this.selectedFilter.set(filter);
  }

  /**
   * Update search query
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchQuery.set('');
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
      user: 'You',
      assistant: 'Assistant',
      system: 'System',
      rules: 'Rules Engine',
      widget: 'Widget',
    };
    return roleMap[role] || role;
  }

  /**
   * Get role icon
   */
  getRoleIcon(role: string): string {
    const iconMap: Record<string, string> = {
      user: 'person',
      assistant: 'smart_toy',
      system: 'info',
      rules: 'settings',
      widget: 'widgets',
    };
    return iconMap[role] || 'circle';
  }

  /**
   * Copy transcript item to clipboard
   */
  async copyToClipboard(item: TranscriptItem): Promise<void> {
    const text = item.redacted ? this.getMaskedText(item.text) : item.text;

    try {
      await navigator.clipboard.writeText(text);
      // Could show a snackbar here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  /**
   * Get masked text for sensitive items
   */
  private getMaskedText(text: string): string {
    // Simple masking - replace characters with • except spaces and punctuation
    return text.replace(/[A-Za-z0-9]/g, '•');
  }

  /**
   * Check if item is sensitive
   */
  isSensitive(item: TranscriptItem): boolean {
    return item.redacted || false;
  }

  /**
   * Get masked display text
   */
  getDisplayText(item: TranscriptItem): string {
    if (this.isSensitive(item)) {
      return this.getMaskedText(item.text);
    }
    return item.text;
  }

  /**
   * Refresh transcript
   */
  refresh(): void {
    this.loadTranscript();
  }

  /**
   * Get masked text for sensitive items
   */
  getMaskedText(text: string): string {
    // Simple masking - replace characters with • except spaces and punctuation
    return text.replace(/[A-Za-z0-9]/g, '•');
  }
}

