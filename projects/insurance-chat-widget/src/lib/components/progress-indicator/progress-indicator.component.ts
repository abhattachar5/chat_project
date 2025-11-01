import {
  Component,
  Input,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'ins-progress-indicator',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss'],
})
export class ProgressIndicatorComponent {
  private sessionService = inject(SessionService);

  @Input() showPercentage = true;
  @Input() showBar = true;
  @Input() compact = false;

  // Get progress from session
  progress = computed(() => {
    const session = this.sessionService.session();
    return session?.progress || 0;
  });

  // Percentage display (0-100)
  percentage = computed(() => {
    const progress = this.progress();
    return Math.round(progress * 100);
  });

  // Progress mode (determinate/indeterminate)
  mode = computed(() => {
    const progress = this.progress();
    return progress > 0 ? 'determinate' : 'indeterminate';
  });
}

