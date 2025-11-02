/**
 * PHI (Protected Health Information) Redaction Service
 * Masks sensitive information in text snippets
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PhiRedactionService {
  // NHS number pattern: 3 digits, optional space, 3 digits, optional space, 4 digits
  private readonly NHS_NUMBER_PATTERN = /\b(\d{3})\s?(\d{3})\s?(\d{4})\b/g;

  // DOB patterns: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  private readonly DOB_PATTERN = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b/g;

  // Postcode patterns: UK postcode formats
  private readonly POSTCODE_PATTERN = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})\b/gi;

  // Address patterns: Common UK address formats
  private readonly ADDRESS_PATTERN = /\b(\d+[A-Za-z]?\s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+(?:Street|Road|Avenue|Lane|Drive|Close|Way|Gardens|Crescent|Place|Square|Terrace))\b/gi;

  // Email pattern (optional, for evidence snippets)
  private readonly EMAIL_PATTERN = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;

  /**
   * Redact PHI from text snippet
   */
  redactPhi(text: string, options: RedactionOptions = {}): string {
    if (!text || text.length === 0) {
      return text;
    }

    let redacted = text;

    // Redact NHS numbers
    if (options.redactNhsNumbers !== false) {
      redacted = redacted.replace(this.NHS_NUMBER_PATTERN, (match) => {
        return '••• ••• ••••';
      });
    }

    // Redact DOB
    if (options.redactDob !== false) {
      redacted = redacted.replace(this.DOB_PATTERN, (match) => {
        return '••/••/••••';
      });
    }

    // Redact postcodes
    if (options.redactPostcodes !== false) {
      redacted = redacted.replace(this.POSTCODE_PATTERN, () => {
        return '•••••••';
      });
    }

    // Redact addresses
    if (options.redactAddresses !== false) {
      redacted = redacted.replace(this.ADDRESS_PATTERN, () => {
        return '•••• •••• ••••';
      });
    }

    // Redact emails (optional)
    if (options.redactEmails === true) {
      redacted = redacted.replace(this.EMAIL_PATTERN, () => {
        return '•••••@•••••.com';
      });
    }

    return redacted;
  }

  /**
   * Check if text contains PHI patterns
   */
  containsPhi(text: string): boolean {
    if (!text || text.length === 0) {
      return false;
    }

    return (
      this.NHS_NUMBER_PATTERN.test(text) ||
      this.DOB_PATTERN.test(text) ||
      this.POSTCODE_PATTERN.test(text) ||
      this.ADDRESS_PATTERN.test(text)
    );
  }

  /**
   * Get PHI warning message
   */
  getPhiWarning(): string {
    return 'This may include personal details. We mask identifiers by default.';
  }
}

export interface RedactionOptions {
  redactNhsNumbers?: boolean;
  redactDob?: boolean;
  redactPostcodes?: boolean;
  redactAddresses?: boolean;
  redactEmails?: boolean;
}


