# Functional Requirements Document (FRD)

## 0. Document Control
- **Product:** Embeddable Insurance Interview Chat Widget (Angular 18 + Angular Material)
- **Version:** v0.1
- **Status:** Draft for review
- **Owner:** Product/BA
- **Related docs:** Full Spec v0.1, UX Design v0.1
- **Key decision:** **Voice processing is provider-side only** (client streams audio to orchestrator; orchestrator calls OpenAI Voice server-to-server). **No human handoff API.**

---

## 1. Purpose
Define the functional requirements to implement a WCAG 2.1 AA compliant, embeddable chat widget that conducts insurance application interviews using text and optional voice, integrated with a provider-side orchestrator, a business rules engine, and OpenAI Voice (server-side only).

---

## 2. Scope
- **In scope (Widget):** UI, input handling (text/voice), transcript view, progress indication, accessibility behaviors, analytics events, client-side validation, tenant theming, initialization and embedding, REST/WS communication with orchestrator.
- **In scope (Orchestrator):** Session lifecycle, question delivery, server-side validation, server-to-server ASR/TTS, transcript persistence, analytics/observability endpoints.
- **Out of scope:** Human agent handoff; in-widget transcript export; payment flows; policy underwriting decisions.

---

## 3. Actors & Roles
- **Applicant (Anonymous end-user)**: answers interview questions via text or voice.
- **Host Integrator (Client developer)**: embeds and configures the widget on a host site.
- **Provider Operator**: monitors sessions, retrieves transcripts, manages tenant configs.

---

## 4. High-Level Use Cases
1. **Start Interview** (anonymous): user opens widget, accepts consent, receives first question.
2. **Answer Question (Text)**: user types response; client validates; submit to orchestrator; next question displayed.
3. **Answer Question (Voice)**: user press/tap mic to speak; partial ASR shown; final transcript editable; submit.
4. **Navigate/Revise**: user views previous question (if rules allow) and edits answer.
5. **View Transcript**: user views chronological transcript with sensitive fields masked.
6. **Pause/Resume**: user can close/minimize widget and resume in same session while on the page.
7. **Complete/End**: interview reaches terminal state; widget shows completion summary.
8. **Error Handling**: network loss, mic permissions denied, rules engine timeout; recoveries offered.

---

## 5. Functional Requirements

### 5.1 Embedding & Initialization
FR-001 The widget SHALL be embeddable via a single script tag that exposes `InsuranceChatWidget.init(config)`.
FR-002 The widget SHALL also be available as a custom element `<insurance-chat-widget>` with equivalent attributes.
FR-003 The widget SHALL accept a configuration object including: `jwt`, `tenantId`, `applicationId`, `environment`, `locale`, `theme`, `features`, and `analytics` callback.
FR-004 The widget SHALL validate required config at startup and present a non-blocking error UI when optional config is invalid.
FR-005 The widget SHALL allow CORS-restricted communication only with orchestrator endpoints configured per tenant.

### 5.2 Consent & Privacy
FR-010 On first load per session, the widget SHALL present a consent dialog describing microphone and transcript storage.
FR-011 If consent is declined, the widget SHALL disable voice functions and proceed with text-only mode.
FR-012 The widget SHALL send consent decision and timestamp with `startSession` request.

### 5.3 Session Lifecycle
FR-020 The widget SHALL create a session via `POST /v1/sessions` using the provided JWT.
FR-021 The widget SHALL handle session statuses: `active`, `completed`, `canceled`.
FR-022 The widget SHALL display a completion state when `isTerminal=true` is returned in the question envelope.
FR-023 The widget SHALL expose an API `end()` to programmatically end/cancel the session.

### 5.4 Question Rendering & Answer Types
FR-030 The widget SHALL render question types: `text`, `number`, `date`, `selectOne`, `selectMany`, `address`, `consent`, `file`, `signature`.
FR-031 The widget SHALL render `helpText` and associate it with inputs via `aria-describedby`.
FR-032 The widget SHALL enforce client-side constraints: required, min/max, pattern, and masks.
FR-033 For `select` types, the widget SHALL render accessible list controls with keyboard support.
FR-034 For `file` type, the widget SHALL accept tenant-configured MIME types and size limits, and upload via orchestrator.
FR-035 For `signature` type, the widget SHALL provide a keyboard-accessible alternative (typed affirmation) if drawing is not possible.

### 5.5 Answer Submission & Validation
FR-040 On submit, the widget SHALL send `AnswerEnvelope` with `questionId`, `answer`, `inputMode`, and `timestamp`.
FR-041 On `422 ValidationError`, the widget SHALL keep focus in the field and render inline error text provided by the server.
FR-042 The widget SHOULD pre-validate formats (e.g., date `DD/MM/YYYY`) and show localized hints.
FR-043 The widget SHALL include an `Idempotency-Key` header for POSTs to prevent duplicate submissions.

