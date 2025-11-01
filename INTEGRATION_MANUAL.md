# Integration Manual

This manual provides comprehensive guidance for integrating the Insurance Chat Widget into your application, setting up backend services, and running it locally for testing.

---

## Table of Contents

1. [Front-End Integration](#1-front-end-integration)
2. [Backend Integration](#2-backend-integration)
3. [Local Testing](#3-local-testing)
4. [Troubleshooting](#4-troubleshooting)

---

## 1. Front-End Integration

### 1.1 HTML Integration (Script Tag)

#### Basic Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Application</title>
  
  <!-- Widget CSS -->
  <link rel="stylesheet" href="https://cdn.example.com/insurance-chat-widget/v0.1.0/insurance-chat-widget.css">
</head>
<body>
  <!-- Your application content -->
  
  <!-- Widget Container -->
  <div id="chat-widget-container"></div>
  
  <!-- Widget JavaScript -->
  <script src="https://cdn.example.com/insurance-chat-widget/v0.1.0/insurance-chat-widget.umd.js"></script>
  <script>
    // Initialize widget when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      InsuranceChatWidget.init({
        container: document.getElementById('chat-widget-container'),
        config: {
          apiBaseUrl: 'https://api.yourdomain.com',
          tenantId: 'your-tenant-id',
          authToken: 'your-jwt-token',
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
            onEvent: function(event) {
              // Send to your analytics service
              console.log('Analytics event:', event);
              // Example: gtag('event', event.type, event.data);
            },
          },
          features: {
            voice: true,
            progress: true,
            transcript: true,
          },
        },
      });
    });
  </script>
</body>
</html>
```

#### Custom Element Method

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="https://cdn.example.com/insurance-chat-widget/v0.1.0/insurance-chat-widget.css">
  <script src="https://cdn.example.com/insurance-chat-widget/v0.1.0/insurance-chat-widget.umd.js"></script>
</head>
<body>
  <!-- Custom Element -->
  <insurance-chat-widget
    api-base-url="https://api.yourdomain.com"
    tenant-id="your-tenant-id"
    auth-token="your-jwt-token"
    theme-palette-primary="#0D47A1"
    theme-palette-secondary="#1976D2">
  </insurance-chat-widget>
</body>
</html>
```

### 1.2 React Integration

#### Installation

```bash
npm install @provider/insurance-chat-widget
```

#### Functional Component

```tsx
import React, { useEffect, useRef } from 'react';
import { InsuranceChatWidgetModule } from '@provider/insurance-chat-widget';

declare global {
  interface Window {
    InsuranceChatWidget?: {
      init: (options: {
        container: HTMLElement;
        config: any;
      }) => void;
      destroy?: () => void;
    };
  }
}

interface ChatWidgetProps {
  apiBaseUrl: string;
  tenantId: string;
  authToken: string;
  theme?: {
    palette?: {
      primary?: string;
      secondary?: string;
    };
  };
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiBaseUrl,
  tenantId,
  authToken,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current) {
      widgetInstanceRef.current = window.InsuranceChatWidget?.init({
        container: containerRef.current,
        config: {
          apiBaseUrl,
          tenantId,
          authToken,
          theme,
          analytics: {
            enabled: true,
            onEvent: (event: any) => {
              // Analytics integration
              console.log('Widget event:', event);
            },
          },
        },
      });
    }

    return () => {
      // Cleanup
      if (widgetInstanceRef.current?.destroy) {
        widgetInstanceRef.current.destroy();
      }
    };
  }, [apiBaseUrl, tenantId, authToken, theme]);

  return <div ref={containerRef} />;
};
```

#### Usage

```tsx
import { ChatWidget } from './components/ChatWidget';

function App() {
  return (
    <div>
      <h1>My Application</h1>
      <ChatWidget
        apiBaseUrl={process.env.REACT_APP_API_URL || ''}
        tenantId={process.env.REACT_APP_TENANT_ID || ''}
        authToken={getAuthToken()}
        theme={{
          palette: {
            primary: '#0D47A1',
            secondary: '#1976D2',
          },
        }}
      />
    </div>
  );
}
```

### 1.3 Vue Integration

#### Installation

```bash
npm install @provider/insurance-chat-widget
```

#### Component

