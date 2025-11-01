import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VoiceService } from '../../services/voice.service';
import { Subscription } from 'rxjs';

export type MicButtonState = 'idle' | 'listening' | 'processing' | 'error';

@Component({
  selector: 'ins-mic-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './mic-button.component.html',
  styleUrls: ['./mic-button.component.scss'],
})
export class MicButtonComponent implements OnInit, OnDestroy {
  @Input() disabled = signal(false);
  @Input() silenceTimeout = 5000; // 5 seconds default
  @Output() captureStart = new EventEmitter<void>();
  @Output() captureStop = new EventEmitter<void>();
  @Output() captureCancel = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();

  private voiceService = inject(VoiceService);
  private subscriptions = new Subscription();
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastAudioLevel = 0;
  private silenceStartTime: number | null = null;

  // State management
  state = signal<MicButtonState>('idle');
  audioLevel = signal(0);

  ngOnInit(): void {
    // Watch voice service state
    effect(() => {
      const voiceState = this.voiceService.state();
      
      if (voiceState.isCapturing) {
        this.state.set('listening');
      } else if (voiceState.isProcessing) {
        this.state.set('processing');
      } else if (voiceState.error) {
        this.state.set('error');
        this.error.emit(voiceState.error);
      } else {
        this.state.set('idle');
      }

      this.audioLevel.set(voiceState.audioLevel);
    });

    // Subscribe to audio level for silence detection
    const audioSub = this.voiceService.audioLevel$.subscribe((level) => {
      this.audioLevel.set(level);
      this.lastAudioLevel = level;
      this.checkSilence(level);
    });

    this.subscriptions.add(audioSub);

    // Subscribe to capture stop
    const stopSub = this.voiceService.captureStop$.subscribe(() => {
      this.stopCapture();
    });

    this.subscriptions.add(stopSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.clearSilenceTimer();
  }

  /**
   * Handle button press (mouse or touch)
   */
  async onPress(): Promise<void> {
    if (this.disabled() || this.state() === 'processing') {
      return;
    }

    const started = await this.voiceService.startCapture();
    if (started) {
      this.captureStart.emit();
      this.state.set('listening');
      this.silenceStartTime = null;
      this.startSilenceTimer();
    }
  }

  /**
   * Handle button release
   */
  onRelease(): void {
    if (this.state() === 'listening') {
      this.voiceService.stopCapture();
      this.captureStop.emit();
      this.clearSilenceTimer();
      this.state.set('idle');
    }
  }

  /**
   * Handle button cancel
   */
  onCancel(): void {
    if (this.state() === 'listening' || this.state() === 'processing') {
      this.voiceService.stopCapture();
      this.captureCancel.emit();
      this.clearSilenceTimer();
      this.state.set('idle');
    }
  }

  /**
   * Stop capture
   */
  stopCapture(): void {
    this.voiceService.stopCapture();
    this.clearSilenceTimer();
    this.state.set('idle');
  }

  /**
   * Get icon based on state
   */
  getIcon(): string {
    switch (this.state()) {
      case 'listening':
        return 'mic';
      case 'processing':
        return 'hourglass_empty';
      case 'error':
        return 'mic_off';
      default:
        return 'mic';
    }
  }

  /**
   * Get tooltip text based on state
   */
  getTooltip(): string {
    switch (this.state()) {
      case 'idle':
        return 'Hold to speak, release to finish (Alt+V)';
      case 'listening':
        return 'Recording... Release to finish';
      case 'processing':
        return 'Processing audio...';
      case 'error':
        return 'Microphone error. Click to retry.';
      default:
        return 'Voice input';
    }
  }

  /**
   * Get button color
   */
  getColor(): string {
    switch (this.state()) {
      case 'listening':
        return 'warn';
      case 'error':
        return 'warn';
      default:
        return 'primary';
    }
  }

  /**
   * Check if button should show pulse animation
   */
  shouldPulse(): boolean {
    return this.state() === 'listening' && this.audioLevel() > 20;
  }

  /**
   * Start silence detection timer
   */
  private startSilenceTimer(): void {
    this.clearSilenceTimer();
    this.silenceStartTime = Date.now();
  }

  /**
   * Check for silence and auto-stop if timeout reached
   */
  private checkSilence(level: number): void {
    const silenceThreshold = 10; // Below 10% is considered silence

    if (level < silenceThreshold) {
      if (!this.silenceStartTime) {
        this.silenceStartTime = Date.now();
      } else {
        const silenceDuration = Date.now() - this.silenceStartTime;
        if (silenceDuration >= this.silenceTimeout) {
          // Auto-stop after silence timeout
          this.onRelease();
        }
      }
    } else {
      // Reset silence timer if audio detected
      this.silenceStartTime = null;
    }
  }

  /**
   * Clear silence timer
   */
  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.silenceStartTime = null;
  }

  /**
   * Handle keyboard shortcut (Alt+V)
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.altKey && event.key === 'v' && !this.disabled()) {
      event.preventDefault();
      if (this.state() === 'idle') {
        this.onPress();
      } else if (this.state() === 'listening') {
        this.onRelease();
      }
    }

    // Escape to cancel
    if (event.key === 'Escape' && (this.state() === 'listening' || this.state() === 'processing')) {
      event.preventDefault();
      this.onCancel();
    }
  }
}

