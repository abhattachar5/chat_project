# Chat Widget UX Design v0.1 (Angular Material)

> Embeddable insurance interview chat with optional voice. Built with Angular 18 + Angular Material. WCAG 2.1 AA compliant. This document contains annotated wireframes, interaction specs, accessibility notes, and Material component mapping for handoff.

---

## 1) Design Principles
- **Clarity first:** simple, step-by-step prompts; no clutter.
- **Assistive by default:** live transcript, inline hints, example answers.
- **Respectful voice:** neutral, friendly tone; plain English; avoids jargon.
- **Accessible always:** full keyboard flow, SR announcements, sufficient contrast, reduced motion support.
- **Embeddable + brandable:** theme via Material tokens and CSS vars; compact footprint.

---

## 2) Layout Overview

### 2.1 States
- **Minimized:** Floating button (FAB) with brand color → opens panel.
- **Expanded:** Docked panel (right by default), 400–480px width on desktop; full-screen modal on small screens.
- **Tabs:** *Chat* (default), *Transcript*.

### 2.2 Desktop Wireframe (Expanded)
```
┌────────────────────────────────────────────┐
│ Header:  InsureChat ▾        [⟳] [−] [×]  │
│ Subtitle: Application interview            │
├────────────────────────────────────────────┤
│ Chat / Transcript (Tabs)                   │
│ ┌────────────────────────────────────────┐ │
│ │  [assistant] Please state your full   │ │
│ │  name as it appears on official ID.   │ │
│ │                                        │ │
│ │  [user] Johnathan A. Smith            │ │
│ │                                        │ │
│ │  [assistant] Thanks. What is your     │ │
│ │  date of birth? (DD/MM/YYYY)          │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Hint row: Example: 12/06/1980              │
│                                            │
│ Input bar: [  dd/mm/yyyy            ] [Send]│
│ Voice:  [ Mic ◉ ]  VU meter ▒▒▒            │
│ Footer chips: ■ Progress 12%   ⓘ Privacy   │
└────────────────────────────────────────────┘
```

### 2.3 Mobile Wireframe (Full-screen)
```
┌──────────────────────────────────┐
│ ←  InsureChat           ⋮        │
├──────────────────────────────────┤
│ Chat | Transcript                 │
│ ───────────────────────────────   │
│ [assistant] Please state your…    │
│ [user] Johnathan A. Smith         │
│ [assistant] What is your DOB?     │
│                                   │
│ Hint: Example 12/06/1980          │
│                                   │
│ [ Mic ◉ ]  [  dd/mm/yyyy   ] [→]  │
│ Progress 12%   Privacy             │
└──────────────────────────────────┘
```

---

## 3) Component Inventory & Mapping (Angular Material)
- **Header Bar**: `MatToolbar`, `MatIconButton` (refresh, minimize, close). Title + subtitle.
- **Tabs**: `MatTabsModule` → labels: Chat, Transcript.
- **Message List**: `CdkVirtualScrollViewport` + `MatCard` bubbles; roles styled (assistant/user/system).
- **Input Bar**: `MatFormField` + `MatInput` + `MatSuffix` send button; supports validators and masks.
- **Mic Button**: `MatFabButton` or `MatButton` with toggle; displays `VU Meter` canvas.
- **Hint Row**: `MatHint` (within input) or subtle `MatDivider`+`MatIcon` info line.
- **Progress**: `MatProgressBar` (buffer/linear) + chip with percent.
- **Snackbars**: `MatSnackBar` for transient errors.
- **Dialogs**: `MatDialog` for consent/privacy and confirmations.
- **Tooltips**: `MatTooltip` on sensitive-mask and controls.
- **Transcript Filters**: `MatButtonToggleGroup` (All / User / Assistant), date range (`MatDateRangePicker`).

---

## 4) Chat Screen — Interaction Specs

### 4.1 Message Bubbles
- **Assistant bubble**: left-aligned, neutral background.
- **User bubble**: right-aligned, brand primary outlined.
- **System notices**: full-width banner (e.g., consent, errors).
- **ARIA**: container `aria-live="polite"` for new assistant messages; user messages not announced.

### 4.2 Input Modes
- **Text**: Masked input when `constraints.mask` present (e.g., DOB `##/##/####`).
- **Voice (push-to-talk)**: Press and hold or tap to start; waveform meter shows level; partial ASR text appears as ghost text; release → finalizes.
- **Barge-in**: Starting to type or pressing mic stops TTS immediately.

### 4.3 Validation
- Client-side hints (`MatError` below field). On server validation error, show inline message and keep focus in field. Example: “Please enter a valid date (DD/MM/YYYY).”

