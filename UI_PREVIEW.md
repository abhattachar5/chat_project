# Phase 1 UI Preview

## Visual Overview

This document shows what the Phase 1 UI looks like and how to view it.

## Demo Application Created

I've created a demo application that showcases the Phase 1 UI components. The demo application is located at:
```
projects/insurance-chat-widget-demo/
```

## UI Components Built in Phase 1

### 1. Floating Action Button (FAB) - Minimized State

**Location:** Bottom-right corner of the page

**Visual Description:**
- Blue circular button (Material Design FAB)
- Chat icon (💬) in the center
- Shadow elevation for depth
- Hover effect with increased shadow

**Code:** `projects/insurance-chat-widget/src/lib/components/chat-widget-shell/chat-widget-shell.component.html`
```html
<button
  mat-fab
  color="primary"
  class="ins-fab-button"
  (click)="toggleMinimize()"
  aria-label="Open chat widget">
  <mat-icon>chat</mat-icon>
</button>
```

### 2. Expanded Chat Panel - Expanded State

**Visual Description:**
- 400px width panel (responsive on mobile)
- Material Toolbar header with:
  - Title: "InsureChat"
  - Subtitle: "Application interview"
  - Minimize button (─)
  - Close button (×)
- Content area with placeholder text

**Layout Structure:**
```
┌────────────────────────────────────────────┐
│ InsureChat  Application interview    [─][×]│
├────────────────────────────────────────────┤
│                                            │
│  Chat widget content will be displayed    │
│  here.                                     │
│                                            │
│  This is a placeholder for Phase 2        │
│  development.                              │
│                                            │
└────────────────────────────────────────────┘
```

### 3. Responsive Design

**Desktop (≥768px):**
- Fixed position: bottom-right (24px from edges)
- Panel width: 400px
- Panel height: 600px
- Max dimensions respect viewport

**Mobile (<768px):**
- Panel becomes full-screen modal
- No border radius
- Position: fixed (0, 0, 0, 0)

## How to View the UI

### Option 1: Run the Demo Application (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the demo application:**
   ```bash
   ng serve insurance-chat-widget-demo
   ```
   
   Or:
   ```bash
   npm start
   ```

3. **Open in browser:**
   Navigate to `http://localhost:4200`

4. **Interact with the widget:**
   - Look for the blue FAB button in the bottom-right corner
   - Click it to expand the chat panel
   - Click the minimize button (─) to minimize
   - Click the close button (×) to close

### Option 2: Build and View Static

1. **Build the demo:**
   ```bash
   ng build insurance-chat-widget-demo
   ```

2. **Serve the built files:**
   Use any static file server (e.g., `http-server`, `serve`)

## Component Structure

```
ins-chat-widget-shell (ChatWidgetShellComponent)
├── Floating Action Button (minimized state)
│   └── Material FAB with chat icon
└── Chat Panel (expanded state)
    ├── Material Toolbar
    │   ├── Title + Subtitle
    │   └── Control buttons (minimize, close)
    └── Content Area
        └── Placeholder content
```

## Styling Features

### Theme System
- CSS custom properties for colors
- Material theme integration
- Primary color: #0D47A1 (blue)
- Responsive breakpoints

### Accessibility
- ARIA labels on all buttons
- Role="dialog" on expanded panel
- Keyboard accessible controls
- Focus indicators

### Visual Design
- Material Design elevation (shadows)
- Smooth transitions (will be added in Phase 2)
- Consistent spacing (16px padding)
- Professional blue color scheme

## Current State

✅ **Completed:**
- FAB button with chat icon
- Expandable panel
- Material Toolbar header
- Responsive layout
- Basic styling

⏳ **Coming in Phase 2:**
- Message list component
- Input bar
- Question rendering
- Session management
- Actual chat functionality

## Screenshots/Visual Reference

### Minimized State (FAB)
```
           ┌─────┐
           │  💬 │  ← Blue circular button
           └─────┘     Bottom-right corner
```

### Expanded State (Panel)
```
┌────────────────────────────────────────────┐
│ InsureChat ▾        Application interview  │
│ [Primary Blue Toolbar]          [─] [×]    │
├────────────────────────────────────────────┤
│                                            │
│  Content area (placeholder text)           │
│                                            │
│  • Chat widget content will be displayed   │
│  • This is a placeholder for Phase 2       │
│                                            │
└────────────────────────────────────────────┘
```

## Technical Details

**Component:** `ChatWidgetShellComponent`
- Location: `projects/insurance-chat-widget/src/lib/components/chat-widget-shell/`
- Template: `.component.html`
- Styles: `.component.scss`
- Logic: `.component.ts`

**State Management:**
- Uses Angular Signals (`signal()`) for reactive state
- `isMinimized` - Controls FAB visibility
- `isExpanded` - Controls panel visibility

**Dependencies:**
- Angular Material: MatButton, MatIcon, MatToolbar
- Angular Core: Component, Signals, OnInit

## Next Steps

To actually see the UI running:

1. Ensure Node.js 18+ is installed
2. Run `npm install` in the project root
3. Run `ng serve insurance-chat-widget-demo`
4. Open `http://localhost:4200` in your browser

The widget will appear as a floating button in the bottom-right corner. Click it to see the expanded panel!

