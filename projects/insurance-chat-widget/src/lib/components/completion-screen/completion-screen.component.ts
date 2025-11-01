import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ins-completion-screen',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './completion-screen.component.html',
  styleUrls: ['./completion-screen.component.scss'],
})
export class CompletionScreenComponent {
  @Input() title = 'Thank you!';
  @Input() message = 'Your interview has been completed.';
  @Input() showCloseButton = true;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}