```vue
<template>
  <div ref="widgetContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

interface Props {
  apiBaseUrl: string;
  tenantId: string;
  authToken: string;
  theme?: {
    palette?: {
      primary?: string;
      secondary?: string;
    };
  };
}

const props = defineProps<Props>();

const widgetContainer = ref<HTMLElement | null>(null);
let widgetInstance: any = null;

declare global {
  interface Window {
    InsuranceChatWidget?: {
      init: (options: { container: HTMLElement; config: any }) => void;
      destroy?: () => void;
    };
  }
}

onMounted(() => {
  if (widgetContainer.value) {
    widgetInstance = window.InsuranceChatWidget?.init({
      container: widgetContainer.value,
      config: {
        apiBaseUrl: props.apiBaseUrl,
        tenantId: props.tenantId,
        authToken: props.authToken,
        theme: props.theme,
        analytics: {
          enabled: true,
          onEvent: (event: any) => {
            console.log('Widget event:', event);
          },
        },
      },
    });
  }
});

onBeforeUnmount(() => {
  if (widgetInstance?.destroy) {
    widgetInstance.destroy();
  }
});
</script>
```

### 1.4 Angular Integration

#### Installation

```bash
npm install @provider/insurance-chat-widget
```

#### Module Integration

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InsuranceChatWidgetModule } from '@provider/insurance-chat-widget';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    InsuranceChatWidgetModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule { }
```

```html
<!-- app.component.html -->
<ins-chat-widget-shell></ins-chat-widget-shell>
```

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { WidgetConfigService } from '@provider/insurance-chat-widget';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private configService: WidgetConfigService) {}

  ngOnInit(): void {
    this.configService.initializeConfig({
      apiBaseUrl: environment.apiUrl,
      tenantId: environment.tenantId,
      authToken: this.getAuthToken(),
      theme: {
        palette: {
          primary: '#0D47A1',
          secondary: '#1976D2',
        },
      },
    });
  }

  private getAuthToken(): string {
    // Get token from your auth service
    return '';
  }
}
```

#### Standalone Component Integration

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetShellComponent } from '@provider/insurance-chat-widget';
import { WidgetConfigService } from '@provider/insurance-chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatWidgetShellComponent],
  template: '<ins-chat-widget-shell></ins-chat-widget-shell>',
})
export class AppComponent implements OnInit {
  constructor(private configService: WidgetConfigService) {}

  ngOnInit(): void {
    this.configService.initializeConfig({
      apiBaseUrl: environment.apiUrl,
      tenantId: environment.tenantId,
      authToken: this.getAuthToken(),
    });
  }

  private getAuthToken(): string {
    return '';
  }
}
```

### 1.5 Configuration Options

```typescript
interface WidgetConfig {
  // Required
  apiBaseUrl: string;        // Backend API base URL
  tenantId: string;          // Tenant identifier
  
  // Optional
  authToken?: string;         // JWT token for authentication
  theme?: ThemeConfig;        // Theme configuration
  analytics?: AnalyticsConfig; // Analytics configuration
  features?: {
    voice?: boolean;          // Enable voice input (default: true)
    progress?: boolean;       // Show progress indicator (default: true)
    transcript?: boolean;     // Show transcript tab (default: true)
  };
}

interface ThemeConfig {
  palette?: {
    primary?: string;         // Primary color (default: #0D47A1)
    secondary?: string;      // Secondary color (default: #1976D2)
    error?: string;          // Error color (default: #B00020)
    surface?: string;        // Surface color (default: #FAFAFA)
  };
  density?: 'comfortable' | 'compact';  // Material density
  darkMode?: boolean;         // Enable dark mode
}

interface AnalyticsConfig {
  enabled: boolean;
  onEvent: (event: AnalyticsEvent) => void;
}

interface AnalyticsEvent {
  type: string;              // Event type (e.g., 'session_started', 'question_answered')
  timestamp: string;         // ISO timestamp
  sessionId: string;         // Session ID
  data: Record<string, any>; // Event-specific data
}
```

### 1.6 Dynamic Configuration Updates

```typescript
import { WidgetConfigService } from '@provider/insurance-chat-widget';

const configService = inject(WidgetConfigService);

// Update configuration at runtime
configService.updateConfig({
  authToken: newToken,
  theme: {
    darkMode: true,
  },
});
```

### 1.7 Theme Customization

```typescript
import { ThemeService } from '@provider/insurance-chat-widget';

const themeService = inject(ThemeService);

