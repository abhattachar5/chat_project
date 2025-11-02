# UX Design v0.2 – Day 2: Medical Report Intake & Prefill

> Add an optional medical report upload + review step prior to interview; adapt the first medical-history prompt using confirmed conditions.

---

## 1) Flow Placement
We introduce a **pre-interview path, after consent**:

1. **Consent** → 2. **Medical Report Upload (optional)** → 3. **Review Detected Conditions** → 4. **Start Interview (Chat/Voice)**

Rationale: Consent covers data use for voice **and** document processing; then we request PHI. Users keep control and can skip.

---

## 2) Screens (Annotated Wireframes)

### 2.1 Medical Report Upload (Desktop)
```
┌────────────────────────────────────────────┐
│ Title: Add medical documents (optional)    │
│ Body: Upload GP letters, lab results…      │
│ Info: We'll scan for conditions to speed   │
│ up your application. You can review and    │
│ edit anything before it's used.            │
│                                            │
│ [ Drop files here or  Choose files ]       │
│ Allowed: PDF, JPG, PNG, DOCX  •  Max 20MB  │
│                                            │
│ Files                                     ⓘ│
│ ┌────────────────────────────────────────┐ │
│ │ asthma_report.pdf   [Scanning…]  35%  │ │
│ │ nhs_letter.jpg      [Uploaded]         │ │
│ └────────────────────────────────────────┘ │
│                                           │
│ [ Skip for now ]                 [Continue]│
└────────────────────────────────────────────┘
```
- **Components**: `MatCard`, `MatButton`, `MatIcon`, `MatProgressBar`, drag‑and‑drop area using CDK.
- **A11y**: Button alternative to drag‑drop; file list uses `role="list"` with `aria-live="polite"` for status.

### 2.2 Review Detected Conditions
```
┌────────────────────────────────────────────┐
│ Title: Review detected conditions          │
│ Subtitle: Based on your documents          │
│                                            │
│ [✓] Asthma (canonical)     Confidence 0.86 │
│   Evidence: “…patient has a history…”  [View]
│ [✕] Hypertension?          Confidence 0.58 │
│   Evidence hidden (low confidence)  [Show] │
│                                            │
│ + Add another condition [ Search… ]        │
│                                            │
│ [Back]                           [Confirm] │
└────────────────────────────────────────────┘
```
- **Components**: `MatList`, `MatChips`, `MatButtonToggle`, `MatExpansionPanel` for evidence.
- **A11y**: Each item has a checkbox-like control with SR text (Accept/Reject). Evidence open uses `aria-controls`.

### 2.3 First Medical Prompt (Adaptive)
```
[assistant]
We noted **Asthma** from your documents. Please confirm this and add any other conditions you'd like to declare.

[User input area]
```
- If none detected: use standard wording.

---

## 3) Interaction Rules
- Upload step is **skippable**; `Skip for now` persists `intakeSkipped=true` in session.
- File tile states: `queued` → `uploading` → `scanning` → `extracted` → `failed`.
- Evidence peek is masked by default; opening shows masking notice.
- Low-confidence candidates collapse inside "Possible findings".

---

## 4) Accessibility (Additions)
- Drop zone provides keyboard focus and `Enter` to open file picker.
- Status updates announced via `aria-live="polite"` (e.g., "File uploaded, scanning started")
- Evidence snippets marked as sensitive; SR reads a warning before content.

---

## 5) Component Mapping (Angular Material)
- Upload card: `MatCard` + custom `FileDropDirective` (CDK)
- File list item: `MatListItem` + `MatProgressBar` + `MatIconButton` (remove)
- Review screen: `MatList`, `MatCheckbox` (accept), `MatChips` (status), `MatExpansionPanel` (evidence)
- Typeahead add: `MatAutocomplete` backed by `/v1/dictionary/search`
- Adaptive prompt appears as the first chat message; no extra controls required.

---

## 6) Copy (Draft)
- Upload title: “Add medical documents (optional)”
- Upload help: “We’ll scan for conditions to speed up your application. You’ll review any findings before we use them.”
- Review title: “Review detected conditions”
- Confirm button: “Use these”
- Evidence warning: “This may include personal details. We mask identifiers by default.”
- Low confidence group label: “Possible findings (need your review)”

---

## 7) Error & Empty States
- **Unsupported type**: “That file type isn’t supported. Please use PDF, JPG, PNG, or DOCX.”
- **Too large**: “This file exceeds 20MB. Try a smaller file.”
- **Unreadable**: “We couldn’t read this document. You can continue without it.”
- **No findings**: “We didn’t detect any conditions. You can add one now or continue.”

---

## 8) Telemetry
- `intake.upload_started/finished/failed`
- `intake.extract_started/finished`
- `intake.candidates_presented`
- `intake.confirmed/rejected`
- `intake.manual_add`

---

**End UX v0.2**

