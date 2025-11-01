import { Injectable } from '@angular/core';

/**
 * Service for generating idempotency keys to prevent duplicate requests
 */
@Injectable({
  providedIn: 'root',
})
export class IdempotencyService {
  /**
   * Generate a unique idempotency key
   * Format: timestamp-randomuuid
   */
  generateKey(): string {
    const timestamp = Date.now();
    const random = this.generateUUID();
    return `${timestamp}-${random}`;
  }

  /**
   * Generate a simple UUID-like string
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