// Apply custom theme
themeService.applyTheme({
  palette: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
  },
  density: 'compact',
  darkMode: false,
});
```

### 1.8 Analytics Integration

```typescript
const config = {
  // ... other config
  analytics: {
    enabled: true,
    onEvent: (event) => {
      // Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', event.type, {
          session_id: event.sessionId,
          timestamp: event.timestamp,
          ...event.data,
        });
      }

      // Custom analytics endpoint
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(console.error);
    },
  },
};
```

---

## 2. Backend Integration

### 2.1 API Requirements

Your backend must provide the following REST API endpoints:

#### 2.1.1 Session Management

**Create Session**
```
POST /v1/sessions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "tenantId": "tenant-123",
  "consent": {
    "recordingAccepted": true,
    "timestamp": "2025-01-12T10:00:00Z"
  },
  "applicationId": "APP-456",      // Optional
  "environment": "prod"            // Optional
}

Response: 201 Created
{
  "id": "session-789",
  "status": "active",
  "progress": 0,
  "createdAt": "2025-01-12T10:00:00Z",
  "tenantId": "tenant-123"
}
```

**Get Session**
```
GET /v1/sessions/{sessionId}
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "id": "session-789",
  "status": "active",
  "progress": 0.35,
  "createdAt": "2025-01-12T10:00:00Z",
  "updatedAt": "2025-01-12T10:05:00Z",
  "tenantId": "tenant-123"
}
```

**End Session**
```
DELETE /v1/sessions/{sessionId}
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "id": "session-789",
  "status": "completed",
  "completedAt": "2025-01-12T10:15:00Z"
}
```

#### 2.1.2 Questions

**Get Next Question**
```
GET /v1/sessions/{sessionId}/next-question
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "question": {
    "id": "q-001",
    "type": "text",
    "prompt": "Please state your full name as it appears on official ID.",
    "helpText": "Example: John Smith",
    "constraints": {
      "required": true,
      "min": 2,
      "max": 100,
      "pattern": "^[A-Za-z\\s]+$",
      "sensitive": true
    }
  },
  "isTerminal": false,
  "progress": 0.1
}

OR (when complete):

Response: 200 OK
{
  "question": null,
  "isTerminal": true,
  "progress": 1.0
}
```

#### 2.1.3 Answers

**Submit Answer**
```
POST /v1/sessions/{sessionId}/answers
Authorization: Bearer <JWT_TOKEN>
Idempotency-Key: <UNIQUE_KEY>
Content-Type: application/json

Request Body:
{
  "questionId": "q-001",
  "answer": "John Smith",
  "timestamp": "2025-01-12T10:01:00Z"
}

Response: 200 OK
{
  "accepted": true,
  "nextQuestion": {
    "question": { /* next question */ },
    "isTerminal": false,
    "progress": 0.2
  }
}

OR (validation error):

Response: 422 Unprocessable Entity
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Answer validation failed",
    "fieldErrors": [
      {
        "questionId": "q-001",
        "message": "Name must be at least 2 characters"
      }
    ]
  }
}
```

#### 2.1.4 Transcript

**Get Transcript**
```
GET /v1/sessions/{sessionId}/transcript
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "sessionId": "session-789",
  "items": [
    {
      "role": "assistant",
      "text": "Please state your full name as it appears on official ID.",
      "redacted": false,
      "timestamp": "2025-01-12T10:00:00Z"
    },
    {
      "role": "user",
      "text": "John Smith",
      "redacted": true,
      "timestamp": "2025-01-12T10:01:00Z"
    }
  ]
}
```

### 2.2 WebSocket Requirements

#### 2.2.1 ASR (Automatic Speech Recognition)

**WebSocket Connection**
```
wss://api.yourdomain.com/v1/asr?sessionId={sessionId}
Authorization: Bearer <JWT_TOKEN>
```

**Message Format - Client to Server**
```json
{
  "type": "audio_chunk",
  "data": "<base64_encoded_audio>",
  "sampleRate": 16000,
  "channels": 1
}
```

**Message Format - Server to Client**
```json
{
  "type": "partial_transcript",
  "text": "Please state your full",
  "confidence": 0.95
}

{
  "type": "final_transcript",
  "text": "Please state your full name",
  "confidence": 0.98
}

{
  "type": "error",
  "message": "ASR service unavailable"
}
```

#### 2.2.2 TTS (Text-to-Speech)

**WebSocket Connection**
```
wss://api.yourdomain.com/v1/tts?sessionId={sessionId}
Authorization: Bearer <JWT_TOKEN>
```

**Message Format - Client to Server**
```json
{
  "type": "speak",
  "text": "Please state your full name",
  "voice": "en-GB-Female"  // Optional
}
```

**Message Format - Server to Client**
```json
{
  "type": "audio_chunk",
  "data": "<base64_encoded_audio>",
  "sampleRate": 22050,
  "format": "pcm"
}