### 5.6 Voice Input (Provider-side Processing)
FR-050 The widget SHALL capture microphone audio via Web Audio / MediaStream and stream **only** to the orchestrator over `wss://.../ws/asr`.
FR-051 The widget SHALL NOT make any direct connections to OpenAI or other third-party voice services.
FR-052 The widget SHALL render a VU meter during capture and partial ASR text within 500ms of speech start (when available from orchestrator).
FR-053 The widget SHALL stop capture after user release or silence timeout (default 5s, tenant-configurable).
FR-054 The widget SHALL place the final transcript into the input for user review before submission.
FR-055 The widget SHALL support barge-in: starting capture or typing MUST stop TTS playback immediately (≤200ms).
FR-056 When microphone is denied or unavailable, the widget SHALL display guidance and keep text mode enabled.

### 5.7 Voice Output (TTS)
FR-060 When a question includes `ttsHint` or prompt text, the widget SHALL request audio via `wss://.../ws/tts` to orchestrator and play streamed audio.
FR-061 The widget SHALL provide user controls to pause/stop TTS and a visible indicator that speech is playing.
FR-062 The widget SHALL respect system `prefers-reduced-motion` and minimize animations during TTS.

### 5.8 Transcript View
FR-070 The widget SHALL provide a Transcript tab listing items with role, timestamp, and content.
FR-071 For fields flagged `constraints.sensitive=true`, the widget SHALL mask values in the transcript UI.
FR-072 Transcript copy actions SHALL copy masked values only.
FR-073 The widget SHALL support filters (All/User/Assistant) and search by text.

### 5.9 Navigation & Progress
FR-080 The widget SHALL show a progress indicator (percent) when provided by orchestrator.
FR-081 The widget SHALL support back navigation **only when allowed by the rules engine**; otherwise the back action is disabled with tooltip.

### 5.10 Error Handling & Resilience
FR-090 On network loss, the widget SHALL display an offline state and retry with exponential backoff.
FR-091 On orchestrator timeout for next question, the widget SHALL show skeleton loaders and an option to retry.
FR-092 On voice service outage (as reported by orchestrator), the widget SHALL disable mic and show a tooltip “Voice unavailable; type to continue.”

### 5.11 Accessibility (WCAG 2.1 AA)
FR-100 The widget SHALL be fully operable with keyboard; focus order is logical; visible focus indicators meet contrast requirements.
FR-101 Assistant messages SHALL be announced via `aria-live="polite"`; critical errors via `aria-live="assertive"`.
FR-102 All icons and non-text controls SHALL have accessible names; mic toggle SHALL expose `aria-pressed`.
FR-103 The widget SHALL support `prefers-reduced-motion` and provide alternatives for animated elements (VU meter numeric).
FR-104 The widget SHALL maintain minimum contrast ratios (4.5:1 for body text; 3:1 for large text and UI components) across tenant themes.

### 5.12 Internationalization
FR-110 The widget SHALL localize all UI labels for `locale` from config; default `en-GB`.
FR-111 The widget SHALL format dates, numbers, and addresses per locale.

### 5.13 Theming & Tenant Configuration
FR-120 The widget SHALL accept theme tokens (colors, density) and apply them at runtime without rebuild.
FR-121 The widget SHALL support light/dark modes and comply with contrast checks post-theme.

### 5.14 Analytics
FR-130 The widget SHALL emit structured analytics events to a host-provided callback with `sessionId`, `questionId`, `inputMode`, timestamps, and latency.
FR-131 The widget SHALL NOT send analytics to third parties unless configured by the host.

### 5.15 Security & Privacy (Client)
FR-140 The widget SHALL accept short-lived JWTs and include them in all calls to the orchestrator.
FR-141 The widget SHALL restrict external egress; only orchestrator endpoints are contacted.
FR-142 The widget SHALL avoid storing PII in localStorage; session state should be in-memory; use sessionStorage only if explicitly enabled by tenant policy.

---

## 6. Orchestrator Functional Requirements (Interface Expectations)
OR-001 SHALL expose REST endpoints: `POST /v1/sessions`, `GET /v1/sessions/{id}`, `DELETE /v1/sessions/{id}`, `GET /v1/sessions/{id}/next-question`, `POST /v1/sessions/{id}/answers`, `GET /v1/sessions/{id}/transcript`.
OR-002 SHALL expose WebSocket endpoints: `/ws/asr` and `/ws/tts` for streaming audio and partials to/from the widget.
OR-003 SHALL perform all server-to-server calls to OpenAI Voice; the widget must never require third-party keys.
OR-004 SHALL validate answers with the rules engine and return `QuestionEnvelope` with `isTerminal` when complete.
OR-005 SHALL tag sensitive fields in questions (via `constraints.sensitive`) to drive client masking.
OR-006 SHALL persist transcripts (Q&A, timestamps, partials, corrections) for 7 years; provide GDPR delete APIs (server-side).
OR-007 SHOULD return progressive progress metrics (0..1) for display.
OR-008 SHALL enforce CORS allowlists per tenant and verify JWT audience/scope.

