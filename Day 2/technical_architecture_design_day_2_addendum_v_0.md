# Technical Architecture & Design – Day 2 Addendum (v0.2)

## 0) Summary
Extend the provider-side architecture with a **Document Intake & Extraction pipeline** and an **Impairment Matching** service. The widget adds an optional pre-interview upload & review step. Prefilled conditions flow into the rules-driven interview.

---

## 1) Components (New/Updated)
- **Widget (Angular 18)**
  - New: Upload module (drag‑drop, resumable uploads, status UI), Review Detected Conditions screen, dictionary typeahead.
  - Security: No on-device PHI parsing beyond thumbnails; all analysis is server-side.

- **Orchestrator (API Gateway/BFF)**
  - New endpoints: `/v1/intake/files`, `/v1/intake/summary`, `/v1/intake/confirmations`, `/v1/dictionary/search`.
  - Responsibilities: AV scan, send files to Extraction, collate candidates, manage user confirmations, emit audit logs.

- **Extraction Service (AI)**
  - Pipeline: AV → OCR (e.g., Tesseract/PaddleOCR/Cloud OCR) → Layout parsing → LLM IE (medical NER) → Normalization.
  - Output: entities with spans, confidence, attributes (status, severity, onset), document refs.
  - Privacy: Runs in provider VPC; no third-party file storage; optional model hosting on provider infra.

- **Impairment Dictionary Service**
  - Data: canonical impairments with codes (e.g., SNOMED/ICD + provider code), synonyms, embeddings.
  - APIs: `search`, `resolve(code)`, `suggest(synonym)`.
  - Index: Hybrid retrieval (BM25 + vector); embeddings updated nightly.

- **Matching Service**
  - Inputs: extracted entity text, context sentences; outputs canonical match + confidence; stores feature vectors for QA.

- **Prefill Engine**
  - Converts confirmed conditions into `AnswerEnvelope` payloads aligned with rules questions; applies skip logic hints.

- **Transcript/PHI Store**
  - Stores uploaded files (encrypted), extraction JSON, candidate list, user confirmation actions, and final prefill answers.

---

## 2) Sequence Diagrams

### 2.1 Intake & Extraction
```
Widget → Orchestrator: POST /intake/files (doc)
Orchestrator → AV Scanner: scan(doc)
Orchestrator → Extraction: start(docRef)
Extraction → OCR/LLM: extract entities
Extraction → Orchestrator: candidates(entity[]) + evidence
Orchestrator → Widget: GET /intake/summary → candidates
```

### 2.2 Review & Prefill
```
Widget → Orchestrator: POST /intake/confirmations (accept/reject)
Orchestrator → Prefill Engine: build answers
Prefill Engine → Rules Engine: submit prefilled answers (optional) or queue for first question
Widget ← Orchestrator: First prompt (acknowledging confirmed conditions)
```

---

## 3) Data Contracts (Additions)

### 3.1 `POST /v1/intake/files`
Request (multipart): `file`, `sessionId`
Response:
```json
{ "fileId": "file_123", "status": "uploaded" }
```

### 3.2 `GET /v1/intake/summary?sessionId=...`
```json
{
  "candidates": [
    {
      "id": "cand_1",
      "originalTerm": "asthma",
      "canonical": { "code": "IMP-001", "label": "Asthma" },
      "confidence": 0.86,
      "status": "active",
      "severity": "mild",
      "onsetDate": "2018-03-01",
      "evidence": { "docId": "file_123", "page": 2, "snippet": "history of asthma…" }
    }
  ]
}
```

### 3.3 `POST /v1/intake/confirmations`
```json
{
  "sessionId": "sess_123",
  "confirmed": ["cand_1"],
  "rejected": ["cand_2"],
  "manualAdd": [{ "code": "IMP-099", "label": "Type 2 Diabetes" }]
}
```
Response:
```json
{ "prefill": [{ "questionId": "q_known_conditions", "answer": ["IMP-001"], "source": "prefill", "evidenceRefs": ["file_123:2"] }] }
```

### 3.4 `GET /v1/dictionary/search?q=asth…`
```json
[ { "code": "IMP-001", "label": "Asthma", "synonyms": ["bronchial asthma"] } ]
```

---

## 4) Matching Logic
- Preprocess: lowercase, spell-correct common variants (e.g., "asthama"→"asthma").
- Retrieve: BM25 top‑k (k=25) + vector ANN top‑k (k=50); merge via RRF.
- Score: weighted sum of lexical + semantic + context proximity.
- Thresholds: ≥0.75 → candidate; 0.5–0.75 → possible finding (collapsed); <0.5 → discard.
- Deduplicate by canonical code with max score.

---

## 5) Security, Privacy, Compliance
- **PHI Pipeline**: TLS in transit; envelope encryption at rest; scoped service accounts; row-level ACLs per tenant.
- **Data Residency**: UK/EU storage zones; egress blocked except approved AI endpoints; model hosting preferably in-region.
- **AV & DLP**: AV scan on upload; optional DLP to detect PII patterns (NHS no., DOB) for masking in evidence.
- **Audit**: Immutable logs for file upload, extraction start/finish, candidate generation, user confirmations.
- **Retention**: Configurable; default 7 years aligned with transcripts; separate TTL for raw files vs derived entities.

---

## 6) Performance & Sizing (Targets)
- Upload: single 20MB file < 10s on 10 Mbps; resumable chunks 5MB.
- Extraction SLA: P95 < 25s per doc (sync summary available; full details async OK if needed in future).
- Matching: P95 < 500ms per session after embeddings warm.

---

## 7) Observability
- Traces across Orchestrator→Extraction→Matching→Rules with `sessionId`, `fileId`, `candidateId`.
- Metrics: time_to_first_candidates, per-doc entity_count, acceptance_rate, false_positive_rate.

---

## 8) Testing Strategy
- Synthetic PDFs (asthma, diabetes, hypertension) with ground-truth labels for regression.
- Fuzz tests for OCR noise and misspellings.
- A11y checks for upload/review screens (keyboard-only, SR labels, evidence masking).

---

## 9) Risks & Mitigations
- **Low OCR quality** → Request higher-quality upload guidance; offer image pre-processing.
- **False positives** → Require user confirmation; show evidence; easy reject.
- **Latency variance** → Async extraction with polling; show progress UI.
- **PHI exposure** → Mask evidence; strict RBAC; redaction tooling.

---

**End Technical Addendum v0.2**

