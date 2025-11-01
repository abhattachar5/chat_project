# Insurance Chat Widget - Development Plan

## Executive Summary
This document outlines the development plan for an embeddable Insurance Interview Chat Widget built with Angular 18 and Angular Material. The widget supports text and optional voice input, is WCAG 2.1 AA compliant, and integrates with a provider-side orchestrator for conducting insurance application interviews.

**Key Technologies:**
- Angular 18
- Angular Material
- WebSockets (ASR/TTS)
- REST APIs
- Web Audio API

**Project Status:** Initial Planning Phase

---

## 1. Project Phases Overview

### Phase 1: Foundation & Setup (Week 1-2)
- Project scaffolding and infrastructure
- Core module structure
- Configuration service
- Basic embedding mechanism

### Phase 2: Core Chat Functionality (Week 3-5)
- Message display and UI components
- Input handling (text mode)
- Session lifecycle management
- Basic question rendering

### Phase 3: Voice Integration (Week 6-8)
- WebSocket ASR/TTS implementation
- Voice capture and playback
- VU meter and voice UI
- Barge-in functionality

### Phase 4: Advanced Features (Week 9-11)
- Transcript view with masking
- Navigation and progress
- Error handling and resilience
- Question type variants

### Phase 5: Accessibility & Theming (Week 12-13)
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Theme system implementation

### Phase 6: Testing & Polish (Week 14-16)
- Unit and integration tests
- E2E testing with Playwright
- Accessibility audits
- Performance optimization
- Documentation

---

## 2. Detailed Task Breakdown

### 2.1 Phase 1: Foundation & Setup

#### 2.1.1 Project Initialization
**Tasks:**
- [ ] Initialize Angular 18 workspace
- [ ] Configure build tools (Angular CLI, esbuild)
- [ ] Set up TypeScript strict mode
- [ ] Configure linting (ESLint) and formatting (Prettier)
- [ ] Set up testing framework (Jasmine/Karma, Playwright)
- [ ] Configure build outputs (UMD bundle + npm package)

**Deliverables:**
- Working Angular workspace
- Build configuration
- Testing infrastructure

**Dependencies:** None

**Estimated Effort:** 3 days

---

#### 2.1.2 Angular Material Integration
**Tasks:**
- [ ] Install Angular Material dependencies
- [ ] Configure Material theme system
- [ ] Set up theme tokens and CSS custom properties
- [ ] Configure Material modules (Button, Input, Dialog, etc.)
- [ ] Create base theme service

**Deliverables:**
- Material theme foundation
- Theme service with runtime token support

**Dependencies:** 2.1.1

**Estimated Effort:** 2 days

---

#### 2.1.3 Embedding Infrastructure
**Tasks:**
- [ ] Create UMD bundle build configuration
- [ ] Implement `InsuranceChatWidget.init()` global API
- [ ] Create custom element wrapper `<insurance-chat-widget>`
- [ ] Implement configuration validation service
- [ ] Set up CORS and security headers handling

**Deliverables:**
- Embeddable script tag mechanism
- Custom element support
- Configuration validation

**Dependencies:** 2.1.1, 2.1.2

**Estimated Effort:** 4 days

---

#### 2.1.4 Core Services Foundation
**Tasks:**
- [ ] Create `WidgetConfigService` (JWT, tenant, app config)
- [ ] Create `ApiService` base (REST client with retry logic)
- [ ] Create `IdempotencyService` (idempotency key generation)
- [ ] Create `AnalyticsService` (event emission to host callback)
- [ ] Create `ThemeService` (runtime theme application)

**Deliverables:**
- Core service layer
- API communication foundation

**Dependencies:** 2.1.1

**Estimated Effort:** 3 days

---

### 2.2 Phase 2: Core Chat Functionality

#### 2.2.1 Widget Shell Component
**Tasks:**
- [ ] Create `ChatWidgetShellComponent` (main container)
- [ ] Implement floating action button (FAB) for minimized state
- [ ] Implement expandable panel (MatSidenav or MatDialog)
- [ ] Create responsive layout (desktop vs mobile)
- [ ] Implement minimize/close controls
- [ ] Add header with title and subtitle

