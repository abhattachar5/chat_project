# Integration Examples

## Basic HTML Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Insurance Chat Widget</title>
  <link rel="stylesheet" href="https://cdn.example.com/insurance-chat-widget.css">
</head>
<body>
  <div id="chat-widget-container"></div>
  
  <script src="https://cdn.example.com/insurance-chat-widget.js"></script>
  <script>
    InsuranceChatWidget.init({
      container: document.getElementById('chat-widget-container'),
      config: {
        apiBaseUrl: 'https://api.example.com',
        tenantId: 'tenant-123',
        authToken: 'your-jwt-token',
      },
    });
  </script>
</body>
</html>
```

## React Integration

```tsx
import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    InsuranceChatWidget: {
      init: (options: { container: HTMLElement; config: any }) => void;
    };
  }
}

function ChatWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      window.InsuranceChatWidget.init({
        container: containerRef.current,
        config: {
          apiBaseUrl: process.env.REACT_APP_API_URL,
          tenantId: process.env.REACT_APP_TENANT_ID,
          authToken: getAuthToken(),
        },
      });
    }
  }, []);
  
  return <div ref={containerRef} />;
}
```

## Vue Integration

```vue
<template>
  <div ref="widgetContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

declare global {
  interface Window {
    InsuranceChatWidget: {
      init: (options: { container: HTMLElement; config: any }) => void;
    };
  }
}

const widgetContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  if (widgetContainer.value) {
    window.InsuranceChatWidget.init({
      container: widgetContainer.value,
      config: {
        apiBaseUrl: import.meta.env.VITE_API_URL,
        tenantId: import.meta.env.VITE_TENANT_ID,
        authToken: getAuthToken(),
      },
    });
  }
});
</script>
```

## Angular Integration (Module)

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

## Angular Integration (Standalone)

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetShellComponent } from '@provider/insurance-chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChatWidgetShellComponent],
  template: '<ins-chat-widget-shell></ins-chat-widget-shell>',
})
export class AppComponent { }
```

## Theming Example

```typescript
import { ThemeService } from '@provider/insurance-chat-widget';

const themeService = inject(ThemeService);

// Apply custom theme
themeService.applyTheme({
  palette: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    error: '#FF1744',
    surface: '#FFFFFF',
  },
  density: 'compact',
  darkMode: false,
});
```

## Analytics Integration

```typescript
InsuranceChatWidget.init({
  container: document.getElementById('widget-container'),
  config: {
    apiBaseUrl: 'https://api.example.com',
    tenantId: 'tenant-123',
    analytics: {
      enabled: true,
      onEvent: (event) => {
        // Send to Google Analytics
        gtag('event', event.type, {
          session_id: event.sessionId,
          timestamp: event.timestamp,
          ...event.data,
        });
        
        // Send to custom analytics
        fetch('/api/analytics', {
          method: 'POST',
          body: JSON.stringify(event),
        });
      },
    },
  },
});
```

## Dynamic Theme Switching

```typescript
const themeService = inject(ThemeService);

// Switch to dark mode
themeService.applyTheme({
  darkMode: true,
});

// Switch to light mode
themeService.applyTheme({
  darkMode: false,
});

// Update colors
themeService.applyTheme({
  palette: {
    primary: '#00BCD4',
    secondary: '#009688',
  },
});
```

## Locale Configuration

```typescript
import { I18nService } from '@provider/insurance-chat-widget';

const i18n = inject(I18nService);

// Set locale
i18n.setLocale('en-US');

// Format dates
const date = i18n.formatDate(new Date(), {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

// Format currency
const price = i18n.formatCurrency(1234.56, 'USD');
```

## Error Handling

```typescript
// Handle errors globally
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.source === 'insurance-chat-widget') {
    // Log error
    console.error('Widget error:', event.reason);
    
    // Show user-friendly message
    showNotification('An error occurred. Please try again.');
  }
});
```

## Multi-Tenant Configuration

```typescript
// Tenant-specific configuration
const tenantConfigs = {
  'tenant-1': {
    theme: { palette: { primary: '#FF0000' } },
    features: { voice: true },
  },
  'tenant-2': {
    theme: { palette: { primary: '#0000FF' } },
    features: { voice: false },
  },
};

const tenantId = getCurrentTenantId();
const config = tenantConfigs[tenantId];

InsuranceChatWidget.init({
  container: document.getElementById('widget-container'),
  config: {
    apiBaseUrl: 'https://api.example.com',
    tenantId,
    ...config,
  },
});
```

## Custom Element Integration

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.example.com/insurance-chat-widget.js"></script>
  <script>
    // Widget registers custom element automatically
  </script>
</head>
<body>
  <insurance-chat-widget
    api-base-url="https://api.example.com"
    tenant-id="tenant-123"
    auth-token="your-jwt-token">
  </insurance-chat-widget>
</body>
</html>
```

## React Hook Example

```tsx
import { useEffect, useRef } from 'react';

function useChatWidget(config: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      widgetRef.current = window.InsuranceChatWidget.init({
        container: containerRef.current,
        config,
      });
    }
    
    return () => {
      if (widgetRef.current?.destroy) {
        widgetRef.current.destroy();
      }
    };
  }, [config]);
  
  return { containerRef };
}
```

