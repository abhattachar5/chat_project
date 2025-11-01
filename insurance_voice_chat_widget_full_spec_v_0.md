# Insurance Voice Chat Widget – Full Specification (v0.1)

> **Summary**: An embeddable Angular 18 + Angular Material chat widget with optional voice mode to conduct interactive insurance application interviews. Backed by a provider-side orchestrator that integrates a business rules engine and OpenAI Voice. Fully WCAG 2.1 AA compliant. **Note:** per stakeholder decision, **no human handoff API** is included.

---

## 0) Scope & Assumptions (Confirmed)
- **Primary goals:** Increase completion rate and data quality for insurance application interviews; reduce call-centre load.
- **Users:** Public applicants via host websites (no login required). Secondary personas: host integrator (developer) and provider operator (observability/compliance).
- **Embedding:** Script tag + custom element wrapper around Angular app; host passes signed JWT, applicationId, environment, and optional theme/locale.
- **Conversation control:** Rules engine determines next question; AI may paraphrase/clarify.
- **Validation:** Client-side formatting; authoritative server-side validation.
- **Voice:** Push-to-talk mic capture; streaming ASR; streaming TTS; barge-in; graceful text fallback.
- **Transcripts:** Full Q&A stored provider-side; UI masks sensitive fields.
- **Compliance:** WCAG 2.1 AA; GDPR/UK GDPR; 7-year retention; data-subject deletion API.
- **Security:** TLS; short-lived JWT (aud+scope); consent modal before mic use; rate-limiting.
- **Protocols:** REST for control; WebSocket for streaming (ASR/TTS). Idempotency keys on POST.
- **Performance targets:** P95 < 300ms TTFB for next question (text path), P95 < 1.2s TTS start.
- **Delivery:** npm package and embeddable UMD bundle; supports latest two versions of major browsers.
- **Localization:** en-GB baseline; locale passed via config.
- **Change to baseline:** **No human handoff API**.  
**Clarification:** **Voice processing is provider-side only.** The widget streams audio **only** to the provider **orchestrator**; the orchestrator performs all interactions with OpenAI Voice server-to-server. The client never connects directly to OpenAI.

---

## 1) High-Level Architecture

### 1.1 Components
- **Host App (Client Website)** embeds `<insurance-chat-widget>` via script tag.
- **Widget (Angular 18 + Material)** handles UI, voice capture/playback, accessibility, and sends/receives messages. **It connects only to the provider orchestrator** for both REST and WS.
- **Provider Orchestrator (Backend)** authenticates, brokers interview flow, calls rules engine, and **invokes OpenAI Voice server-to-server**. (The client never connects to OpenAI directly.)
- **Business Rules Engine** returns canonical next-question and validates answers.
- **OpenAI Voice Service** provides streaming ASR/TTS, **accessed exclusively by the orchestrator**.
- **Transcript Store** durable audit log of Q&A with timestamps and redaction metadata.
- **Observability Stack** tracing, logs, metrics (OpenTelemetry), analytics events.

### 1.2 Sequence Overview (Happy Path)
1. Host loads script → init widget with config+JWT.
2. Widget starts session (`POST /v1/sessions`).
3. Orchestrator fetches first question from Rules Engine.
4. Widget renders question; user answers via text or voice.
5. For voice, widget opens **WebSocket to the orchestrator** at `/ws/asr` for live partials; orchestrator streams audio to OpenAI Voice and relays partial/final transcripts back to the widget.
6. On final transcript → `POST /answers` to orchestrator.
7. For TTS, widget opens **WebSocket to orchestrator** at `/ws/tts`; orchestrator calls OpenAI Voice and streams audio frames down to the widget; barge-in supported.
8. On completion, orchestrator finalizes, stores transcript, returns outcome.

### 1.3 ASCII Diagram
```
[Host Site]
   |
   |  <script> + <insurance-chat-widget>
   v
[Angular Widget]
   |   \
   | REST \__  and  __ WS (ASR/TTS)
   v        \
[Orchestrator]  <==>  [OpenAI Voice]
     |                  (server-to-server)
     <==> [Rules Engine]
     |
     +--> [Transcript Store]
     +--> [Observability / Analytics]
```