**Deliverables:**
- Main widget container
- Minimized/expanded state management

**Dependencies:** 2.1.2, 2.1.3

**Estimated Effort:** 4 days

---

#### 2.2.2 Tab Navigation
**Tasks:**
- [ ] Create tab component (Chat/Transcript)
- [ ] Implement MatTabsModule integration
- [ ] Add keyboard navigation for tabs
- [ ] Create tab content panels
- [ ] Add ARIA labels and roles

**Deliverables:**
- Tab navigation system

**Dependencies:** 2.2.1

**Estimated Effort:** 2 days

---

#### 2.2.3 Message List Component
**Tasks:**
- [ ] Create `MessageListComponent`
- [ ] Implement virtual scrolling (CdkVirtualScrollViewport)
- [ ] Create message bubble components (assistant/user/system)
- [ ] Implement auto-scroll to newest messages
- [ ] Add ARIA live regions for assistant messages
- [ ] Implement message role styling

**Deliverables:**
- Message display system
- Virtual scrolling for performance

**Dependencies:** 2.2.2

**Estimated Effort:** 5 days

---

#### 2.2.4 Session Lifecycle Management
**Tasks:**
- [ ] Implement `SessionService` (session creation/management)
- [ ] Create `POST /v1/sessions` integration
- [ ] Handle session statuses (active, completed, canceled)
- [ ] Implement session state management (Signals/RxJS)
- [ ] Add session timeout handling

**Deliverables:**
- Session management service
- Session API integration

**Dependencies:** 2.1.4, 2.2.1

**Estimated Effort:** 3 days

---

#### 2.2.5 Question Service & Rendering
**Tasks:**
- [ ] Create `QuestionService` (fetch next question)
- [ ] Implement `GET /v1/sessions/{id}/next-question`
- [ ] Create question rendering logic
- [ ] Implement question type detection
- [ ] Create base question component

**Deliverables:**
- Question fetching and basic rendering

**Dependencies:** 2.1.4, 2.2.4

**Estimated Effort:** 3 days

---

#### 2.2.6 Input Bar Component (Text Mode)
**Tasks:**
- [ ] Create `InputBarComponent` with MatFormField/MatInput
- [ ] Implement client-side validation
- [ ] Add input masking support (for date, phone, etc.)
- [ ] Create send button with keyboard support (Enter)
- [ ] Add hint/help text display
- [ ] Implement inline error display
- [ ] Add format hints (e.g., DD/MM/YYYY)

**Deliverables:**
- Text input with validation

**Dependencies:** 2.2.3, 2.2.5

**Estimated Effort:** 4 days

---

#### 2.2.7 Answer Submission
**Tasks:**
- [ ] Create `AnswerService` (answer submission)
- [ ] Implement `POST /v1/sessions/{id}/answers`
- [ ] Handle AnswerEnvelope creation
- [ ] Implement validation error handling (422)
- [ ] Add retry logic with idempotency keys
- [ ] Update message list on submission

**Deliverables:**
- Answer submission system

**Dependencies:** 2.1.4, 2.2.6

**Estimated Effort:** 3 days

---

#### 2.2.8 Question Type Components
**Tasks:**
- [ ] Create `TextQuestionComponent`
- [ ] Create `NumberQuestionComponent`
- [ ] Create `DateQuestionComponent` (MatDatepicker)
- [ ] Create `SelectOneQuestionComponent` (MatSelect/Radio)
- [ ] Create `SelectManyQuestionComponent` (MatCheckbox)
- [ ] Create `AddressQuestionComponent`
- [ ] Create `ConsentQuestionComponent`
- [ ] Create `FileQuestionComponent` (file upload)
- [ ] Create `SignatureQuestionComponent` (with keyboard alternative)

**Deliverables:**
- All question type renderers