{
  "type": "complete",
  "text": "Please state your full name"
}

{
  "type": "error",
  "message": "TTS service unavailable"
}
```

### 2.3 Authentication

#### 2.3.1 JWT Token Requirements

**Token Structure:**
```json
{
  "sub": "user-123",
  "tenantId": "tenant-123",
  "iat": 1705060800,
  "exp": 1705064400,
  "aud": "insurance-chat-widget"
}
```

**Token Validation:**
- Validate signature
- Check expiration (`exp`)
- Verify audience (`aud`)
- Verify tenant ID (`tenantId`)
- Short-lived tokens (recommended: 1 hour)

#### 2.3.2 CORS Configuration

Your backend must allow CORS requests from widget domains:

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Idempotency-Key
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### 2.4 Idempotency

**Idempotency Key Header:**
```
Idempotency-Key: <unique-key-per-request>
```

**Requirements:**
- POST requests must include `Idempotency-Key` header
- Server should return same response for duplicate keys
- Keys should be unique per request
- Store keys temporarily (e.g., 24 hours)

**Implementation Example:**
```python
# Python/Flask example
from flask import request

idempotency_store = {}  # Use Redis in production

@app.route('/v1/sessions/<session_id>/answers', methods=['POST'])
def submit_answer(session_id):
    idempotency_key = request.headers.get('Idempotency-Key')
    
    # Check if request was already processed
    if idempotency_key in idempotency_store:
        return idempotency_store[idempotency_key]
    
    # Process request
    result = process_answer(request.json)
    
    # Store result
    idempotency_store[idempotency_key] = result
    # Expire after 24 hours
    
    return result
```

### 2.5 Error Handling

**Error Response Format:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "fieldErrors": [
      {
        "questionId": "q-001",
        "message": "Field-specific error"
      }
    ]
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - 422 - Answer validation failed
- `SESSION_NOT_FOUND` - 404 - Session doesn't exist
- `SESSION_EXPIRED` - 410 - Session has expired
- `UNAUTHORIZED` - 401 - Invalid or missing token
- `FORBIDDEN` - 403 - Token valid but no access
- `RATE_LIMIT_EXCEEDED` - 429 - Too many requests
- `SERVER_ERROR` - 500 - Internal server error
- `SERVICE_UNAVAILABLE` - 503 - Backend service down

### 2.6 Backend Implementation Checklist

- [ ] Implement session creation endpoint
- [ ] Implement session retrieval endpoint
- [ ] Implement session termination endpoint
- [ ] Implement next question endpoint
- [ ] Implement answer submission endpoint
- [ ] Implement transcript retrieval endpoint
- [ ] Configure WebSocket ASR endpoint
- [ ] Configure WebSocket TTS endpoint
- [ ] Implement JWT token validation
- [ ] Configure CORS headers
- [ ] Implement idempotency key handling
- [ ] Add error handling with proper HTTP status codes
- [ ] Add request logging
- [ ] Add rate limiting
- [ ] Add request validation

---

## 3. Local Testing

### 3.1 Prerequisites

**Required Software:**
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git ([Download](https://git-scm.com/))

**Optional (for full testing):**
- Docker (for backend mock services)
- Postman or similar (for API testing)

### 3.2 Project Setup

#### 3.2.1 Clone and Install

```bash
# Clone the repository (if applicable)
git clone https://github.com/provider/insurance-chat-widget.git
cd insurance-chat-widget

# Install dependencies
npm install
```

#### 3.2.2 Verify Installation

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check Angular CLI
npx ng version
```

### 3.3 Running the Demo Application

#### 3.3.1 Start Development Server

```bash
# Start the demo application
npm start

# Or use Angular CLI directly
ng serve insurance-chat-widget-demo
```

The application will be available at:
- **URL:** http://localhost:4200
- **Port:** 4200 (default)

#### 3.3.2 Access the Widget

1. Open browser to http://localhost:4200
2. Click the floating action button (FAB) to expand the widget
3. The widget should initialize and start a session

### 3.4 Mock Backend Setup

#### 3.4.1 Option 1: JSON Server (Simple Mock)

**Install JSON Server:**
```bash
npm install -g json-server
```