### 1.4 Deployment & Tenancy
- Multi-tenant orchestrator with tenant-config fetched at session start.
- Tenant-bound theming and content.

### 1.5 Security
- JWT (bearer) from host; short-lived (≤ 15 min) with aud+iss validation.
- `Idempotency-Key` header for POSTs to avoid duplicates.
- CORS locked to allowlisted host origins per tenant.
- **Media Privacy:** Audio never leaves the provider domain from the client; all ASR/TTS calls are server-side from the orchestrator to OpenAI. Optional regional routing (EU/UK) at orchestrator level.
- **Network Egress Control:** Only orchestrator has outbound access to OpenAI endpoints; widget is denied direct egress to third parties.

---

## 2) Requirements Matrix (User Stories + Acceptance Criteria)

### 2.1 Applicant
1. **Start Interview**
   - *Story:* As an applicant, I can start an interview without logging in.
   - *AC:* Given a valid host JWT, when I open the widget, I see a consent screen (mic, data use). On acceptance, the first question loads within 300ms P95.

2. **Answer via Text**
   - *AC:* For each question type (text, number, date, single/multi-select, address, consent, file-upload, signature), I can enter data with client-side hints and masks; invalid fields show inline error with SR-friendly message.

3. **Answer via Voice (Push-to-Talk)**
   - *AC:* When I hold or click mic, I see a VU meter and partial transcription in <500ms; releasing finalizes transcript; I can cancel.

4. **Barge-in**
   - *AC:* While TTS plays, pressing mic or typing stops playback immediately (<200ms) and captures my input.

5. **Review Transcript**
   - *AC:* A Transcript tab shows chronological Q&A with timestamps; sensitive values are redacted (e.g., `****-****-1234`).

6. **Navigation**
   - *AC:* I can step back to the previous question (where allowed by rules) and edit; history updates accordingly.

7. **Accessibility**
   - *AC:* Entire flow is operable by keyboard, screen readers announce new messages via ARIA live regions, and focus order is logical.

8. **Error Handling**
   - *AC:* If network or mic fails, I receive actionable guidance and can continue in text mode.

### 2.2 Host Integrator (Developer)
1. **Embed the Widget**
   - *AC:* Adding a script tag and calling `InsuranceChatWidget.init({...})` renders a floating button that expands into the chat panel.

2. **Configuration**
   - *AC:* I can pass theme, locale, tenantId, applicationId, and feature flags; all validated with errors on console and UI if critical.

3. **Analytics Hook**
   - *AC:* I can subscribe to structured events (e.g., `interview.started`, `question.answered`, `interview.completed`).

4. **Theming**
   - *AC:* CSS custom properties / Material tokens allow light/dark and brand color override without rebuild.

### 2.3 Provider Operator
1. **Observability**
   - *AC:* Each session emits correlation IDs; traces span widget→orchestrator→rules→voice.

2. **Transcript Retention & Export**
   - *AC:* Transcripts stored 7 years; retrievable via API; redaction markers preserved; CSV/PDF export available via backend APIs (not in widget).

3. **Privacy**
   - *AC:* GDPR deletion API removes or anonymizes records within SLA.

---

## 3) Non-Functional Requirements
- **Performance:** As stated; streaming partials under 500ms; TTS start under 1.2s P95.
- **Scalability:** Target ≥ 5k concurrent sessions per tenant.
- **Reliability:** WS reconnect with exponential backoff; REST retries with idempotency; circuit breakers around Rules/Voice.
- **Browser Support:** Latest 2 versions of Chrome, Edge, Firefox, Safari; mobile browsers on iOS/Android.

---

## 4) API Contract (Draft)

