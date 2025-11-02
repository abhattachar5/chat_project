import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { WidgetConfigService } from './widget-config.service';
import { DictionarySearchResult } from '../models/intake.model';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private http = inject(HttpClient);
  private configService = inject(WidgetConfigService);

  private searchCache = new Map<string, DictionarySearchResult[]>();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private cacheTimestamps = new Map<string, number>();

  /**
   * Search impairment dictionary
   */
  search(query: string): Observable<DictionarySearchResult[]> {
    if (!query || query.trim().length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    // Check cache
    const cached = this.getCachedResults(query);
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    const url = `${this.getBaseUrl()}/v1/dictionary/search`;
    const headers = this.getHeaders();
    const params = { q: query.trim() };

    return this.http.get<DictionarySearchResult[]>(url, { headers, params }).pipe(
      tap((results: DictionarySearchResult[]) => {
        // Cache results
        this.cacheResults(query, results);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get base URL for API
   */
  private getBaseUrl(): string {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Widget not initialized. Call InsuranceChatWidget.init() first.');
    }

    const baseUrls: Record<string, string> = {
      prod: 'https://api.provider.example',
      staging: 'https://api-staging.provider.example',
      dev: 'https://api-dev.provider.example',
    };

    return baseUrls[config.environment] || baseUrls.dev;
  }

  /**
   * Get headers for request
   */
  private getHeaders(): HttpHeaders {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error('Widget not initialized');
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.jwt}`,
    });
  }

  /**
   * Cache search results
   */
  private cacheResults(query: string, results: DictionarySearchResult[]): void {
    const normalizedQuery = query.toLowerCase().trim();
    this.searchCache.set(normalizedQuery, results);
    this.cacheTimestamps.set(normalizedQuery, Date.now());
  }

  /**
   * Get cached results if available and not expired
   */
  private getCachedResults(query: string): DictionarySearchResult[] | null {
    const normalizedQuery = query.toLowerCase().trim();
    const cached = this.searchCache.get(normalizedQuery);
    const timestamp = this.cacheTimestamps.get(normalizedQuery);

    if (cached && timestamp) {
      const age = Date.now() - timestamp;
      if (age < this.CACHE_TTL) {
        return cached;
      } else {
        // Expired, remove from cache
        this.searchCache.delete(normalizedQuery);
        this.cacheTimestamps.delete(normalizedQuery);
      }
    }

    return null;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.searchCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Search failed';
    let errorCode = 'search_error';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
      errorCode = 'client_error';
    } else {
      errorCode = `http_${error.status}`;

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid search query';
          break;
        case 0:
          errorMessage = 'Network error. Please check your connection.';
          errorCode = 'network_error';
          break;
        default:
          errorMessage = error.error?.message || `Search error: ${error.status}`;
      }
    }

    const apiError = {
      code: errorCode,
      message: errorMessage,
      status: error.status,
    };

    return throwError(() => apiError);
  };
}

