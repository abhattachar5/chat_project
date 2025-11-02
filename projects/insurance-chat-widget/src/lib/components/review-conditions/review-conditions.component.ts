import { Component, EventEmitter, inject, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { IntakeService } from '../../services/intake.service';
import { DictionaryService } from '../../services/dictionary.service';
import { PhiRedactionService } from '../../services/phi-redaction.service';
import { AnalyticsService } from '../../services/analytics.service';
import { CandidateCondition, ConfirmationPayload, DictionarySearchResult } from '../../models/intake.model';

@Component({
  selector: 'ins-review-conditions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './review-conditions.component.html',
  styleUrls: ['./review-conditions.component.scss'],
})
export class ReviewConditionsComponent implements OnInit, OnDestroy {
  @Input() sessionId: string = '';
  @Input() candidates: CandidateCondition[] = [];
  @Output() confirmations = new EventEmitter<ConfirmationPayload>();
  @Output() back = new EventEmitter<void>();

  private intakeService = inject(IntakeService);
  private dictionaryService = inject(DictionaryService);
  private redactionService = inject(PhiRedactionService);
  private analyticsService = inject(AnalyticsService);
  private snackBar = inject(MatSnackBar);

  // Condition management
  conditions: ProcessedCondition[] = [];
  highConfidenceConditions: ProcessedCondition[] = [];
  mediumConfidenceConditions: ProcessedCondition[] = [];
  lowConfidenceConditions: ProcessedCondition[] = [];

  // Manual condition addition
  searchQuery: string = '';
  searchResults: DictionarySearchResult[] = [];
  isSearching = false;
  private searchSubject = new Subject<string>();

  // Edit states
  editingConditions = new Set<string>();

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // Process candidates into conditions
    this.processCandidates();

    // Set up debounced search
    const searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.performSearch(query);
      });
    this.subscriptions.push(searchSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Process candidates into conditions with status
   */
  private processCandidates(): void {
    this.conditions = this.candidates.map(candidate => ({
      ...candidate,
      isAccepted: false,
      isRejected: false,
      isEdited: false,
      editedStatus: candidate.status,
      editedSeverity: candidate.severity,
      editedOnsetDate: candidate.onsetDate ? new Date(candidate.onsetDate) : null,
      showEvidence: false,
      evidenceMasked: true,
    }));

    // Group by confidence
    this.highConfidenceConditions = this.conditions.filter(c => c.confidence >= 0.75);
    this.mediumConfidenceConditions = this.conditions.filter(c => c.confidence >= 0.5 && c.confidence < 0.75);
    this.lowConfidenceConditions = this.conditions.filter(c => c.confidence < 0.5);
  }

  /**
   * Toggle accept/reject for a condition
   */
  toggleCondition(condition: ProcessedCondition, accept: boolean): void {
    condition.isAccepted = accept;
    condition.isRejected = !accept;

    if (accept && condition.isEdited) {
      // Mark as edited if values changed
      condition.isEdited = this.hasChanges(condition);
    }
  }

  /**
   * Check if condition has been edited
   */
  private hasChanges(condition: ProcessedCondition): boolean {
    const original = this.candidates.find(c => c.id === condition.id);
    if (!original) return false;

    return (
      condition.editedStatus !== original.status ||
      condition.editedSeverity !== original.severity ||
      condition.editedOnsetDate?.toISOString() !== original.onsetDate
    );
  }

  /**
   * Start editing a condition
   */
  editCondition(condition: ProcessedCondition): void {
    this.editingConditions.add(condition.id);
  }

  /**
   * Save edited condition
   */
  saveEdit(condition: ProcessedCondition): void {
    condition.isEdited = this.hasChanges(condition);
    this.editingConditions.delete(condition.id);
  }

  /**
   * Cancel editing
   */
  cancelEdit(condition: ProcessedCondition): void {
    const original = this.candidates.find(c => c.id === condition.id);
    if (original) {
      condition.editedStatus = original.status;
      condition.editedSeverity = original.severity;
      condition.editedOnsetDate = original.onsetDate ? new Date(original.onsetDate) : null;
    }
    this.editingConditions.delete(condition.id);
  }

  /**
   * Toggle evidence display
   */
  toggleEvidence(condition: ProcessedCondition): void {
    condition.showEvidence = !condition.showEvidence;
    if (condition.showEvidence && condition.evidenceMasked) {
      // Show warning when first showing evidence
      this.snackBar.open(this.redactionService.getPhiWarning(), 'Close', {
        duration: 5000,
      });
    }
  }

  /**
   * Toggle evidence masking
   */
  toggleEvidenceMasking(condition: ProcessedCondition): void {
    condition.evidenceMasked = !condition.evidenceMasked;
    if (!condition.evidenceMasked) {
      this.snackBar.open('Showing unmasked evidence. Be careful with personal information.', 'Close', {
        duration: 7000,
      });
    }
  }

  /**
   * Get redacted evidence snippet
   */
  getEvidenceSnippet(condition: ProcessedCondition): string {
    if (!condition.evidence) return '';

    if (condition.evidenceMasked) {
      return this.redactionService.redactPhi(condition.evidence.snippet);
    } else {
      return condition.evidence.rawSnippet || condition.evidence.snippet;
    }
  }

  /**
   * Search for conditions
   */
  onSearchChange(query: string): void {
    this.searchQuery = query;
    if (query && query.trim().length >= 2) {
      this.searchSubject.next(query.trim());
    } else {
      this.searchResults = [];
    }
  }

  /**
   * Perform dictionary search
   */
  private performSearch(query: string): void {
    if (!query || query.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.dictionaryService.search(query).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Search failed', 'Close', {
          duration: 5000,
        });
        this.searchResults = [];
        this.isSearching = false;
      },
    });
  }

  /**
   * Add manually selected condition
   */
  addManualCondition(result: DictionarySearchResult): void {
    const newCondition: ProcessedCondition = {
      id: `manual_${Date.now()}`,
      originalTerm: result.label,
      canonical: {
        code: result.code,
        label: result.label,
      },
      confidence: 1.0, // Manually added = 100% confidence
      status: 'active',
      evidence: {
        docId: '',
        page: 0,
        snippet: 'Manually added condition',
      },
      isAccepted: true,
      isRejected: false,
      isEdited: false,
      isManual: true,
      editedStatus: 'active',
      editedSeverity: undefined,
      editedOnsetDate: null,
      showEvidence: false,
      evidenceMasked: true,
    };

    this.conditions.push(newCondition);
    this.highConfidenceConditions.push(newCondition);

    // Day 2 Phase 4: Audit event - Manual condition added
    this.analyticsService.intakeManualAdd(this.sessionId, result.code, result.label);

    // Clear search
    this.searchQuery = '';
    this.searchResults = [];
  }

  /**
   * Get confidence color
   */
  getConfidenceColor(confidence: number): string {
    if (confidence >= 0.75) return 'primary';
    if (confidence >= 0.5) return 'accent';
    return 'warn';
  }

  /**
   * Format confidence as percentage
   */
  formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  }

  /**
   * Handle back button
   */
  onBack(): void {
    this.back.emit();
  }

  /**
   * Handle confirm button
   */
  onConfirm(): void {
    // Validate that at least one condition is accepted
    const hasAccepted = this.conditions.some(c => c.isAccepted);
    
    if (!hasAccepted && this.conditions.length > 0) {
      this.snackBar.open('Please accept or reject at least one condition, or add a new one.', 'Close', {
        duration: 5000,
      });
      return;
    }

    // Build confirmation payload
    const confirmed: ConfirmationPayload['confirmed'] = this.conditions
      .filter(c => c.isAccepted)
      .map(c => ({
        candidateId: c.id,
        status: c.editedStatus,
        severity: c.editedSeverity,
        onsetDate: c.editedOnsetDate?.toISOString(),
      }));

    const rejected = this.conditions
      .filter(c => c.isRejected)
      .map(c => c.id);

    const manualAdd = this.conditions
      .filter(c => c.isAccepted && c.isManual)
      .map(c => ({
        code: c.canonical.code,
        label: c.canonical.label,
        status: c.editedStatus,
        severity: c.editedSeverity,
        onsetDate: c.editedOnsetDate?.toISOString(),
      }));

    // Day 2 Phase 4: Audit events - Confirmations and rejections
    confirmed.forEach(c => {
      const condition = this.conditions.find(cond => cond.id === c.candidateId);
      if (condition) {
        this.analyticsService.intakeConfirmed(
          this.sessionId,
          c.candidateId,
          condition.canonical.code
        );
      }
    });

    rejected.forEach(candidateId => {
      const condition = this.conditions.find(c => c.id === candidateId);
      if (condition) {
        this.analyticsService.intakeRejected(
          this.sessionId,
          candidateId,
          condition.canonical.code
        );
      }
    });

    const payload: ConfirmationPayload = {
      sessionId: this.sessionId,
      confirmed,
      rejected,
      manualAdd: manualAdd.length > 0 ? manualAdd : undefined,
    };

    this.confirmations.emit(payload);
  }

  /**
   * Display function for autocomplete
   */
  displayFn(result: DictionarySearchResult | null): string {
    return result ? result.label : '';
  }
}

/**
 * Extended condition with UI state
 */
export interface ProcessedCondition extends CandidateCondition {
  isAccepted: boolean;
  isRejected: boolean;
  isEdited: boolean;
  isManual?: boolean;
  editedStatus?: 'active' | 'resolved';
  editedSeverity?: string;
  editedOnsetDate?: Date | null;
  showEvidence: boolean;
  evidenceMasked: boolean;
}