### 4.1 OpenAPI 3.1 (REST)
```yaml
openapi: 3.1.0
info:
  title: Insurance Interview Orchestrator API
  version: 0.1.0
servers:
  - url: https://api.provider.example
security:
  - bearerAuth: []
paths:
  /v1/sessions:
    post:
      summary: Start a new interview session
      operationId: startSession
      parameters:
        - in: header
          name: Idempotency-Key
          required: false
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/StartSessionRequest'
      responses:
        '201':
          description: Session created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'
  /v1/sessions/{sessionId}:
    get:
      summary: Get session status
      parameters:
        - in: path
          name: sessionId
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Current session state
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Session'
    delete:
      summary: Cancel/End session
      parameters:
        - in: path
          name: sessionId
          required: true
          schema: { type: string }
      responses:
        '204': { description: Ended }
  /v1/sessions/{sessionId}/next-question:
    get:
      summary: Fetch the current/next question
      parameters:
        - in: path
          name: sessionId
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Question payload
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuestionEnvelope'
  /v1/sessions/{sessionId}/answers:
    post:
      summary: Submit an answer
      operationId: submitAnswer
      parameters:
        - in: path
          name: sessionId
          required: true
          schema: { type: string }
        - in: header
          name: Idempotency-Key
          required: false
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AnswerEnvelope'
      responses:
        '200':
          description: Acknowledged; next state
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QuestionEnvelope'
        '422':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
  /v1/sessions/{sessionId}/transcript:
    get:
      summary: Get transcript for a session
      parameters:
        - in: path
          name: sessionId
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Transcript
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Transcript'
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    StartSessionRequest:
      type: object
      required: [tenantId, applicationId, locale, consent]
      properties:
        tenantId: { type: string }
        applicationId: { type: string }
        locale: { type: string, example: en-GB }
        theme: { $ref: '#/components/schemas/Theme' }
        consent:
          type: object
          required: [recordingAccepted]
          properties:
            recordingAccepted: { type: boolean }
            timestamp: { type: string, format: date-time }
    Session:
      type: object
      properties:
        id: { type: string }
        status: { type: string, enum: [active, completed, canceled] }
        createdAt: { type: string, format: date-time }
        locale: { type: string }
        progress: { type: number, minimum: 0, maximum: 1 }
    QuestionEnvelope:
      type: object
      properties:
        sessionId: { type: string }
        question: { $ref: '#/components/schemas/Question' }
        ttsHint: { type: string, description: 'Optional text optimized for TTS' }
        isTerminal: { type: boolean }
    Question:
      type: object
      required: [id, type, prompt]
      properties:
        id: { type: string }
        type:
          type: string
          enum: [text, number, date, selectOne, selectMany, address, consent, file, signature]
        prompt: { type: string }
        helpText: { type: string }
        options:
          type: array
          items: { $ref: '#/components/schemas/Option' }
        constraints:
          type: object
          properties:
            required: { type: boolean }
            min: { type: number }
            max: { type: number }
            pattern: { type: string }
            mask: { type: string }
            sensitive: { type: boolean }
    Option:
      type: object
      properties:
        value: { type: string }
        label: { type: string }
    AnswerEnvelope:
      type: object
      required: [questionId, answer]
      properties:
        questionId: { type: string }
        answer: { oneOf: [ { type: string }, { type: number }, { type: boolean }, { type: array, items: { type: string } }, { type: object } ] }
        inputMode: { type: string, enum: [text, voice, file] }
        timestamp: { type: string, format: date-time }
        meta:
          type: object
          properties:
            asrConfidence: { type: number }
            rawAudioRef: { type: string, description: 'Server-side reference to audio chunk if stored' }
    Transcript:
      type: object
      properties:
        sessionId: { type: string }
        items:
          type: array
          items: { $ref: '#/components/schemas/TranscriptItem' }
    TranscriptItem:
      type: object
      properties:
        role: { type: string, enum: [system, widget, user, rules] }
        text: { type: string }
        redacted: { type: boolean }
        timestamp: { type: string, format: date-time }
    ValidationError:
      type: object
      properties:
        code: { type: string }
        message: { type: string }
        fieldErrors:
          type: array
          items:
            type: object
            properties:
              questionId: { type: string }
              message: { type: string }
    Theme:
      type: object
      properties:
        palette: { type: object }
        density: { type: string, enum: [comfortable, compact] }
```