### 4.4 Hints & Examples
- Contextual hint row appears when `helpText` present. For SR, associate via `aria-describedby`.

### 4.5 Keyboard Flow
- `Alt+V` focuses mic button.
- `Enter` submits when input valid; `Shift+Enter` inserts newline (for multi-line answers).
- `Esc` cancels recording or stops TTS.

---

## 5) Voice UI Details
- **Mic control states**: `idle` → `listening` → `processing` → `ready`.
- **Icons**: idle (mic), listening (mic with pulse), processing (spinner), error (mic-off).
- **VU Meter**: animated bars; provide numeric dB alternative when `prefers-reduced-motion`.
- **Partial captions**: grey italic inline above input; final text moves into input before submit.
- **Timeout**: auto-stop after N seconds of silence (tenant-configurable, default 5s).
- **Permission denied**: show inline banner with steps; keep text mode available.

---

## 6) Transcript Tab
- **List**: reverse-chronological or chronological (tenant choice; default chronological).
- **Filters**: All / User / Assistant; search box; date range.
- **Items**: avatar + role + timestamp + content.
- **Sensitive data**: masked with `••••`; tooltip “Sensitive information hidden”.
- **Copy**: button to copy a single item; copying respects masking.

Wireframe:
```
┌ Transcript ───────────────────────────────┐
│ Filters: [All v] [Search ⌕] [Date ▾]      │
│ 12 Jun 2025 09:12                         │
│ Assistant: "Please state your full name." │
│ User: "John•••••• Smith"                  │
│ Assistant: "What is your date of birth?"  │
└───────────────────────────────────────────┘
```

---

## 7) Error & Edge States
- **Mic blocked**: banner in chat area with CTA → “Use text instead” and help link.
- **Network offline**: inline toast + retry logic; allow drafting answers.
- **Rules engine timeout**: skeleton loaders in message list; “Still working…” fallback copy.
- **Voice unavailable**: disable mic with tooltip.

---

## 8) Accessibility Annotations (WCAG 2.1 AA)
- **Landmarks**: `role="dialog"` for expanded widget; label with title.
- **Focus order**: Header → tabs → messages → input → mic → progress → footer.
- **Visible focus**: Material focus ring with ≥ 3:1 contrast vs adjacent.
- **ARIA live**: `polite` for assistant messages, `assertive` for critical errors.
- **Labels**: mic button `aria-pressed` indicates listening; `aria-describedby` ties hints/errors to input.
- **Keyboard alternatives**: all mic actions are keyboard accessible; no single-key traps.
- **Reduce motion**: disable VU animation and toast slide; show numeric level and static indicators.
- **Contrast**: ensure 4.5:1 body text, 3:1 for large text and UI components; test tenant themes.

---

## 9) Responsive Rules
- **≤ 360px**: single-line header; icons only; input collapses to stacked (Mic above field).
- **361–767px**: full-screen modal; tabs become segmented control.
- **≥ 768px**: docked right panel; 400–480px width; message max-width 88%.

---

## 10) Theming & Tokens (Material)
- Expose custom properties to map host brand:
```css
:root {
  --ins-primary: #0D47A1;
  --ins-on-primary: #FFFFFF;
  --ins-surface: #FAFAFA;
  --ins-error: #B00020;
}
```
- Map to Material Design tokens via theme service; support light/dark and density (comfortable/compact).

---

## 11) Microcopy (Draft)
- **Consent modal title**: “Voice & transcript recording”
- **Consent body**: “With your permission, we’ll use your microphone and store a transcript of this interview for compliance. You can continue by typing at any time.”
- **Mic tooltip (idle)**: “Hold to speak, release to finish.”
- **Mic tooltip (denied)**: “Microphone blocked. Type your answer or enable access in browser settings.”
- **Barge-in hint**: “Start speaking or typing to interrupt playback.”

---

## 12) Event Hooks (for Analytics)
- `view.chat_opened`
- `action.mic_start` / `action.mic_stop`
- `asr.partial` / `asr.final`
- `tts.start` / `tts.end`
- `question.viewed` / `answer.submitted`
- `error.displayed`

Payload includes `sessionId`, `questionId`, `inputMode`, `latency_ms`.

---

## 13) Dev Handoff Checklist
- [ ] Component tree & routes finalized
- [ ] Token names confirmed with theming
- [ ] Copy approved (legal team)
- [ ] Accessibility acceptance criteria agreed
- [ ] Empty/error/loading states designed
- [ ] Success metrics + analytics schema frozen

---

## 14) Open Items
- Toggle for *compact* density globally?
- Optional avatar mode vs minimal chips?
- Progress as steps vs percent — rules engine to provide step count?

---

**End v0.1**

