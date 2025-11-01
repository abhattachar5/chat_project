# Insurance Chat Widget

An embeddable Insurance Interview Chat Widget built with Angular 18 and Angular Material. The widget supports text and optional voice input, is WCAG 2.1 AA compliant, and integrates with a provider-side orchestrator for conducting insurance application interviews.

## Features

✅ **Core Chat Functionality**
- Message display with virtual scrolling
- Text input with validation
- Session lifecycle management
- Question rendering and answer submission

✅ **Voice Integration**
- WebSocket ASR/TTS streaming
- Push-to-talk microphone button
- Real-time audio level visualization (VU meter)
- Partial transcript display
- Barge-in functionality

✅ **Advanced Features**
- Transcript view with filtering and search
- Sensitive data masking
- Progress indicator
- Navigation controls (back/forward)
- Completion screen
- Comprehensive error handling

✅ **Accessibility (WCAG 2.1 AA)**
- Full keyboard navigation
- Screen reader support (ARIA labels, live regions)
- Color contrast compliance (4.5:1 body, 3:1 large text)
- Reduced motion support
- High contrast mode support
- Visible focus indicators (3px outline)

✅ **Theming & Internationalization**
- Runtime theme switching
- CSS custom properties
- Light/dark mode support
- Locale management and formatting
- Translation foundation

## Installation

```bash
npm install @provider/insurance-chat-widget
```

## Quick Start

### Basic Embedding

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.example.com/insurance-chat-widget.js"></script>
</head>
<body>
  <div id="chat-widget-container"></div>
  
  <script>
    InsuranceChatWidget.init({
      container: document.getElementById('chat-widget-container'),
      config: {
        apiBaseUrl: 'https://api.example.com',
        tenantId: 'your-tenant-id',
        authToken: 'your-jwt-token',
      }
    });
  </script>
</body>
</html>
```

### Angular Integration

```typescript
import { InsuranceChatWidgetModule } from '@provider/insurance-chat-widget';

@NgModule({
  imports: [
    InsuranceChatWidgetModule,
    // ... other imports
  ],
})
export class AppModule { }
```

```html
<ins-chat-widget-shell></ins-chat-widget-shell>
```

## Configuration

### Widget Config Options

```typescript
interface WidgetConfig {
  apiBaseUrl: string;           // Required: API base URL
  tenantId: string;             // Required: Tenant identifier
  authToken?: string;           // Optional: JWT token
  theme?: ThemeConfig;          // Optional: Theme configuration
  analytics?: AnalyticsConfig;  // Optional: Analytics configuration
  features?: {
    voice?: boolean;            // Enable voice input (default: true)
    progress?: boolean;          // Show progress indicator (default: true)
    transcript?: boolean;        // Show transcript tab (default: true)
  };
}
```

### Theme Configuration

```typescript
interface ThemeConfig {
  palette?: {
    primary?: string;           // Primary color (default: #0D47A1)
    secondary?: string;         // Secondary color (default: #1976D2)
    error?: string;             // Error color (default: #B00020)
    surface?: string;           // Surface color (default: #FAFAFA)
  };
  density?: 'comfortable' | 'compact';  // Material density
  darkMode?: boolean;          // Enable dark mode
}
```

### Example Configuration

```typescript
const config: WidgetConfig = {
  apiBaseUrl: 'https://api.example.com',
  tenantId: 'tenant-123',
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  theme: {
    palette: {
      primary: '#0D47A1',
      secondary: '#1976D2',
    },
    density: 'comfortable',
    darkMode: false,
  },
  analytics: {
    enabled: true,
    onEvent: (event) => {
      console.log('Analytics event:', event);
      // Send to your analytics service
    },
  },
  features: {
    voice: true,
    progress: true,
    transcript: true,
  },
};

