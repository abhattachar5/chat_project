# Developer Guide

## Architecture Overview

The Insurance Chat Widget is built with Angular 18 using standalone components and Angular Signals for reactive state management.

### Key Technologies

- **Angular 18** - Framework
- **Angular Material** - UI components
- **Angular Signals** - Reactive state
- **RxJS** - Async streams
- **WebSockets** - Real-time communication
- **Web Audio API** - Voice capture

## Component Architecture

### Standalone Components

All components are standalone, allowing for flexible imports:

```typescript
@Component({
  selector: 'ins-chat-widget-shell',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    // ... other imports
  ],
  // ...
})
export class ChatWidgetShellComponent { }
```

### Services

Services are provided at root level for singleton behavior:

```typescript
@Injectable({
  providedIn: 'root',
})
export class SessionService { }
```

## State Management

### Angular Signals

Primary state management uses Angular Signals:

```typescript
export class SessionService {
  private sessionState = signal<Session | null>(null);
  
  session = this.sessionState.asReadonly();
  sessionId = computed(() => this.session()?.id || null);
  loading = signal(false);
}
```

### RxJS Observables

For async operations and streams:

```typescript
startSession(consent: Consent): Observable<Session> {
  this.loading.set(true);
  return this.apiService.post<Session>('/v1/sessions', {
    consent,
    tenantId: this.configService.getConfig()?.tenantId,
  }).pipe(
    tap((session) => {
      this.sessionState.set(session);
      this.loading.set(false);
    }),
    catchError((error) => {
      this.loading.set(false);
      return throwError(() => error);
    }),
  );
}
```

## API Integration

### API Service

Centralized HTTP client with retry logic:

```typescript
get<T>(endpoint: string): Observable<T> {
  return this.http.get<T>(`${baseUrl}${endpoint}`, {
    headers: this.getHeaders(),
  }).pipe(
    retry({ count: 3, delay: exponentialBackoff }),
    catchError(this.handleError),
  );
}
```

### Idempotency

POST requests include idempotency keys:

```typescript
post<T>(endpoint: string, body: unknown): Observable<T> {
  const headers = this.getHeaders();
  headers.set('Idempotency-Key', this.idempotencyService.generateKey());
  
  return this.http.post<T>(`${baseUrl}${endpoint}`, body, { headers });
}
```

## WebSocket Integration

### ASR/TTS Streaming

```typescript
connectASR(sessionId: string): Observable<string> {
  const ws = new WebSocket(`${wsUrl}/v1/asr?sessionId=${sessionId}`);
  
  return new Observable((observer) => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      observer.next(data.transcript);
    };
    
    ws.onerror = (error) => observer.error(error);
    ws.onclose = () => observer.complete();
    
    return () => ws.close();
  });
}
```

## Accessibility Implementation

### Keyboard Navigation

```typescript
@HostListener('window:keydown', ['$event'])
onKeyDown(event: KeyboardEvent): void {
  if (event.altKey && event.key === 'v') {
    this.startVoiceInput();
  }
}
```

### Screen Reader Support

```typescript
announceToScreenReader(message: string, priority: 'polite' | 'assertive'): void {
  const announcer = this.document.getElementById('ins-screen-reader-announcer');
  announcer?.setAttribute('aria-live', priority);
  announcer.textContent = message;
}
```

### Focus Management

```typescript
focusFirstFocusable(container: HTMLElement): HTMLElement | null {
  const focusable = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0] || null;
  if (first) first.focus();
  return first;
}
```

## Theming System

### CSS Custom Properties

```typescript
applyTheme(theme: ThemeConfig): void {
  const root = this.document.documentElement;
  
  if (theme.palette?.primary) {
    this.renderer.setStyle(root, '--ins-primary', theme.palette.primary);
    this.renderer.setStyle(root, '--mdc-theme-primary', theme.palette.primary);
  }
}
```

### Reduced Motion Support

```typescript
prefersReducedMotion(): boolean {
  const mediaQuery = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery?.matches || false;
}
```

## Internationalization

### Locale Management

```typescript
setLocale(locale: string): void {
  if (this.translations[locale]) {
    this.currentLocale.set(locale);
  }
}

formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(this.currentLocale(), options);
}
```

## Testing

### Unit Testing

```typescript
describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should create session', (done) => {
    service.startSession({ recordingAccepted: false, timestamp: new Date().toISOString() })
      .subscribe((session) => {
        expect(session.id).toBeTruthy();
        done();
      });
    
    const req = httpMock.expectOne('/v1/sessions');
    req.flush({ id: 'session-123' });
  });
});
```

### E2E Testing (Playwright)

```typescript
test('should submit answer', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await page.locator('.ins-fab-button').click();
  
  const input = page.locator('ins-input-bar input');
  await input.fill('Test answer');
  await input.press('Enter');
  
  // Verify answer submission
});
```

## Performance Optimization

### Virtual Scrolling

```typescript
<cdk-virtual-scroll-viewport itemSize="80">
  @for (message of messages(); track message.id) {
    <div class="ins-message">{{ message.content }}</div>
  }
</cdk-virtual-scroll-viewport>
```

### Lazy Loading

Components are loaded on-demand using Angular's lazy loading:

```typescript
const routes: Routes = [
  {
    path: 'transcript',
    loadComponent: () => import('./transcript-tab/transcript-tab.component')
      .then(m => m.TranscriptTabComponent),
  },
];
```

## Error Handling

### Error Handling Service

```typescript
handleError(error: HttpErrorResponse): Observable<never> {
  const errorMessage = this.errorHandlingService.getErrorMessage(error);
  
  if (this.errorHandlingService.isRetryable(error)) {
    return throwError(() => ({ retryable: true, message: errorMessage }));
  }
  
  return throwError(() => ({ retryable: false, message: errorMessage }));
}
```

## Building & Packaging

### Library Build

```bash
ng build insurance-chat-widget --configuration production
```

### UMD Bundle

```bash
ng build insurance-chat-widget --configuration production --output-hashing=none --single-bundle
```

## Best Practices

1. **Use Signals for State** - Prefer Signals over RxJS for simple state
2. **Standalone Components** - All new components should be standalone
3. **Accessibility First** - Always add ARIA labels and keyboard support
4. **Error Handling** - Use ErrorHandlingService for consistent error handling
5. **Type Safety** - Use TypeScript interfaces for all data structures
6. **Testing** - Maintain ≥80% test coverage
7. **Performance** - Use virtual scrolling for large lists
8. **Security** - Sanitize user input, use JWT tokens

## Common Patterns

### Service Injection

```typescript
export class MyComponent {
  private service = inject(MyService);
}
```

### Signal Updates

```typescript
const count = signal(0);
count.update((value) => value + 1);
```

### Computed Signals

```typescript
const doubled = computed(() => count() * 2);
```

## Troubleshooting

### Common Issues

1. **Module not found** - Ensure all imports are correct
2. **Theme not applying** - Check CSS custom properties are set
3. **WebSocket connection fails** - Verify CORS configuration
4. **Accessibility issues** - Run axe-core audit
5. **Performance issues** - Use Chrome DevTools Performance tab

## Contributing

1. Follow TypeScript strict mode
2. Write unit tests for all new features
3. Maintain accessibility standards
4. Update documentation
5. Follow code style (Prettier)