**Create `mock-api/db.json`:**
```json
{
  "sessions": [
    {
      "id": "session-test-123",
      "status": "active",
      "progress": 0,
      "tenantId": "test-tenant",
      "createdAt": "2025-01-12T10:00:00Z"
    }
  ],
  "questions": [
    {
      "id": "q-001",
      "type": "text",
      "prompt": "Please state your full name as it appears on official ID.",
      "helpText": "Example: John Smith",
      "constraints": {
        "required": true,
        "min": 2,
        "max": 100,
        "sensitive": true
      }
    },
    {
      "id": "q-002",
      "type": "date",
      "prompt": "What is your date of birth? (DD/MM/YYYY)",
      "helpText": "Example: 12/06/1980",
      "constraints": {
        "required": true,
        "pattern": "^\\d{2}/\\d{2}/\\d{4}$"
      }
    }
  ]
}
```

**Run JSON Server:**
```bash
json-server --watch mock-api/db.json --port 3000
```

**Update Widget Config:**
```typescript
apiBaseUrl: 'http://localhost:3000',
```

#### 3.4.2 Option 2: Mock Service Worker (MSW)

**Install MSW:**
```bash
npm install --save-dev msw
```

**Create `src/mocks/handlers.ts`:**
```typescript
import { rest } from 'msw';

export const handlers = [
  // Create session
  rest.post('http://localhost:3000/v1/sessions', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'session-mock-123',
        status: 'active',
        progress: 0,
        createdAt: new Date().toISOString(),
        tenantId: 'test-tenant',
      }),
    );
  }),

  // Get next question
  rest.get('http://localhost:3000/v1/sessions/:id/next-question', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        question: {
          id: 'q-001',
          type: 'text',
          prompt: 'Please state your full name.',
          constraints: { required: true },
        },
        isTerminal: false,
        progress: 0.1,
      }),
    );
  }),

  // Submit answer
  rest.post('http://localhost:3000/v1/sessions/:id/answers', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        accepted: true,
        nextQuestion: {
          question: {
            id: 'q-002',
            type: 'date',
            prompt: 'What is your date of birth?',
          },
          isTerminal: false,
          progress: 0.2,
        },
      }),
    );
  }),
];
```

**Setup MSW:**
```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

#### 3.4.3 Option 3: Docker Backend Mock

**Create `docker-compose.yml`:**
```yaml
version: '3.8'
services:
  mock-api:
    image: mockserver/mockserver
    ports:
      - "1080:1080"
    environment:
      - MOCKSERVER_INITIALIZATION_JSON_PATH=/config/expectations.json
    volumes:
      - ./mock-api/expectations.json:/config/expectations.json
```

**Run:**
```bash
docker-compose up
```

### 3.5 Testing Workflows

#### 3.5.1 Complete Interview Flow (Text Mode)

1. **Start Widget:**
   - Open http://localhost:4200
   - Click FAB to expand widget
   - Widget should start session automatically

2. **Answer Questions:**
   - Type answer in input field
   - Press Enter or click Send
   - Wait for next question

3. **Navigate:**
   - Use back button (if enabled) to go to previous question
   - View transcript in Transcript tab
   - Check progress indicator

4. **Complete Interview:**
   - Answer all questions
   - View completion screen
   - Close widget

#### 3.5.2 Voice Input Testing

1. **Enable Voice:**
   - Click microphone button
   - Grant microphone permission (if prompted)
   - Start speaking

2. **Voice Interaction:**
   - Hold microphone button while speaking
   - View partial transcript in real-time
   - See VU meter audio levels
   - Release button to stop recording

3. **Process Voice:**
   - Wait for final transcript
   - Edit transcript if needed
   - Submit answer

#### 3.5.3 Error Scenarios

1. **Network Error:**
   - Disconnect internet
   - Try to submit answer
   - Verify error message and retry button

2. **Validation Error:**
   - Submit invalid answer (e.g., too short)
   - Verify validation error message
   - Correct and resubmit

3. **Session Expired:**
   - Wait for session timeout
   - Verify expiration message
   - Start new session

### 3.6 Running Tests

#### 3.6.1 Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

**Coverage Report:**
- HTML report: `coverage/insurance-chat-widget/index.html`
- Terminal summary shown after tests

#### 3.6.2 E2E Tests

```bash
# Run E2E tests
npm run e2e

# Run in headed mode (see browser)
npm run e2e -- --headed

# Run specific test file
npm run e2e -- e2e/widget.spec.ts
```

**E2E Test Browsers:**
- Chromium (default)
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

#### 3.6.3 Linting

```bash
# Run linter
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

### 3.7 Debugging

#### 3.7.1 Chrome DevTools

