# Functional Requirements Document (FRD) – Day 2 Addendum: Medical Report Intake & Prefill (v0.2)

## 0. Document Control
- **Product:** Insurance Interview Chat Widget
- **Version:** v0.2 (Day 2 Addendum)
- **Status:** Draft
- **Depends on:** FRD v0.1, UX v0.1, Full Spec v0.1
- **Key decisions carried:** Provider-side voice only; no human handoff.

---

## 1. Overview
Introduce a pre-interview **Medical Report Intake** feature. Applicants may upload a medical document (e.g., lab test, GP letter, hospital discharge). The orchestrator performs **AI extraction** → **hybrid/semantic matching** against a provider **Impairment Dictionary** → proposes **pre-filled medical conditions**. The interview then adapts its wording and questions to confirm and/or extend these disclosures.

---

## 2. Assumptions (until confirmed)
- **Formats:** PDF, JPG, PNG, DOCX. Max 20MB per file; up to 5 files per session. OCR for images; no handwriting guarantee but attempted.
- **Languages:** English primary; pipeline ready for en-GB OCR. Non-English rejected with clear message (Phase 1).
- **Extraction:** Provider-side service using LLM/OCR ensemble; outputs conditions (SNOMED/ICD mapping optional), onset date, severity, status (active/resolved), medications.
- **Dictionary:** Provider-managed list of impairments/conditions with canonical codes, synonyms, and underwriting flags.
- **Confidence:** ≥0.75 auto-suggest; <0.75 requires explicit user review. All pre-fills require **user confirmation** before commit.
- **Compliance:** UK GDPR/PHI-grade handling; AV scan; encrypt at rest; UK/EU data residency.
- **Retention:** Uploaded docs retained 7 years with transcript, unless tenant sets shorter retention.

---

## 3. New/Updated Use Cases
UC-01 **Upload Medical Report**: Before starting chat, applicant uploads 0–5 files. System scans, extracts entities, and proposes conditions.
UC-02 **Review & Confirm Detected Conditions**: Applicant reviews candidate conditions, accepts/rejects/edits, or adds new.
UC-03 **Adaptive Interview**: Chat acknowledges confirmed conditions (e.g., “We noted asthma.”) and asks to confirm and add others.
UC-04 **Override & Privacy**: Applicant can delete an uploaded file before submitting interview. Applicant can opt out and proceed without upload.
UC-05 **Error Handling**: Unsupported type, oversized file, unreadable scan, or extraction failure → fallback messaging; continue without prefill.

---

## 4. Functional Requirements

### 4.1 Upload & Intake (Client)
FRD2-001 The widget SHALL offer an optional **Medical Report Upload** step **before the consent dialog or immediately after consent** (see UX v0.2), default **after consent**.
FRD2-002 The widget SHALL accept files of types PDF/JPG/PNG/DOCX and display per-file size and total size limits.
FRD2-003 The widget SHALL show an inline checklist: type OK, size OK, virus scan pending, upload complete.
FRD2-004 The widget SHALL stream files to `POST /v1/intake/files` (orchestrator) with status updates and resumable upload where supported.
FRD2-005 The widget SHALL never parse documents locally beyond preview thumbnails; **no PHI processing in browser**.
FRD2-006 The widget SHALL allow skipping the upload. Skipping proceeds to standard interview.

### 4.2 Server-side Extraction & Matching
FRD2-010 The orchestrator SHALL perform AV scan and OCR/LLM extraction of medical entities: conditions/impairments, medications, dates, severity, status.
FRD2-011 The orchestrator SHALL run **hybrid/semantic search** (BM25 + dense vector) over the Impairment Dictionary to map each extracted candidate to the most likely canonical impairment with a confidence score.
FRD2-012 The orchestrator SHALL return a **Detected Conditions Summary** with: `originalTerm`, `canonicalCode`, `canonicalLabel`, `confidence`, `evidence` (text span + doc ref), `status`, `severity?`, `onsetDate?`.
FRD2-013 The orchestrator SHALL not commit pre-fills until confirmed by the applicant (client-side confirmation event).