### 4.2 WebSocket Channels
- **ASR**: `wss://api.provider.example/ws/asr?sessionId=...`
  - **Client→Server** frames (binary PCM/Opus or JSON control):
    ```json
    { "type": "start", "lang": "en-GB", "sampleRate": 48000 }
    { "type": "audio", "payload": "<base64>" }
    { "type": "stop" }
    { "type": "cancel" }
    ```
  - **Server→Client**:
    ```json
    { "type": "partial", "text": "date of b...", "confidence": 0.78 }
    { "type": "final", "text": "date of birth is 12 June 1980", "confidence": 0.94 }
    { "type": "error", "code": "mic_denied", "message": "Microphone permission denied" }
    ```

- **TTS**: `wss://api.provider.example/ws/tts?sessionId=...`
  - **Client→Server**:
    ```json
    { "type": "start", "voice": "neutral-uk", "text": "Please state your full name." }
    { "type": "stop" }
    ```
  - **Server→Client**:
    - Binary audio frames (Opus/PCM) interleaved with JSON markers:
    ```json
    { "type": "marker", "name": "sentence", "index": 0 }
    { "type": "done" }
    { "type": "error", "code": "tts_unavailable" }
    ```

---

## 5) Embedding & Initialization

### 5.1 UMD Script Embed
```html
<script src="https://cdn.provider.example/widget/insurance-chat-widget.umd.js" defer></script>
<script>
  window.InsuranceChatWidget.init({
    mount: '#chat-root',          // optional selector; defaults to floating bubble
    jwt: '<SIGNED_JWT>',
    tenantId: 'acme',
    applicationId: 'APP-123',
    environment: 'prod',          // prod|staging
    locale: 'en-GB',
    theme: {
      palette: { primary: '#0D47A1', secondary: '#1976D2' },
      density: 'comfortable'
    },
    features: { voice: true, showProgress: true },
    analytics: (event) => { window.dataLayer?.push({ event: 'insurance_widget', ...event }); }
  });
</script>
```

### 5.2 Angular Element (Custom Element) Wrapper
- Expose `<insurance-chat-widget>` custom element for frameworks without Angular.
- Attributes mirror config; mutations update live.

---

## 6) Angular 18 + Material Component Breakdown

**Module:** `InsuranceChatWidgetModule`

**Key Components & Services:**
- `ChatWidgetShellComponent`
  - Floating Action Button (MAT-FAB) → expandable panel (`MatSidenav` or `MatDialog` based shell)
  - State with Angular Signals; DI-configured `WidgetConfig`
- `MessageListComponent`
  - Virtual scroll (`CdkVirtualScrollViewport`), message bubbles (`MatCard`), SR-friendly announcements (`aria-live="polite"`)
- `InputBarComponent`
  - `MatFormField` + `MatInput` with validation; send button (`MatButton`)
- `MicButtonComponent`
  - Push-to-talk with `CDK` a11y; shows `VUMeterComponent`
- `VUMeterComponent`
  - Canvas-based meter with reduced-motion fallback (numeric level)
- `TranscriptTabComponent`
  - `MatTabsModule` with Transcript tab; filters (user/system), export (UI) disabled; redaction badges
- `ProgressStepperComponent`
  - `MatProgressBar` or custom progress chip; percentage and step label
- `ConsentDialogComponent`
  - `MatDialog`; explicit consent wording; links to privacy
- `ErrorSnackbarService`
  - `MatSnackBar` for transient errors
- `ThemeService`
  - Applies CSS vars/Material tokens at runtime
- `VoiceService`
  - WebAudio capture; WS to ASR/TTS; barge-in management
- `ApiService`
  - REST calls; retry & idempotency
- `AnalyticsService`
  - Emits events and forwards to host callback

**Material Modules Used:** Button, Icon, Card, List, FormField, Input, Checkbox, Radio, Datepicker, Select, Tabs, ProgressBar, Dialog, SnackBar, Tooltip.

**State & Data Flow:** Signals + RxJS for streams; strict typing for `Question`, `Answer`, `TranscriptItem` per API schemas.

---

## 7) WCAG 2.1 AA Accessibility Checklist (Widget)

**Perceivable**
- [ ] Text alternatives for all non-text UI (icons, mic state, VU meter has text equivalent)
- [ ] Captions/Live transcript visible; SR announces new messages via `aria-live="polite"`
- [ ] Color contrast ≥ 4.5:1; test theme overrides; high-contrast mode token set
- [ ] Reflow at 320 CSS px without loss of content; responsive layout verified
- [ ] Text spacing customizations do not break layout

