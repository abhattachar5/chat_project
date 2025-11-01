import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceService } from '../../services/voice.service';
import { AccessibilityService } from '../../services/accessibility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ins-vu-meter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vu-meter.component.html',
  styleUrls: ['./vu-meter.component.scss'],
})
export class VUMeterComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() width = 200;
  @Input() height = 40;
  @Input() barCount = 20;
  @Input() showNumeric = false;

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private voiceService = inject(VoiceService);
  private accessibilityService = inject(AccessibilityService);
  private subscriptions = new Subscription();
  private animationFrame: number | null = null;

  audioLevel = signal(0);
  numericLevel = signal(0); // dB value for reduced motion
  isReducedMotion = computed(() => this.accessibilityService.prefersReducedMotion());

  ngOnInit(): void {
    // Watch audio level from voice service
    effect(() => {
      const level = this.voiceService.state().audioLevel;
      this.audioLevel.set(level);
      
      // Convert to dB (-60 to 0 dB range)
      this.numericLevel.set(Math.round((level / 100) * 60 - 60));
    });
  }

  ngAfterViewInit(): void {
    // Only draw animated meter if reduced motion is not preferred
    if (!this.isReducedMotion()) {
      this.drawMeter();
      
      // Subscribe to audio level updates
      const audioSub = this.voiceService.audioLevel$.subscribe(() => {
        this.drawMeter();
      });

      this.subscriptions.add(audioSub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  /**
   * Draw VU meter
   */
  private drawMeter(): void {
    if (!this.canvasRef?.nativeElement) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const width = this.width;
    const height = this.height;
    const barCount = this.barCount;
    const level = this.audioLevel();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw bars
    const barWidth = (width - (barCount - 1) * 2) / barCount;
    const activeBars = Math.floor((level / 100) * barCount);

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + 2);
      const isActive = i < activeBars;
      const barHeight = height * (0.3 + (i / barCount) * 0.7);

      // Color based on level
      let color = '#4caf50'; // Green
      if (i >= barCount * 0.7) {
        color = '#ff9800'; // Orange
      }
      if (i >= barCount * 0.9) {
        color = '#f44336'; // Red
      }

      if (isActive) {
        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = '#e0e0e0';
      }

      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    }
  }

  /**
   * Get numeric display text
   */
  getNumericText(): string {
    const db = this.numericLevel();
    return db >= 0 ? '0 dB' : `${db} dB`;
  }
}