### 4.3 Review & Confirmation (Client)
FRD2-020 The widget SHALL present a **Review Detected Conditions** screen listing candidates with accept/reject and edit functions.
FRD2-021 On accept, the widget SHALL mark the impairment as **confirmed** and send a `POST /v1/intake/confirmations` payload.
FRD2-022 On reject, the widget SHALL record the rejection (for model feedback) and proceed.
FRD2-023 The widget SHALL allow adding a condition manually by searching the dictionary via `/v1/dictionary/search?q=` (typeahead with debounced calls).
FRD2-024 The widget SHALL show an **evidence peek** (short snippet) with a PHI warning and link to open doc preview when allowed.

### 4.4 Prefill & Conversational Adaptation
FRD2-030 When the interview begins, the first medical history question SHALL be phrased to **acknowledge confirmed conditions** (e.g., “We’ve noted asthma and hypertension from your documents—please confirm and add any others.”).
FRD2-031 The widget SHALL submit prefill answers using `AnswerEnvelope` with `source: "prefill"` and `evidenceRefs`.
FRD2-032 The orchestrator SHALL pass prefill answers to the rules engine and receive the next appropriate question (skip logic allowed).
FRD2-033 The applicant SHALL be able to edit or remove prefilled conditions during the interview.

### 4.5 Privacy & Security
FRD2-040 All uploads SHALL be transmitted via TLS 1.2+; stored encrypted-at-rest with PHI-specific KMS keys.
FRD2-041 Storage SHALL be region-bound (UK/EU) and access-controlled (least privilege, dual-approval for bulk export).
FRD2-042 The widget SHALL present PHI-specific consent copy; an explicit statement that documents are used for underwriting and retained per policy.
FRD2-043 The system SHALL log immutable audit entries for upload, extraction, mapping, and user confirmations.
FRD2-044 Redaction: When previewing or showing evidence snippets, the widget SHALL mask identifiers (NHS number, address) unless user expands with a warning.

### 4.6 Errors & Fallbacks
FRD2-050 On AV fail or unsupported file, return code and guidance; allow re-upload.
FRD2-051 On extraction failure, show neutral message and allow proceeding without prefill.
FRD2-052 On low-confidence (<0.5) candidates, hide by default behind a “Possible findings” expandable section.

### 4.7 Telemetry & Quality
FRD2-060 Emit metrics: upload success rate, time-to-extract, #conditions detected per doc, acceptance rate, average confidence, overrides, false-positive reports.
FRD2-061 Provide a feedback endpoint `POST /v1/intake/feedback` to flag incorrect mappings.

---

## 5. API Additions (Client-visible)
- `POST /v1/intake/files` → { fileId }
- `GET /v1/intake/summary?sessionId=` → { candidates[] }
- `POST /v1/intake/confirmations` → { confirmed[], rejected[] }
- `GET /v1/dictionary/search?q=` → [{ code, label, synonyms[] }]

Payload details in Technical Design v0.2.

---

## 6. Acceptance Criteria (Day 2)
AC-D2-01 Upload accepts PDF/JPG/PNG/DOCX; rejects others with clear error.
AC-D2-02 For a sample asthma PDF, system detects *asthma*, matches to canonical impairment, confidence ≥0.75, and presents for confirmation.
AC-D2-03 After acceptance, first medical history prompt acknowledges asthma and asks to confirm or add more.
AC-D2-04 User can remove the prefilled asthma later; transcript shows change history.
AC-D2-05 Evidence peek masks personal identifiers by default.

---

## 7. Open Questions
1. Handwriting OCR must-have? If yes, what fallback/error copy?
2. Dictionary taxonomy: SNOMED CT, ICD-10, or proprietary? Need crosswalks?
3. Maximum #files and retention length for raw uploads vs derived entities?
4. Do we allow clinician notes extraction beyond conditions (e.g., smoker status, BMI)?
5. Confidence thresholds per tenant or global defaults?

---

**End v0.2 FRD Addendum**