**Operable**
- [ ] Full keyboard operation; visible focus indicator; logical tab order
- [ ] Shortcuts non-character-based or customizable; no single-key traps
- [ ] Provide pause/stop for TTS; barge-in with keyboard
- [ ] Time limits: none by default; if any, provide extend option
- [ ] Target sizes ≥ 24×24 px; touch-friendly

**Understandable**
- [ ] Clear labels and instructions; inline helpText read by SR
- [ ] Consistent navigation and component behavior
- [ ] Error prevention for sensitive inputs (confirmations/validation)

**Robust**
- [ ] Valid semantic HTML; ARIA only when needed
- [ ] Name/role/value correctly exposed for custom elements
- [ ] SR testing: NVDA + Firefox (Windows), JAWS + Chrome (Windows), VoiceOver + Safari (macOS/iOS)

**Testing Pipeline**
- Automated: `axe-core`, `@axe-core/playwright`, `pa11y-ci`
- Manual: Screen reader pass, keyboard-only pass, high-contrast mode, reduced motion

---

## 8) Analytics & Event Schema (Widget → Host)
```json
{
  "event": "question.asked",
  "sessionId": "...",
  "questionId": "q_dob",
  "timestamp": "2025-11-01T12:00:00Z"
}
```
Other events: `interview.started`, `interview.completed`, `input.voice.start`, `input.voice.partial`, `input.voice.final`, `answer.submitted`, `validation.failed`, `tts.start`, `tts.end`, `error`.

---

## 9) Error States & UX Copy
- **Mic blocked:** “Microphone access is blocked. You can continue by typing or enable access in your browser settings.”
- **Network offline:** “You’re offline. We’ll retry automatically when connection resumes.”
- **Rules timeout:** “We’re taking longer than expected. You can retry or continue later.”
- **Voice unavailable:** “Voice is temporarily unavailable; switching to text.”

---

## 10) Test Plan & Quality Gates
- **Unit:** Component/service coverage ≥ 80%.
- **E2E:** Playwright flows: start→complete (text), start→complete (voice), back/forward, error recoveries.
- **A11y:** axe must pass with 0 critical/serious issues.
- **Performance:** Lighthouse/PSI budgets; TTI < 3s on mid-tier mobile; WS latency synthetic checks.
- **Security:** Dependency scanning (Snyk), CSP in embed docs, CORS allowlist tests.

---

## 11) Packaging & Delivery
- **Artifacts:**
  - `@provider/insurance-chat-widget` (Angular lib)
  - `insurance-chat-widget.umd.js` (embeddable)
- **SemVer:** `MAJOR.MINOR.PATCH` with migration notes.
- **CDN:** Immutable file names with content hashes; fallback to npm install path.

---

## 12) Sample Acceptance Criteria (End-to-End)
1. **Consent & Start**
   - Given `features.voice=true`, when the widget loads, a consent dialog appears; declining disables mic features but allows text.
2. **Partial Transcripts**
   - When speaking for ≥ 1s, partial captions appear in ≤ 500ms; when stopping, final text appears and is editable before submit.
3. **Redaction**
   - When viewing Transcript tab, answers flagged `constraints.sensitive=true` display as masked; hovering/focus reveals tooltip “Sensitive information hidden”.
4. **Barge-in**
   - While TTS plays, pressing Space on the mic button stops audio in ≤ 200ms and starts capture.
5. **Keyboard Path**
   - Entire interview is completable with keyboard alone; all interactive controls reachable in a predictable sequence; no focus loss.

---

## 13) Data Model Notes
- **Question IDs** stable across rules versions; orchestrator maps legacy IDs.
- **Transcript Items** include roles (`user`, `widget`, `rules`, `system`) and pointers to audio segments where available.
- **PII** tagging on fields drives masking and storage policies.

---

## 14) Open Questions (Future Versions)
- Offline draft save for long forms?
- In-widget export (PDF) for user copy?
- Multi-language ASR/TTS switching mid-session?

---

**End of v0.1**