InsuranceChatWidget.init({
  container: document.getElementById('widget-container'),
  config,
});
```

## API Integration

The widget expects the following API endpoints:

### Session Management
- `POST /v1/sessions` - Create session
- `GET /v1/sessions/{id}` - Get session
- `DELETE /v1/sessions/{id}` - End session

### Questions & Answers
- `GET /v1/sessions/{id}/next-question` - Get next question
- `POST /v1/sessions/{id}/answers` - Submit answer

### Transcript
- `GET /v1/sessions/{id}/transcript` - Get transcript

### WebSocket (for Voice)
- `ws://api.example.com/v1/asr` - ASR (Automatic Speech Recognition)
- `ws://api.example.com/v1/tts` - TTS (Text-to-Speech)

## Keyboard Shortcuts

- `Alt+V` - Start voice input
- `Enter` - Submit answer
- `Escape` - Close widget / Cancel voice input
- `Tab` - Navigate between elements
- `Shift+Tab` - Navigate backwards

## Accessibility

The widget is fully accessible and WCAG 2.1 AA compliant:

- ✅ Keyboard navigation for all functionality
- ✅ Screen reader support (NVDA, JAWS, VoiceOver)
- ✅ Color contrast compliance (4.5:1 body, 3:1 large text)
- ✅ Reduced motion support
- ✅ High contrast mode support
- ✅ Visible focus indicators

## Theming

### CSS Custom Properties

The widget uses CSS custom properties for theming:

```css
:root {
  --ins-primary: #0D47A1;
  --ins-secondary: #1976D2;
  --ins-error: #B00020;
  --ins-surface: #FAFAFA;
  --ins-on-surface: #212121;
}
```

### Runtime Theme Switching

```typescript
import { ThemeService } from '@provider/insurance-chat-widget';

const themeService = inject(ThemeService);

themeService.applyTheme({
  palette: {
    primary: '#FF0000',
  },
  darkMode: true,
});
```

## Internationalization

The widget includes locale support:

```typescript
import { I18nService } from '@provider/insurance-chat-widget';

const i18n = inject(I18nService);

// Set locale
i18n.setLocale('en-GB');

// Format dates, numbers, currency
const date = i18n.formatDate(new Date());
const number = i18n.formatNumber(1234.56);
const currency = i18n.formatCurrency(1234.56, 'GBP');

// Translate strings
const title = i18n.translate('widget.title');
```

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Build library
npm run build:lib

# Build UMD bundle
npm run build:umd

# Start demo app
npm start
```

### Project Structure

```
projects/insurance-chat-widget/
├── src/
│   ├── lib/
│   │   ├── components/          # Angular components
│   │   ├── services/             # Services (API, Session, etc.)
│   │   ├── models/              # TypeScript interfaces
│   │   └── insurance-chat-widget.module.ts
│   ├── public-api.ts            # Public API exports
│   └── styles.scss              # Global styles
└── ng-package.json              # Library build config
```

## Testing

### Unit Tests

```bash
npm test
```

Coverage target: ≥80%

### E2E Tests (Playwright)

```bash
npm run e2e
```

Tests include:
- Widget embedding
- User interaction flows
- Keyboard navigation
- Responsive layouts
- Accessibility checks

## Browser Support

- Chrome (latest 2 versions)
- Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Security

- JWT token authentication
- CORS configuration per tenant
- XSS prevention (input sanitization)
- No PII stored in localStorage
- Idempotency keys for POST requests

## Performance

- Bundle size: < 500KB (gzipped)
- P95 TTFB for next question: < 300ms
- P95 TTS start: < 1.2s
- Virtual scrolling for message list
- Lazy loading of components

## Analytics

The widget emits structured analytics events:

```typescript
{
  type: 'session_started' | 'question_answered' | 'voice_started' | ...,
  timestamp: string,
  sessionId: string,
  data: { /* event-specific data */ }
}
```

Provide an `onEvent` callback in the analytics config to receive events.

## License

MIT

## Support

For issues and questions, please contact the development team.

## Version History

- **v0.1.0** - Initial release
  - Core chat functionality
  - Voice integration
  - Accessibility features
  - Theming and i18n support