---

## 7. Data Requirements (Client-visible)
- **Question**: `id`, `type`, `prompt`, `helpText`, `options[]`, `constraints{ required,min,max,pattern,mask,sensitive }`.
- **QuestionEnvelope**: `sessionId`, `question`, `ttsHint?`, `isTerminal`.
- **AnswerEnvelope**: `questionId`, `answer`, `inputMode`, `timestamp`, `meta{ asrConfidence?, rawAudioRef? }`.
- **TranscriptItem**: `role`, `text`, `redacted`, `timestamp`.

---

## 8. UI Requirements (Mapping to UX v0.1)
UI-001 Header: title, subtitle, minimize/close; keyboard accessible.
UI-002 Tabs: Chat (default) and Transcript; tabs reachable via keyboard; panel has `role="dialog"` with label.
UI-003 Message list: virtualized; newest messages scrolled into view; SR announcements for assistant only.
UI-004 Input bar: validates per constraints; shows hints/errors; supports `Enter` to submit.
UI-005 Mic control: states (idle/listening/processing/error); VU meter with reduced-motion fallback; tooltips per state.
UI-006 Progress: linear bar + percent chip; optional.
UI-007 Transcript: filters, timestamps, masking badges, copy action respects masking.
UI-008 Error states: snackbars/banners with actionable guidance.

---

## 9. Non-Functional (Informational, complements FRs)
NFR-001 Performance: P95 < 300ms TTFB for next question (text path); P95 < 1.2s TTS start.
NFR-002 Reliability: WS reconnect/backoff; REST retries with idempotency.
NFR-003 Compatibility: Latest two versions of Chrome/Edge/Firefox/Safari, incl. mobile.
NFR-004 Accessibility QA: axe-core zero serious/critical issues; manual SR tests: NVDA/JAWS/VoiceOver.

---

## 10. Telemetry & Observability (Client Expectations)
TEL-001 Widget SHALL emit events: `view.chat_opened`, `question.viewed`, `answer.submitted`, `asr.partial`, `asr.final`, `tts.start`, `tts.end`, `error.displayed`.
TEL-002 Each event SHALL include correlation IDs provided by orchestrator.

---

## 11. Error Catalog (Widget-visible Codes)
- `mic_denied`: microphone permission blocked.
- `asr_unavailable`: voice service temporarily unavailable (from orchestrator).
- `rules_timeout`: rules engine timeout; show retry.
- `network_offline`: browser offline.
- `validation_error`: 422 with field errors.

---

## 12. Tenant Configuration (Examples)
TEN-001 Features: `voice` (on/off), `showProgress` (on/off), `allowBackNav` (rules-driven default false).
TEN-002 Voice: silence timeout seconds, barge-in enabled, default TTS voice key (server-side).
TEN-003 Theming: primary/secondary colors, density, dark mode.
TEN-004 Localization: default locale, allowed locales.

---

## 13. Acceptance Criteria Summary (Traceable)
- **AC-Start-01:** Consent shown on first load; declining disables voice (FR-010..012, FR-050..056).
- **AC-Ask-01:** Next question appears ≤300ms P95 after valid submit (FR-040..043, NFR-001).
- **AC-Voice-01:** Partial ASR displayed within 500ms from speech start (FR-050..055).
- **AC-Bar-01:** Barge-in stops TTS ≤200ms (FR-055, FR-061).
- **AC-A11y-01:** Keyboard-only completion possible; SR announces assistant messages (FR-100..104).
- **AC-Trans-01:** Sensitive values masked in Transcript; copy respects masking (FR-070..073).

---

## 14. Open Questions
1. Maximum audio duration per utterance and per session (server limits)?
2. Required locales for GA launch beyond `en-GB`?
3. File and signature storage constraints (encryption at rest, virus scanning) — client indicators needed?
4. Progress semantics: percent or step count provided by rules engine?
5. Back navigation rules granularity (field-level vs section-level)?

---

## 15. Appendix: Event Payload Examples
```json
{
  "event": "answer.submitted",
  "sessionId": "sess_123",
  "questionId": "q_dob",
  "inputMode": "text",
  "latency_ms": 184,
  "timestamp": "2025-11-01T12:00:00Z"
}
```

```json
{
  "event": "asr.partial",
  "sessionId": "sess_123",
  "utteranceId": "utt_456",
  "text": "date of b…",
  "confidence": 0.72,
  "timestamp": "2025-11-01T12:00:04Z"
}
```

---

**End of FRD v0.1**