**Dependencies:** 2.2.6

**Estimated Effort:** 8 days

---

### 2.3 Phase 3: Voice Integration

#### 2.3.1 Consent Dialog
**Tasks:**
- [ ] Create `ConsentDialogComponent` (MatDialog)
- [ ] Implement consent UI with privacy messaging
- [ ] Handle consent acceptance/decline
- [ ] Store consent decision and timestamp
- [ ] Send consent to orchestrator in startSession
- [ ] Disable voice features if declined

**Deliverables:**
- Consent management system

**Dependencies:** 2.2.1, 2.2.4

**Estimated Effort:** 2 days

---

#### 2.3.2 Voice Service Foundation
**Tasks:**
- [ ] Create `VoiceService` (Web Audio capture)
- [ ] Implement microphone permission handling
- [ ] Create MediaStream capture logic
- [ ] Implement audio stream processing
- [ ] Add error handling for mic denial

**Deliverables:**
- Voice capture foundation

**Dependencies:** 2.1.4

**Estimated Effort:** 4 days

---

#### 2.3.3 WebSocket ASR Integration
**Tasks:**
- [ ] Create WebSocket service for ASR
- [ ] Implement `wss://.../ws/asr` connection
- [ ] Stream audio data to orchestrator
- [ ] Handle partial transcript reception
- [ ] Handle final transcript reception
- [ ] Implement connection retry logic
- [ ] Add error handling (timeouts, disconnects)

**Deliverables:**
- ASR streaming integration

**Dependencies:** 2.3.2

**Estimated Effort:** 5 days

---

#### 2.3.4 Mic Button Component
**Tasks:**
- [ ] Create `MicButtonComponent` (push-to-talk)
- [ ] Implement button states (idle/listening/processing/error)
- [ ] Add keyboard accessibility (Alt+V)
- [ ] Implement press-and-hold functionality
- [ ] Add ARIA attributes (aria-pressed)
- [ ] Add tooltips per state
- [ ] Integrate with VoiceService

**Deliverables:**
- Voice input control

**Dependencies:** 2.3.3

**Estimated Effort:** 3 days

---

#### 2.3.5 VU Meter Component
**Tasks:**
- [ ] Create `VUMeterComponent` (canvas-based)
- [ ] Implement real-time audio level visualization
- [ ] Add animated bars
- [ ] Create reduced-motion fallback (numeric dB display)
- [ ] Integrate with audio capture stream

**Deliverables:**
- Voice activity visualization

**Dependencies:** 2.3.2

**Estimated Effort:** 2 days

---

#### 2.3.6 Partial Transcript Display
**Tasks:**
- [ ] Create partial transcript UI (ghost text)
- [ ] Display partial ASR within 500ms of speech start
- [ ] Update transcript in real-time
- [ ] Move final transcript to input field
- [ ] Make final transcript editable before submit
- [ ] Handle silence timeout (default 5s, configurable)

**Deliverables:**
- Real-time transcript preview

**Dependencies:** 2.3.3, 2.2.6

**Estimated Effort:** 3 days

---

#### 2.3.7 TTS Integration
**Tasks:**
- [ ] Create WebSocket service for TTS
- [ ] Implement `wss://.../ws/tts` connection
- [ ] Request audio from orchestrator
- [ ] Stream and play audio frames
- [ ] Implement audio playback controls
- [ ] Add pause/stop functionality
- [ ] Add visible indicator during playback

**Deliverables:**
- Text-to-speech playback

**Dependencies:** 2.1.4, 2.2.5

**Estimated Effort:** 4 days

---

#### 2.3.8 Barge-in Functionality
**Tasks:**
- [ ] Implement barge-in detection (mic press or typing)
- [ ] Stop TTS playback immediately (≤200ms)
- [ ] Start voice capture or switch to text input
- [ ] Handle barge-in during playback
- [ ] Add user hint for barge-in capability

**Deliverables:**
- Barge-in feature

**Dependencies:** 2.3.4, 2.3.7

