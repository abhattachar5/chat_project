import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  effect,
  runInInjectionContext,
  Injector,
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
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
  @Input() partialTranscript = signal<string | null>(null);
  @Input() showMicButton = signal(false);
  @Output() submitAnswer = new EventEmitter<string | number | boolean | string[] | Record<string, unknown>>();
  @Output() cancel = new EventEmitter<void>();
  @Output() micStart = new EventEmitter<void>();
  @Output() micStop = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private injector = inject(Injector);
  inputForm!: FormGroup;

  // Signals for UI state
  showHint = signal(false);
  showError = signal(false);
  errorMessage = signal<string | null>(null);
  isVoiceMode = signal(false);

  ngOnInit(): void {
    this.initializeForm();
    
    // React to question changes - must run in injection context
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (this.question) {
          this.updateFormForQuestion(this.question);
        }
      }, { allowSignalWrites: true });
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
    const validators = this.buildValidators(question.type, constraints);

    const control = this.inputForm.get('answer');
    if (control) {
      // Clear previous value and errors
      control.setValue('');
      control.clearValidators();
      control.setValidators(validators);
      control.updateValueAndValidity();
      
      // Reset touched state to avoid showing errors immediately
      control.markAsUntouched();
      
      // Handle disabled state properly using form control
      if (this.isLoading || this.isVoiceMode()) {
        control.disable();
      } else {
        control.enable();
      }
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
  private buildValidators(questionType: string | undefined, constraints: QuestionConstraints): Array<(control: AbstractControl) => { [key: string]: any } | null> {
    const validators: Array<(control: AbstractControl) => { [key: string]: any } | null> = [];

    if (constraints.required) {
      validators.push(Validators.required);
    }

    // Only apply min/max validators based on question type
    if (questionType === 'number') {
      // For number types, use min/max for numeric value validation
      if (constraints.min !== undefined) {
        validators.push(Validators.min(constraints.min));
      }
      if (constraints.max !== undefined) {
        validators.push(Validators.max(constraints.max));
      }
    } else if (questionType === 'text' || questionType === 'textarea') {
      // For text types, use minLength/maxLength for string length validation
      if (constraints.min !== undefined) {
        validators.push(Validators.minLength(constraints.min));
      }
      if (constraints.max !== undefined) {
        validators.push(Validators.maxLength(constraints.max));
      }
    }
    // For date, selectOne, selectMany, etc., don't apply min/max validators
    // They only use pattern validation if specified

    if (constraints.pattern) {
      validators.push(Validators.pattern(constraints.pattern));
    }

    return validators;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.inputForm.invalid || this.isLoading) {
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
      // Get min value from error object or question constraints
      const minError = control.errors['min'];
      const minValue = (minError && typeof minError === 'object' && 'min' in minError) 
        ? minError.min 
        : this.question?.constraints?.min;
      if (minValue !== undefined && minValue !== null) {
        return this.question?.type === 'number' 
          ? `Minimum value is ${minValue}`
          : `Minimum length is ${minValue} characters`;
      }
      return this.question?.type === 'number' 
        ? 'Value is below the minimum'
        : 'Text is too short';
    }
    if (control.errors['max']) {
      // Get max value from error object or question constraints
      const maxError = control.errors['max'];
      const maxValue = (maxError && typeof maxError === 'object' && 'max' in maxError)
        ? maxError.max
        : this.question?.constraints?.max;
      if (maxValue !== undefined && maxValue !== null) {
        return this.question?.type === 'number'
          ? `Maximum value is ${maxValue}`
          : `Maximum length is ${maxValue} characters`;
      }
      return this.question?.type === 'number'
        ? 'Value is above the maximum'
        : 'Text is too long';
    }
    if (control.errors['minlength']) {
      const minLengthError = control.errors['minlength'];
      const minLength = (minLengthError && typeof minLengthError === 'object' && 'requiredLength' in minLengthError)
        ? minLengthError.requiredLength
        : this.question?.constraints?.min;
      if (minLength !== undefined && minLength !== null) {
        return `Minimum length is ${minLength} characters`;
      }
      return 'Text is too short';
    }
    if (control.errors['maxlength']) {
      const maxLengthError = control.errors['maxlength'];
      const maxLength = (maxLengthError && typeof maxLengthError === 'object' && 'requiredLength' in maxLengthError)
        ? maxLengthError.requiredLength
        : this.question?.constraints?.max;
      if (maxLength !== undefined && maxLength !== null) {
        return `Maximum length is ${maxLength} characters`;
      }
      return 'Text is too long';
    }
    if (control.errors['pattern']) {
      // Provide more helpful message for pattern errors
      if (this.question?.type === 'date') {
        return 'Invalid date format. Please use DD/MM/YYYY';
      }
      if (this.question?.constraints?.mask) {
        return `Invalid format. Expected format: ${this.question.constraints.mask.replace(/#/g, '0')}`;
      }
      return 'Invalid format';
    }

    return this.error || 'Invalid input';
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return this.inputForm.valid && !this.isLoading;
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
   * Get format example from mask
   */
  getFormatExample(): string {
    if (!this.question?.constraints?.mask) {
      return '';
    }
    return this.question.constraints.mask.replace(/#/g, '0');
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