1. **Open DevTools:** F12 or Right-click → Inspect
2. **Console Tab:** View logs and errors
3. **Network Tab:** Monitor API requests
4. **Application Tab:** View localStorage, sessionStorage
5. **Performance Tab:** Profile performance

#### 3.7.2 Debug Logging

```typescript
// Enable debug mode in widget config
const config = {
  // ... other config
  debug: true,  // Enable console logging
};
```

#### 3.7.3 Common Issues

**Widget doesn't appear:**
- Check console for errors
- Verify CSS is loaded
- Check container element exists

**API requests fail:**
- Check CORS configuration
- Verify API base URL
- Check JWT token validity
- Review Network tab in DevTools

**Voice not working:**
- Check microphone permissions
- Verify WebSocket connection
- Check browser console for errors
- Test in Chrome (best support)

**Styles not applying:**
- Verify CSS file is loaded
- Check for CSS conflicts
- Inspect element styles
- Verify theme configuration

### 3.8 Testing Checklist

#### Functionality Testing

- [ ] Widget appears on page load
- [ ] FAB expands widget correctly
- [ ] Session starts automatically
- [ ] Questions load and display
- [ ] Answers can be submitted
- [ ] Validation errors display correctly
- [ ] Next question loads after answer
- [ ] Progress indicator updates
- [ ] Transcript tab works
- [ ] Completion screen appears
- [ ] Widget can be closed

#### Voice Testing

- [ ] Microphone button works
- [ ] Permission prompt appears
- [ ] Audio levels show in VU meter
- [ ] Partial transcript displays
- [ ] Final transcript appears
- [ ] Voice input can be edited
- [ ] Silence timeout works (5 seconds)
- [ ] Escape cancels voice input

#### Accessibility Testing

- [ ] All functionality works with keyboard
- [ ] Focus indicators visible
- [ ] Screen reader announces content
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Reduced motion works
- [ ] High contrast mode works

#### Browser Testing

- [ ] Chrome (latest 2 versions)
- [ ] Edge (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 4. Troubleshooting

### 4.1 Common Front-End Issues

**Issue: Widget doesn't initialize**
- **Solution:** Check container element exists before init
- **Solution:** Verify script is loaded
- **Solution:** Check browser console for errors

**Issue: Styling conflicts**
- **Solution:** Use CSS scoping
- **Solution:** Check z-index values
- **Solution:** Verify Material theme loaded

**Issue: CORS errors**
- **Solution:** Configure backend CORS headers
- **Solution:** Verify API base URL
- **Solution:** Check credentials settings

### 4.2 Common Backend Issues

**Issue: 401 Unauthorized**
- **Solution:** Verify JWT token is valid
- **Solution:** Check token expiration
- **Solution:** Verify token signature

**Issue: 422 Validation Error**
- **Solution:** Check answer format
- **Solution:** Verify question constraints
- **Solution:** Review validation rules

**Issue: WebSocket connection fails**
- **Solution:** Use `wss://` (secure WebSocket)
- **Solution:** Check WebSocket endpoint URL
- **Solution:** Verify authentication headers

### 4.3 Getting Help

**Documentation:**
- README.md - Main documentation
- DEVELOPER_GUIDE.md - Developer guide
- INTEGRATION_EXAMPLES.md - Integration examples

**Support:**
- GitHub Issues: https://github.com/provider/insurance-chat-widget/issues
- Email: support@example.com

---

## Quick Reference

### Front-End Quick Start

```html
<script src="https://cdn.example.com/widget.js"></script>
<script>
  InsuranceChatWidget.init({
    container: document.getElementById('widget'),
    config: {
      apiBaseUrl: 'https://api.example.com',
      tenantId: 'your-tenant-id',
      authToken: 'your-jwt-token',
    },
  });
</script>
```

### Backend Quick Reference

**Required Endpoints:**
- `POST /v1/sessions` - Create session
- `GET /v1/sessions/{id}` - Get session
- `GET /v1/sessions/{id}/next-question` - Get question
- `POST /v1/sessions/{id}/answers` - Submit answer
- `GET /v1/sessions/{id}/transcript` - Get transcript
- `DELETE /v1/sessions/{id}` - End session

**WebSocket:**
- `wss://api.example.com/v1/asr` - ASR endpoint
- `wss://api.example.com/v1/tts` - TTS endpoint

### Local Testing Quick Start

```bash
npm install
npm start
# Open http://localhost:4200
```

---

**Last Updated:** 2025-01-12  
**Version:** 0.1.0