**Estimated Effort:** 2 days

---

### 2.4 Phase 4: Advanced Features

#### 2.4.1 Transcript Tab Component
**Tasks:**
- [ ] Create `TranscriptTabComponent`
- [ ] Implement transcript fetching (`GET /v1/sessions/{id}/transcript`)
- [ ] Create transcript item list
- [ ] Add role-based styling (user/assistant/system)
- [ ] Implement timestamp display
- [ ] Add filters (All/User/Assistant)
- [ ] Add search functionality

**Deliverables:**
- Transcript view

**Dependencies:** 2.2.2, 2.1.4

**Estimated Effort:** 5 days

---

#### 2.4.2 Sensitive Data Masking
**Tasks:**
- [ ] Implement masking logic for sensitive fields
- [ ] Display masked values in transcript (e.g., `••••••••`)
- [ ] Add tooltip "Sensitive information hidden"
- [ ] Ensure copy action respects masking
- [ ] Handle `constraints.sensitive=true` flag

**Deliverables:**
- Data privacy protection in UI

**Dependencies:** 2.4.1

**Estimated Effort:** 2 days

---

#### 2.4.3 Progress Indicator
**Tasks:**
- [ ] Create `ProgressComponent` (MatProgressBar + chip)
- [ ] Display progress percentage (0-100%)
- [ ] Fetch progress from orchestrator
- [ ] Make progress optional (feature flag)
- [ ] Add accessibility labels

**Deliverables:**
- Progress visualization

**Dependencies:** 2.2.1, 2.2.4

**Estimated Effort:** 2 days

---

#### 2.4.4 Navigation & History
**Tasks:**
- [ ] Implement back navigation button
- [ ] Check rules engine permission for back nav
- [ ] Disable back button when not allowed (with tooltip)
- [ ] Fetch previous question when allowed
- [ ] Allow editing of previous answers
- [ ] Update history state

**Deliverables:**
- Question navigation

**Dependencies:** 2.2.5, 2.2.7

**Estimated Effort:** 3 days

---

#### 2.4.5 Error Handling Service
**Tasks:**
- [ ] Create `ErrorHandlingService`
- [ ] Implement error catalog mapping
- [ ] Create error UI components (Snackbars/Banners)
- [ ] Handle network offline state
- [ ] Implement retry logic with exponential backoff
- [ ] Handle orchestrator timeouts
- [ ] Handle voice service outages
- [ ] Add user-friendly error messages

**Deliverables:**
- Comprehensive error handling

**Dependencies:** 2.1.4, 2.2.1

**Estimated Effort:** 4 days

---

#### 2.4.6 Completion State
**Tasks:**
- [ ] Detect `isTerminal=true` from QuestionEnvelope
- [ ] Create completion screen component
- [ ] Display completion message
- [ ] Handle session end state
- [ ] Expose `end()` API for programmatic session end

**Deliverables:**
- Interview completion handling

**Dependencies:** 2.2.4, 2.2.7

**Estimated Effort:** 2 days

---

### 2.5 Phase 5: Accessibility & Theming

#### 2.5.1 Keyboard Navigation
**Tasks:**
- [ ] Ensure all components are keyboard accessible
- [ ] Implement logical focus order
- [ ] Add keyboard shortcuts (Alt+V for mic, Enter to submit)
- [ ] Prevent focus traps
- [ ] Add visible focus indicators (≥3:1 contrast)
- [ ] Test full keyboard flow

**Deliverables:**
- Complete keyboard accessibility

**Dependencies:** All UI components

**Estimated Effort:** 5 days

---

#### 2.5.2 Screen Reader Support
**Tasks:**
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement aria-live regions (polite/assertive)
- [ ] Add ARIA roles and properties
- [ ] Ensure semantic HTML structure
- [ ] Test with NVDA, JAWS, VoiceOver
- [ ] Fix SR announcements

**Deliverables:**
- Screen reader compatibility

**Dependencies:** All UI components

