import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  effect,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Question, QuestionConstraints } from '../../models/widget-config.model';
import { MicButtonComponent } from '../mic-button/mic-button.component';
import { VUMeterComponent } from '../vu-meter/vu-meter.component';

@Component({
  selector: 'ins-input-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MicButtonComponent,
    VUMeterComponent,
  ],
  templateUrl: './input-bar.component.html',
  styleUrls: ['./input-bar.component.scss'],
})
export class InputBarComponent implements OnInit {
  @Input() question: Question | null = null;
  @Input() isLoading = signal(false);
  @Input() error: string | null = null;
  @Input() partialTranscript = signal<string | null>(null);
  @Input() showMicButton = signal(false);
  @Output() submitAnswer = new EventEmitter<string | number | boolean | string[] | Record<string, unknown>>();
  @Output() cancel = new EventEmitter<void>();
  @Output() micStart = new EventEmitter<void>();
  @Output() micStop = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  inputForm!: FormGroup;

  // Signals for UI state
  showHint = signal(false);
  showError = signal(false);
  errorMessage = signal<string | null>(null);
  isVoiceMode = signal(false);

  ngOnInit(): void {
    this.initializeForm();
    
    // React to question changes
    effect(() => {
      if (this.question) {
        this.updateFormForQuestion(this.question);
      }
    });
  }

  /**
   * Initialize the form
   */
  private initializeForm(): void {
    this.inputForm = this.fb.group({
      answer: ['', []],
    });
  }

  /**
   * Update form based on question constraints
   */
  private updateFormForQuestion(question: Question): void {
    const constraints = question.constraints || {};
    const validators = this.buildValidators(constraints);

    const control = this.inputForm.get('answer');
    if (control) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }

    // Show hint if helpText exists
    this.showHint.set(!!question.helpText);

    // Apply mask if needed
    if (constraints.mask) {
      // Mask handling will be done in template or via directive
    }
  }

  /**
   * Build validators from constraints
   */
  private buildValidators(constraints: QuestionConstraints): Array<(control: AbstractControl) => { [key: string]: any } | null> {
    const validators: Array<(control: AbstractControl) => { [key: string]: any } | null> = [];

    if (constraints.required) {
      validators.push(Validators.required);
    }

    if (constraints.min !== undefined) {
      validators.push(Validators.min(constraints.min));
    }

    if (constraints.max !== undefined) {
      validators.push(Validators.max(constraints.max));
    }

    if (constraints.pattern) {
      validators.push(Validators.pattern(constraints.pattern));
    }

    return validators;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.inputForm.invalid || this.isLoading()) {
      return;
    }

    const answer = this.inputForm.get('answer')?.value;
    
    // Format answer based on question type
    const formattedAnswer = this.formatAnswer(answer);
    
    this.submitAnswer.emit(formattedAnswer);
    
    // Clear form after submission
    this.inputForm.reset();
    this.showError.set(false);
    this.errorMessage.set(null);
  }

  /**
   * Format answer based on question type
   */
  private formatAnswer(answer: string | number | boolean): string | number | boolean {
    if (!this.question) {
      return answer;
    }

    switch (this.question.type) {
      case 'number':
        return Number(answer);
      case 'date':
        // Format date based on locale
        return answer;
      default:
        return answer;
    }
  }

  /**
   * Handle Enter key press
   */
  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  /**
   * Handle Escape key to cancel
   */
  onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel.emit();
    }
  }

  /**
   * Get error message for display
   */
  getErrorMessage(): string {
    const control = this.inputForm.get('answer');
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['min']) {
      return `Minimum value is ${this.question?.constraints?.min}`;
    }
    if (control.errors['max']) {
      return `Maximum value is ${this.question?.constraints?.max}`;
    }
    if (control.errors['pattern']) {
      return 'Invalid format';
    }

    return this.error || 'Invalid input';
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return this.inputForm.valid && !this.isLoading();
  }

  /**
   * Get placeholder text
   */
  getPlaceholder(): string {
    if (!this.question) {
      return 'Type your answer...';
    }

    const constraints = this.question.constraints || {};
    
    if (this.question.type === 'date' && constraints.mask) {
      return constraints.mask.replace(/#/g, '_');
    }

    return 'Type your answer...';
  }

  /**
   * Get input type
   */
  getInputType(): string {
    if (!this.question) {
      return 'text';
    }

    switch (this.question.type) {
      case 'number':
        return 'number';
      case 'date':
        return 'text'; // Will use masked input
      default:
        return 'text';
    }
  }

  /**
   * Handle voice stop
   */
  onVoiceStop(): void {
    this.micStop.emit();
    // Final transcript should be placed in input field by parent
    const finalTranscript = this.partialTranscript();
    if (finalTranscript && this.inputForm) {
      this.inputForm.get('answer')?.setValue(finalTranscript);
      this.isVoiceMode.set(false);
      this.partialTranscript.set(null);
    }
  }

  /**
   * Handle voice cancel
   */
  onVoiceCancel(): void {
    this.isVoiceMode.set(false);
    this.partialTranscript.set(null);
    this.micStop.emit();
  }

  /**
   * Enable voice mode
   */
  enableVoiceMode(): void {
    this.isVoiceMode.set(true);
  }
}

