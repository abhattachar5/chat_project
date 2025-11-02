import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ConsentDialogData {
  title?: string;
  message?: string;
  acceptLabel?: string;
  declineLabel?: string;
  includeDocumentProcessing?: boolean; // Day 2 Phase 4: Include document processing consent
}

export interface ConsentDialogResult {
  accepted: boolean;
  timestamp: string;
}

@Component({
  selector: 'ins-consent-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './consent-dialog.component.html',
  styleUrls: ['./consent-dialog.component.scss'],
})
export class ConsentDialogComponent {
  private dialogRef = inject(MatDialogRef<ConsentDialogComponent>);
  data = inject<ConsentDialogData>(MAT_DIALOG_DATA);

  title = this.data?.title || (this.data?.includeDocumentProcessing 
    ? 'Voice, Transcript & Document Processing' 
    : 'Voice & Transcript Recording');
  message = this.data?.message || 
    (this.data?.includeDocumentProcessing
      ? 'With your permission, we\'ll use your microphone, store a transcript of this interview, and process any medical documents you upload for compliance and to speed up your application. You can continue by typing at any time.'
      : 'With your permission, we\'ll use your microphone and store a transcript of this interview for compliance. You can continue by typing at any time.');
  acceptLabel = this.data?.acceptLabel || 'Accept';
  declineLabel = this.data?.declineLabel || 'Decline';
  includeDocumentProcessing = this.data?.includeDocumentProcessing || false;

  accept(): void {
    const result: ConsentDialogResult = {
      accepted: true,
      timestamp: new Date().toISOString(),
    };
    this.dialogRef.close(result);
  }

  decline(): void {
    const result: ConsentDialogResult = {
      accepted: false,
      timestamp: new Date().toISOString(),
    };
    this.dialogRef.close(result);
  }
}