**Estimated Effort:** 5 days

---

#### 2.5.3 Color Contrast & Visual Accessibility
**Tasks:**
- [ ] Audit color contrast (4.5:1 body, 3:1 large text)
- [ ] Test with tenant themes
- [ ] Support high-contrast mode
- [ ] Ensure sufficient contrast for focus indicators
- [ ] Add icon alternatives for color-only information

**Deliverables:**
- Visual accessibility compliance

**Dependencies:** 2.1.2, 2.5.4

**Estimated Effort:** 3 days

---

#### 2.5.4 Motion & Animation
**Tasks:**
- [ ] Implement `prefers-reduced-motion` support
- [ ] Disable animations when reduced motion requested
- [ ] Replace animated VU meter with numeric display
- [ ] Test motion preferences
- [ ] Ensure no seizure-inducing animations

**Deliverables:**
- Reduced motion support

**Dependencies:** 2.3.5

**Estimated Effort:** 2 days

---

#### 2.5.5 Theme System Implementation
**Tasks:**
- [ ] Complete ThemeService with runtime token application
- [ ] Support CSS custom properties mapping
- [ ] Implement light/dark mode switching
- [ ] Support density modes (comfortable/compact)
- [ ] Apply tenant-specific themes
- [ ] Validate contrast after theme application

**Deliverables:**
- Runtime theming system

**Dependencies:** 2.1.2, 2.1.4

**Estimated Effort:** 4 days

---

#### 2.5.6 Internationalization (i18n)
**Tasks:**
- [ ] Set up Angular i18n infrastructure
- [ ] Extract all UI strings to translation files
- [ ] Implement locale formatting (dates, numbers, addresses)
- [ ] Support locale switching (default en-GB)
- [ ] Test with multiple locales

**Deliverables:**
- Multi-language support foundation

**Dependencies:** 2.1.1

**Estimated Effort:** 4 days

---

### 2.6 Phase 6: Testing & Polish

#### 2.6.1 Unit Testing
**Tasks:**
- [ ] Write unit tests for all services (≥80% coverage)
- [ ] Write unit tests for components
- [ ] Test validation logic
- [ ] Test error handling paths
- [ ] Test theme service
- [ ] Test analytics events

**Deliverables:**
- Comprehensive unit test suite

**Dependencies:** All previous phases

**Estimated Effort:** 8 days

---

#### 2.6.2 Integration Testing
**Tasks:**
- [ ] Test API service integrations
- [ ] Test WebSocket connections
- [ ] Test session lifecycle
- [ ] Test question/answer flow
- [ ] Test voice capture/playback integration
- [ ] Test error recovery scenarios

**Deliverables:**
- Integration test suite

**Dependencies:** 2.6.1

**Estimated Effort:** 5 days

---

#### 2.6.3 E2E Testing with Playwright
**Tasks:**
- [ ] Set up Playwright test framework
- [ ] Create E2E test: start→complete (text mode)
- [ ] Create E2E test: start→complete (voice mode)
- [ ] Create E2E test: back/forward navigation
- [ ] Create E2E test: error recoveries
- [ ] Create E2E test: transcript view
- [ ] Test embedding scenarios
- [ ] Test responsive layouts

**Deliverables:**
- E2E test coverage

**Dependencies:** All previous phases

**Estimated Effort:** 6 days

---

#### 2.6.4 Accessibility Audits
**Tasks:**
- [ ] Run automated a11y tests (axe-core, pa11y-ci)
- [ ] Manual SR testing (NVDA, JAWS, VoiceOver)
- [ ] Keyboard-only testing
- [ ] High-contrast mode testing
- [ ] Reduced motion testing
- [ ] Fix all critical/serious issues
- [ ] Document a11y compliance

**Deliverables:**
- WCAG 2.1 AA compliance report

**Dependencies:** 2.5.1, 2.5.2, 2.5.3, 2.5.4

**Estimated Effort:** 5 days

---

#### 2.6.5 Performance Optimization
**Tasks:**
- [ ] Profile application performance
- [ ] Optimize bundle size (tree-shaking, code splitting)
- [ ] Optimize virtual scrolling performance
- [ ] Optimize WebSocket message handling
- [ ] Ensure P95 < 300ms TTFB for next question
- [ ] Ensure P95 < 1.2s TTS start
- [ ] Run Lighthouse audits
- [ ] Optimize for mobile performance

**Deliverables:**
- Performance-optimized build

**Dependencies:** All previous phases

**Estimated Effort:** 4 days

---

#### 2.6.6 Security Audits
**Tasks:**
- [ ] Dependency vulnerability scanning (Snyk)
- [ ] Test CORS configuration
- [ ] Test JWT validation
- [ ] Test idempotency key handling
- [ ] Review CSP headers
- [ ] Test XSS prevention
- [ ] Security documentation

**Deliverables:**
- Security audit report

**Dependencies:** 2.1.3, 2.1.4

**Estimated Effort:** 3 days

---

#### 2.6.7 Browser Compatibility Testing
**Tasks:**
- [ ] Test on latest 2 versions of Chrome
- [ ] Test on latest 2 versions of Edge
- [ ] Test on latest 2 versions of Firefox
- [ ] Test on latest 2 versions of Safari
- [ ] Test on mobile browsers (iOS Safari, Chrome Android)
- [ ] Fix compatibility issues
- [ ] Document browser support

**Deliverables:**
- Browser compatibility report

**Dependencies:** All previous phases

**Estimated Effort:** 4 days

---

#### 2.6.8 Documentation
**Tasks:**
- [ ] Create README with setup instructions
- [ ] Document embedding API
- [ ] Document configuration options
- [ ] Create integration examples
- [ ] Document theming system
- [ ] Create developer guide
- [ ] Document analytics events
- [ ] Create migration guide (for future versions)

**Deliverables:**
- Complete documentation

**Dependencies:** All previous phases

**Estimated Effort:** 4 days

---

#### 2.6.9 Packaging & Distribution
**Tasks:**
- [ ] Configure npm package (`@provider/insurance-chat-widget`)
- [ ] Create UMD bundle build
- [ ] Set up CDN distribution
- [ ] Configure versioning (SemVer)
- [ ] Create changelog
- [ ] Test package installation
- [ ] Test embedding from CDN

**Deliverables:**
- Published npm package and CDN bundle

**Dependencies:** 2.1.3

**Estimated Effort:** 3 days

---

## 3. Technical Architecture

### 3.1 Module Structure
```
InsuranceChatWidgetModule
├── ChatWidgetShellComponent
├── MessageListComponent
├── InputBarComponent
├── MicButtonComponent
├── VUMeterComponent
├── TranscriptTabComponent
├── ProgressComponent
├── ConsentDialogComponent
├── QuestionComponents (text, number, date, select, etc.)
├── Services
│   ├── WidgetConfigService
│   ├── SessionService
│   ├── QuestionService
│   ├── AnswerService
│   ├── VoiceService
│   ├── ApiService
│   ├── WebSocketService
│   ├── AnalyticsService
│   ├── ThemeService
│   └── ErrorHandlingService
└── Models (interfaces, types)
```

### 3.2 State Management
- **Angular Signals** for reactive state
- **RxJS Observables** for async streams
- **In-memory state** (no localStorage for PII)
- **Session state** managed by SessionService

### 3.3 API Integration
- **REST APIs** for session/question/answer management
- **WebSocket** for ASR/TTS streaming
- **Retry logic** with exponential backoff
- **Idempotency keys** for POST requests

### 3.4 Security
- **JWT bearer tokens** (short-lived)
- **CORS restrictions** per tenant
- **No direct OpenAI connections** from client
- **PII handling** with in-memory storage only

---

## 4. Risk Assessment & Mitigation

### 4.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| WebSocket connection instability | High | Medium | Implement robust reconnection logic, fallback to REST |
| Browser compatibility issues | High | Medium | Early testing, polyfills, progressive enhancement |
| Performance on low-end devices | Medium | Medium | Virtual scrolling, lazy loading, performance budgets |
| Microphone permission denial | Medium | Low | Graceful degradation to text-only mode |
| Voice latency issues | Medium | Medium | Optimize streaming, set realistic expectations |

### 4.2 Timeline Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | High | Medium | Strict adherence to requirements, change control |
| Integration delays with orchestrator | High | Medium | Early API contract agreement, mock services |
| Accessibility compliance gaps | High | Low | Early a11y testing, continuous audits |

---

## 5. Dependencies & Prerequisites

### 5.1 External Dependencies
- **Orchestrator API** must be available (or mocked for development)
- **WebSocket endpoints** configured and accessible
- **JWT provider** for authentication tokens
- **CDN infrastructure** for widget distribution

### 5.2 Development Dependencies
- Node.js 18+ and npm
- Angular CLI 18+
- TypeScript 5.0+
- Testing tools (Jasmine, Playwright)

### 5.3 Design Dependencies
- Finalized UX designs (wireframes approved)
- Theme tokens defined
- Copy/microcopy finalized
- Accessibility acceptance criteria agreed

---

## 6. Success Criteria

### 6.1 Functional
- [ ] All question types render correctly
- [ ] Text and voice input work end-to-end
- [ ] Transcript view with masking functions
- [ ] Error recovery works in all scenarios
- [ ] Session lifecycle managed correctly

### 6.2 Non-Functional
- [ ] WCAG 2.1 AA compliance (zero critical/serious issues)
- [ ] P95 < 300ms TTFB for next question
- [ ] P95 < 1.2s TTS start
- [ ] Works on latest 2 versions of major browsers
- [ ] Bundle size < 500KB (gzipped)
- [ ] ≥80% unit test coverage

### 6.3 Integration
- [ ] Successfully embeds via script tag
- [ ] Successfully embeds as custom element
- [ ] Theme customization works
- [ ] Analytics events emitted correctly
- [ ] Multi-tenant configuration supported

---

## 7. Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Foundation | 2 weeks | Project setup, embedding, core services |
| Phase 2: Core Chat | 3 weeks | UI, message display, text input, question types |
| Phase 3: Voice | 3 weeks | Voice capture, ASR/TTS, barge-in |
| Phase 4: Advanced | 3 weeks | Transcript, navigation, errors |
| Phase 5: A11y & Theme | 2 weeks | WCAG compliance, theming |
| Phase 6: Testing | 3 weeks | Tests, audits, documentation |

**Total Estimated Duration: 16 weeks (4 months)**

---

## 8. Team Structure Recommendations

### 8.1 Core Team
- **1 Frontend Lead Developer** (Angular expertise)
- **2 Frontend Developers** (component development)
- **1 QA Engineer** (testing, accessibility)
- **1 UX/Designer** (design review, accessibility guidance)

### 8.2 Supporting Roles
- **Backend Engineer** (orchestrator integration support)
- **DevOps Engineer** (CI/CD, CDN setup)
- **Product Owner** (requirements clarification)

---

## 9. Next Steps

1. **Stakeholder Review** of this development plan
2. **Resource Allocation** - Confirm team members
3. **API Contract Agreement** - Finalize orchestrator API spec
4. **Design Review** - Approve final UX designs
5. **Kickoff Meeting** - Align team on requirements
6. **Begin Phase 1** - Start project setup

---

## 10. Open Questions & Decisions Needed

1. **Orchestrator API Availability** - Is mock service needed for development?
2. **Theme Tokens** - Final list of customizable tokens?
3. **Locales** - Beyond en-GB, which locales for launch?
4. **File Upload Limits** - Maximum file size and MIME types?
5. **Progress Calculation** - Rules engine provides percentage or steps?
6. **Back Navigation Rules** - Field-level or section-level granularity?

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Owner:** Development Team  
**Status:** Draft for Review

