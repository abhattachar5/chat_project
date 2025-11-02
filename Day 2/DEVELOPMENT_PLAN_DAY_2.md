# Insurance Chat Widget - Day 2 Development Plan
## Medical Report Intake & Prefill Feature

## Executive Summary
This document outlines the development plan for Day 2 features: **Medical Report Intake & Prefill**. This extends the existing insurance interview chat widget with capabilities to upload medical documents, extract medical conditions via AI, match them against an Impairment Dictionary, and prefill the interview with detected conditions. The feature is designed to streamline the application process while maintaining strict privacy and security standards for PHI (Protected Health Information).

**Key Features:**
- Optional medical document upload (PDF, JPG, PNG, DOCX)
- AI-powered extraction of medical conditions
- Hybrid/semantic matching against Impairment Dictionary
- Review & confirmation UI for detected conditions
- Prefill integration into interview flow
- Adaptive interview prompts acknowledging confirmed conditions

**Key Technologies:**
- Angular 18 + Angular Material
- Drag-and-drop file upload (CDK)
- REST APIs for intake and extraction
- PHI-compliant encryption and storage
- Real-time extraction status updates

**Project Status:** Planning Phase

---

## 1. Project Phases Overview

### Phase 1: Upload & File Management (Week 1)
- File upload component with drag-and-drop
- File validation and status tracking
- Upload progress and error handling
- Integration with orchestrator API

### Phase 2: Review & Confirmation UI (Week 2)
- Detected conditions review screen
- Accept/reject/edit functionality
- Evidence peek with PHI masking
- Manual condition addition with dictionary search

### Phase 3: Extraction & Matching Integration (Week 2-3)
- API integration for extraction summary
- Confirmation submission
- Dictionary search typeahead
- Prefill data handling

### Phase 4: Prefill & Interview Adaptation (Week 3)
- Prefill engine integration
- Adaptive first prompt generation
- Answer envelope creation for prefilled conditions
- Edit/remove functionality during interview

### Phase 5: Security, Privacy & Compliance (Week 3-4)
- PHI handling and encryption
- Audit logging
- Data residency compliance
- Redaction features

### Phase 6: Testing & Polish (Week 4)
- Unit and integration tests
- Accessibility audits
- Performance optimization
- Error handling refinement

---

## 2. Detailed Task Breakdown

### 2.1 Phase 1: Upload & File Management

#### 2.1.1 File Upload Component
**Tasks:**
- [ ] Create `MedicalReportUploadComponent` with MatCard layout
- [ ] Implement drag-and-drop using Angular CDK (`cdkDropList`, `cdkDrag`)
- [ ] Add file picker button alternative (keyboard accessible)
- [ ] Display file format requirements (PDF, JPG, PNG, DOCX)
- [ ] Show file size limits (max 20MB per file, up to 5 files)
- [ ] Implement file type validation (client-side)
- [ ] Implement file size validation (client-side)
- [ ] Create file list display with status indicators
- [ ] Add remove file functionality
- [ ] Implement "Skip for now" button
- [ ] Add accessibility support (ARIA labels, keyboard navigation)

**Deliverables:**
- File upload UI component
- Drag-and-drop functionality
- File validation logic

**Dependencies:** Existing widget shell component

**Estimated Effort:** 5 days

---

#### 2.1.2 File Upload Service
**Tasks:**
- [ ] Create `FileUploadService` for upload management
- [ ] Implement `POST /v1/intake/files` API integration
- [ ] Add multipart form data handling
- [ ] Implement resumable upload support (chunked uploads)
- [ ] Add upload progress tracking (per-file and total)
- [ ] Handle upload status updates (queued → uploading → scanning → extracted → failed)
- [ ] Implement retry logic for failed uploads
- [ ] Add error handling (network errors, server errors)
- [ ] Store file metadata in service state

**Deliverables:**
- File upload service
- API integration layer

**Dependencies:** ApiService (2.1.1 from base plan), 2.1.1

**Estimated Effort:** 4 days

---

#### 2.1.3 Upload Status UI
**Tasks:**
- [ ] Create file status indicators component
- [ ] Display inline checklist per file:
  - [ ] Type OK
  - [ ] Size OK
  - [ ] Virus scan pending/complete
  - [ ] Upload complete
- [ ] Implement progress bars for upload progress
- [ ] Add status icons (MatIcon) for each state
- [ ] Create loading states (scanning, extracting)
- [ ] Add error state display with clear messages
- [ ] Implement `aria-live="polite"` for status announcements
- [ ] Add tooltips explaining each status

**Deliverables:**
- Upload status tracking UI
- Progress visualization

**Dependencies:** 2.1.1, 2.1.2

**Estimated Effort:** 3 days

---

#### 2.1.4 File Preview & Thumbnails
**Tasks:**
- [ ] Implement file preview thumbnail generation
- [ ] Support PDF thumbnail extraction (first page)
- [ ] Support image thumbnail (JPG, PNG)
- [ ] Handle DOCX thumbnail (placeholder icon)
- [ ] Display file name and size in list
- [ ] Add file type icons
- [ ] Implement preview modal (optional, if needed)
- [ ] Ensure no PHI parsing on client-side (thumbnails only)

**Deliverables:**
- File preview functionality
- Thumbnail display

**Dependencies:** 2.1.1

**Estimated Effort:** 2 days

---

#### 2.1.5 Error Handling & Validation
**Tasks:**
- [ ] Implement comprehensive error messages:
  - Unsupported file type
  - File too large (>20MB)
  - Too many files (>5)
  - Upload timeout
  - Network errors
- [ ] Add validation feedback UI (MatSnackBar or inline errors)
- [ ] Implement error recovery (retry upload)
- [ ] Handle partial failures (some files succeed, others fail)
- [ ] Add user-friendly error copy per UX spec

**Deliverables:**
- Error handling system
- User-friendly error messages

**Dependencies:** 2.1.1, 2.1.2

**Estimated Effort:** 2 days

---

### 2.2 Phase 2: Review & Confirmation UI

#### 2.2.1 Review Detected Conditions Component
**Tasks:**
- [ ] Create `ReviewConditionsComponent` with MatCard layout
- [ ] Display title: "Review detected conditions"
- [ ] Display subtitle: "Based on your documents"
- [ ] Implement condition list using MatList
- [ ] Create condition item card with:
  - [ ] Checkbox for accept/reject (MatCheckbox)
  - [ ] Canonical condition label
  - [ ] Original extracted term
  - [ ] Confidence score display (MatChip)
  - [ ] Status indicator (active/resolved)
  - [ ] Severity display (if available)
  - [ ] Onset date display (if available)
  - [ ] Evidence snippet preview (with PHI masking)
- [ ] Group conditions by confidence (high ≥0.75, medium 0.5-0.75, low <0.5)
- [ ] Collapse low-confidence items in "Possible findings" expandable section
- [ ] Add "Back" and "Confirm" buttons

**Deliverables:**
- Review conditions UI component
- Condition display with metadata

**Dependencies:** 2.1.1 (upload flow), Phase 3 (extraction summary data)

**Estimated Effort:** 5 days

---

#### 2.2.2 Evidence Peek & PHI Masking
**Tasks:**
- [ ] Create evidence snippet display component
- [ ] Implement PHI masking:
  - [ ] Mask NHS numbers
  - [ ] Mask addresses
  - [ ] Mask DOB patterns
  - [ ] Mask other identifiers
- [ ] Add "View evidence" expandable section (MatExpansionPanel)
- [ ] Display PHI warning: "This may include personal details. We mask identifiers by default."
- [ ] Add document reference (file name, page number)
- [ ] Implement "Show full evidence" with additional warning
- [ ] Ensure redaction before display
- [ ] Add keyboard accessibility for evidence expansion

**Deliverables:**
- Evidence preview with PHI masking
- Redaction functionality

**Dependencies:** 2.2.1, Extraction API (provides evidence snippets)

**Estimated Effort:** 4 days

---

#### 2.2.3 Manual Condition Addition
**Tasks:**
- [ ] Create "Add another condition" UI section
- [ ] Implement dictionary search input (MatAutocomplete)
- [ ] Add debounced typeahead search (300ms debounce)
- [ ] Integrate with `GET /v1/dictionary/search?q=` API
- [ ] Display search results with:
  - [ ] Canonical code
  - [ ] Label
  - [ ] Synonyms list
- [ ] Allow selecting condition from autocomplete
- [ ] Add selected condition to review list
- [ ] Mark manually added conditions appropriately
- [ ] Handle search errors and empty states

**Deliverables:**
- Manual condition search and addition
- Dictionary integration UI

**Dependencies:** Phase 3 (dictionary API), 2.2.1

**Estimated Effort:** 3 days

---

#### 2.2.4 Condition Edit & Reject
**Tasks:**
- [ ] Implement accept/reject toggle for each condition
- [ ] Add edit functionality for accepted conditions:
  - [ ] Edit status (active/resolved)
  - [ ] Edit severity (if applicable)
  - [ ] Edit onset date (MatDatepicker)
- [ ] Store rejection reason (for feedback/analytics)
- [ ] Update UI state on accept/reject/edit
- [ ] Validate edited data before submission
- [ ] Add confirmation dialog for rejections (optional)

**Deliverables:**
- Condition management (accept/reject/edit)
- User input validation

**Dependencies:** 2.2.1

**Estimated Effort:** 3 days

---

#### 2.2.5 Empty & Error States
**Tasks:**
- [ ] Create "No findings" empty state:
  - [ ] Message: "We didn't detect any conditions. You can add one now or continue."
  - [ ] "Add condition" button
  - [ ] "Continue without conditions" button
- [ ] Create extraction failure state:
  - [ ] Message: "We couldn't read this document. You can continue without it."
  - [ ] "Try again" option (re-upload)
  - [ ] "Continue without prefill" option
- [ ] Create low confidence state:
  - [ ] "Possible findings" expandable section
  - [ ] Message explaining low confidence
- [ ] Ensure all states are keyboard accessible

**Deliverables:**
- Empty and error state UIs
- User guidance for edge cases

**Dependencies:** 2.2.1, Extraction API responses

**Estimated Effort:** 2 days

---

### 2.3 Phase 3: Extraction & Matching Integration

#### 2.3.1 Extraction Summary Service
**Tasks:**
- [ ] Create `IntakeService` for intake-related APIs
- [ ] Implement `GET /v1/intake/summary?sessionId=` API
- [ ] Define TypeScript interfaces for:
  - [ ] CandidateCondition model
  - [ ] Evidence model
  - [ ] ExtractionSummary response
- [ ] Add polling logic for extraction status (poll every 2-3s until complete)
- [ ] Handle extraction completion/failure states
- [ ] Parse and transform API response to UI models
- [ ] Add error handling for extraction failures
- [ ] Implement timeout handling (max 60s wait)

**Deliverables:**
- Intake service
- Extraction summary API integration

**Dependencies:** ApiService (base), SessionService (base)

**Estimated Effort:** 3 days

---

#### 2.3.2 Confirmation Submission Service
**Tasks:**
- [ ] Implement `POST /v1/intake/confirmations` API
- [ ] Create confirmation payload structure:
  - [ ] sessionId
  - [ ] confirmed array (with edits)
  - [ ] rejected array
  - [ ] manualAdd array
- [ ] Transform UI state to API payload
- [ ] Handle confirmation response (prefill data)
- [ ] Store prefill answers in service state
- [ ] Add error handling for submission failures
- [ ] Implement retry logic with idempotency keys

**Deliverables:**
- Confirmation submission integration
- Prefill data handling

**Dependencies:** 2.3.1, 2.2.4

**Estimated Effort:** 3 days

---

#### 2.3.3 Dictionary Search Service
**Tasks:**
- [ ] Create `DictionaryService` for dictionary search
- [ ] Implement `GET /v1/dictionary/search?q=` API
- [ ] Add debounced search requests (300ms)
- [ ] Handle search response:
  - [ ] code
  - [ ] label
  - [ ] synonyms array
- [ ] Cache search results (in-memory, short TTL)
- [ ] Handle empty search results
- [ ] Handle search errors
- [ ] Support pagination if needed (future enhancement)

**Deliverables:**
- Dictionary search service
- Typeahead integration

**Dependencies:** ApiService (base)

**Estimated Effort:** 2 days

---

#### 2.3.4 Flow Integration
**Tasks:**
- [ ] Integrate upload → extraction → review → confirmation flow
- [ ] Navigate from upload screen to review screen after extraction
- [ ] Handle "Skip for now" → proceed directly to interview
- [ ] Store extraction state in session/service
- [ ] Handle back navigation (review → upload)
- [ ] Ensure session state persistence during flow
- [ ] Add loading states between screens

**Deliverables:**
- Complete intake flow
- Navigation logic

**Dependencies:** 2.1.1, 2.2.1, 2.3.1, 2.3.2

**Estimated Effort:** 3 days

---

### 2.4 Phase 4: Prefill & Interview Adaptation

#### 2.4.1 Prefill Engine Integration
**Tasks:**
- [ ] Create `PrefillService` to handle prefill logic
- [ ] Receive prefill answers from confirmation response
- [ ] Transform prefill data to AnswerEnvelope format:
  - [ ] questionId mapping
  - [ ] answer values
  - [ ] source: "prefill"
  - [ ] evidenceRefs array
- [ ] Store prefill answers in session state
- [ ] Integrate with QuestionService to inject prefilled answers
- [ ] Handle prefill answer submission to rules engine
- [ ] Apply skip logic hints from prefill

**Deliverables:**
- Prefill service
- Answer envelope creation for prefilled conditions

**Dependencies:** AnswerService (base), QuestionService (base), 2.3.2

**Estimated Effort:** 4 days

---

#### 2.4.2 Adaptive First Prompt
**Tasks:**
- [ ] Modify QuestionService to check for confirmed conditions
- [ ] Receive first question from orchestrator with prefill context
- [ ] Parse adaptive prompt that acknowledges confirmed conditions:
  - [ ] Example: "We noted **Asthma** from your documents. Please confirm this and add any other conditions."
- [ ] Display adaptive prompt in message list
- [ ] If no conditions detected, use standard wording
- [ ] Highlight confirmed conditions in prompt (bold or chips)
- [ ] Ensure prompt is accessible (ARIA labels)

**Deliverables:**
- Adaptive first medical history prompt
- Dynamic prompt generation display

**Dependencies:** QuestionService (base), MessageListComponent (base), 2.4.1

**Estimated Effort:** 3 days

---

#### 2.4.3 Prefill Answer Submission
**Tasks:**
- [ ] Submit prefilled answers using AnswerService
- [ ] Ensure AnswerEnvelope includes:
  - [ ] source: "prefill"
  - [ ] evidenceRefs: [fileId:pageNumber]
- [ ] Handle answer validation
- [ ] Update message list with submitted prefill
- [ ] Receive next question after prefill submission
- [ ] Handle prefill submission errors
- [ ] Ensure idempotency for prefill submissions

**Deliverables:**
- Prefill answer submission flow
- Integration with interview flow

**Dependencies:** AnswerService (base), 2.4.1

**Estimated Effort:** 2 days

---

#### 2.4.4 Edit/Remove During Interview
**Tasks:**
- [ ] Allow editing prefilled conditions during interview
- [ ] Add "Edit" button/option for prefilled answers in transcript
- [ ] Implement edit modal/dialog:
  - [ ] Show current prefilled condition
  - [ ] Allow modification (status, severity, date)
  - [ ] Allow removal (delete condition)
- [ ] Resubmit edited answer
- [ ] Update transcript to show change history
- [ ] Handle edit conflicts (if condition already processed)
- [ ] Ensure edit/remove is accessible

**Deliverables:**
- Edit/remove prefilled conditions during interview
- Change history tracking

**Dependencies:** AnswerService (base), TranscriptTabComponent (base), 2.4.1

**Estimated Effort:** 4 days

---

### 2.5 Phase 5: Security, Privacy & Compliance

#### 2.5.1 PHI Handling & Client-Side Security
**Tasks:**
- [ ] Ensure no PHI parsing on client-side (thumbnails only)
- [ ] Validate file types client-side before upload
- [ ] Implement file size validation before upload
- [ ] Ensure TLS 1.2+ for all API calls
- [ ] Never store PHI in localStorage or sessionStorage
- [ ] Use in-memory state only for sensitive data
- [ ] Clear in-memory data on widget close
- [ ] Add security headers validation

**Deliverables:**
- Client-side PHI security measures
- Secure data handling

**Dependencies:** All previous phases

**Estimated Effort:** 2 days

---

#### 2.5.2 PHI Masking & Redaction
**Tasks:**
- [ ] Implement client-side redaction for evidence snippets:
  - [ ] NHS number patterns: `/^[0-9]{3} ?[0-9]{3} ?[0-9]{4}$/`
  - [ ] Address patterns (street, city, postcode)
  - [ ] DOB patterns: `DD/MM/YYYY` or `DD-MM-YYYY`
  - [ ] Email patterns (optional, if shown)
- [ ] Create redaction utility service
- [ ] Apply redaction to all evidence displays
- [ ] Show redaction indicators (••••••)
- [ ] Add "Show unmasked" with explicit warning
- [ ] Ensure redaction works in transcript view
- [ ] Test redaction with various formats

**Deliverables:**
- PHI redaction utility
- Masked evidence display

**Dependencies:** 2.2.2, TranscriptTabComponent (base)

**Estimated Effort:** 3 days

---

#### 2.5.3 Audit Logging Integration
**Tasks:**
- [ ] Integrate with analytics service for audit events:
  - [ ] `intake.upload_started`
  - [ ] `intake.upload_finished`
  - [ ] `intake.upload_failed`
  - [ ] `intake.extract_started`
  - [ ] `intake.extract_finished`
  - [ ] `intake.candidates_presented`
  - [ ] `intake.confirmed`
  - [ ] `intake.rejected`
  - [ ] `intake.manual_add`
  - [ ] `intake.prefill_submitted`
- [ ] Include sessionId, fileId, candidateId in events
- [ ] Ensure events are immutable (timestamp, no modifications)
- [ ] Add error events for failures

**Deliverables:**
- Audit event integration
- Telemetry for intake flow

**Dependencies:** AnalyticsService (base), All intake components

**Estimated Effort:** 2 days

---

#### 2.5.4 Consent & Privacy UI
**Tasks:**
- [ ] Update consent dialog to include document processing:
  - [ ] "Your documents will be scanned for medical conditions..."
  - [ ] "Documents are used for underwriting and retained per policy"
  - [ ] Explicit PHI handling statement
- [ ] Add privacy notice on upload screen
- [ ] Display retention policy information
- [ ] Ensure consent is logged and transmitted
- [ ] Update consent acceptance to include document processing consent

**Deliverables:**
- Updated consent UI
- Privacy disclosures

**Dependencies:** ConsentDialogComponent (base), 2.1.1

**Estimated Effort:** 2 days

---

#### 2.5.5 Data Residency & Compliance
**Tasks:**
- [ ] Verify API endpoints are region-bound (UK/EU)
- [ ] Ensure no cross-region data transfer (client-side validation)
- [ ] Add compliance indicators in UI (optional, if required)
- [ ] Document data residency requirements
- [ ] Ensure encryption at rest (server-side, but verify client doesn't break it)

**Deliverables:**
- Data residency compliance
- Client-side validation

**Dependencies:** Configuration

**Estimated Effort:** 1 day

---

### 2.6 Phase 6: Testing & Polish

#### 2.6.1 Unit Testing
**Tasks:**
- [ ] Write unit tests for FileUploadService (≥80% coverage)
- [ ] Write unit tests for IntakeService
- [ ] Write unit tests for DictionaryService
- [ ] Write unit tests for PrefillService
- [ ] Write unit tests for redaction utility
- [ ] Write unit tests for MedicalReportUploadComponent
- [ ] Write unit tests for ReviewConditionsComponent
- [ ] Test file validation logic
- [ ] Test error handling paths
- [ ] Test confirmation payload creation

**Deliverables:**
- Comprehensive unit test suite for Day 2 features

**Dependencies:** All previous phases

**Estimated Effort:** 5 days

---

#### 2.6.2 Integration Testing
**Tasks:**
- [ ] Test upload → extraction → review → confirmation flow
- [ ] Test API integrations with mock orchestrator
- [ ] Test dictionary search integration
- [ ] Test prefill answer submission
- [ ] Test adaptive prompt display
- [ ] Test edit/remove during interview
- [ ] Test error recovery scenarios (upload failure, extraction failure)
- [ ] Test "Skip for now" flow
- [ ] Test manual condition addition

**Deliverables:**
- Integration test suite
- End-to-end flow verification

**Dependencies:** 2.6.1, Mock orchestrator APIs

**Estimated Effort:** 4 days

---

#### 2.6.3 Accessibility Audits
**Tasks:**
- [ ] Audit upload screen (keyboard navigation, SR labels)
- [ ] Audit review screen (keyboard navigation, SR labels)
- [ ] Test drag-and-drop keyboard alternative
- [ ] Test file picker keyboard accessibility
- [ ] Test evidence expansion with keyboard
- [ ] Test dictionary autocomplete with keyboard
- [ ] Run automated a11y tests (axe-core)
- [ ] Manual SR testing (NVDA, JAWS)
- [ ] Fix all critical/serious a11y issues
- [ ] Ensure WCAG 2.1 AA compliance

**Deliverables:**
- Accessibility audit report
- A11y fixes

**Dependencies:** All UI components

**Estimated Effort:** 4 days

---

#### 2.6.4 Performance Optimization
**Tasks:**
- [ ] Optimize file upload (chunked uploads for large files)
- [ ] Optimize thumbnail generation (lazy loading)
- [ ] Optimize dictionary search (debouncing, caching)
- [ ] Profile extraction summary polling (optimize interval)
- [ ] Test with multiple files (5 files scenario)
- [ ] Ensure upload P95 < 10s for 20MB file on 10 Mbps
- [ ] Test evidence masking performance
- [ ] Optimize component rendering (OnPush change detection)
- [ ] Run Lighthouse audits

**Deliverables:**
- Performance optimizations
- Performance test results

**Dependencies:** All previous phases

**Estimated Effort:** 3 days

---

#### 2.6.5 Error Handling Refinement
**Tasks:**
- [ ] Review all error scenarios:
  - [ ] Unsupported file type
  - [ ] File too large
  - [ ] Too many files
  - [ ] Upload timeout
  - [ ] Network errors
  - [ ] Extraction failure
  - [ ] Low confidence candidates
  - [ ] Dictionary search errors
  - [ ] Confirmation submission errors
- [ ] Ensure user-friendly error messages per UX spec
- [ ] Add recovery options for all errors
- [ ] Test error boundaries
- [ ] Add error logging for debugging

**Deliverables:**
- Comprehensive error handling
- User-friendly error messages

**Dependencies:** All previous phases

**Estimated Effort:** 2 days

---

#### 2.6.6 Browser Compatibility Testing
**Tasks:**
- [ ] Test file upload on Chrome, Edge, Firefox, Safari
- [ ] Test drag-and-drop on all browsers
- [ ] Test file picker on all browsers
- [ ] Test mobile browsers (iOS Safari, Chrome Android)
- [ ] Test file size limits on different browsers
- [ ] Fix browser-specific issues
- [ ] Document browser support

**Deliverables:**
- Browser compatibility report
- Cross-browser fixes

**Dependencies:** All UI components

**Estimated Effort:** 3 days

---

## 3. Technical Architecture (Day 2 Additions)

### 3.1 New Components
```
InsuranceChatWidgetModule (extended)
├── MedicalReportUploadComponent
│   ├── FileDropDirective (CDK)
│   ├── FileListComponent
│   └── UploadStatusComponent
├── ReviewConditionsComponent
│   ├── ConditionItemComponent
│   ├── EvidencePeekComponent
│   └── DictionarySearchComponent
└── Services (new)
    ├── FileUploadService
    ├── IntakeService
    ├── DictionaryService
    └── PrefillService
```

### 3.2 New Models
```typescript
// File upload models
interface UploadFile {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'scanning' | 'extracted' | 'failed';
  progress: number;
  fileId?: string;
}

// Extraction models
interface CandidateCondition {
  id: string;
  originalTerm: string;
  canonical: { code: string; label: string };
  confidence: number;
  status?: 'active' | 'resolved';
  severity?: string;
  onsetDate?: string;
  evidence: Evidence;
}

interface Evidence {
  docId: string;
  page: number;
  snippet: string; // redacted
}

// Prefill models
interface PrefillAnswer {
  questionId: string;
  answer: any;
  source: 'prefill';
  evidenceRefs: string[];
}
```

### 3.3 API Endpoints (New)
- `POST /v1/intake/files` - Upload medical document
- `GET /v1/intake/summary?sessionId=...` - Get extraction summary
- `POST /v1/intake/confirmations` - Submit confirmations
- `GET /v1/dictionary/search?q=...` - Search impairment dictionary

### 3.4 Flow Sequence
1. **Upload Flow:**
   - User uploads files → Widget validates → POST /intake/files → Poll for summary

2. **Review Flow:**
   - GET /intake/summary → Display candidates → User reviews → POST /intake/confirmations

3. **Prefill Flow:**
   - Confirmation response includes prefill → Submit prefilled answers → First question adapts

---

## 4. Risk Assessment & Mitigation

### 4.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| File upload performance on slow connections | High | Medium | Implement chunked/resumable uploads, show progress |
| Extraction API latency | High | Medium | Polling with reasonable timeout, show loading states |
| PHI leakage in client logs | Critical | Low | Never log PHI, use redaction, audit code |
| Browser compatibility for drag-and-drop | Medium | Low | Provide button alternative, test early |
| Dictionary search performance | Medium | Low | Debouncing, caching, pagination if needed |
| Extraction accuracy issues | Medium | High | Require user confirmation, show confidence scores |

### 4.2 Compliance Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| GDPR/PHI compliance gaps | Critical | Low | Early privacy review, PHI masking, audit logs |
| Data residency violations | Critical | Low | Verify API endpoints, document requirements |
| Retention policy non-compliance | High | Low | Document retention, ensure server-side compliance |

### 4.3 Timeline Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API contract delays | High | Medium | Mock services, early API agreement |
| Extraction service not ready | High | Medium | Stub extraction API, simulate responses |
| Scope creep in review UI | Medium | Medium | Strict adherence to UX spec, change control |

---

## 5. Dependencies & Prerequisites

### 5.1 External Dependencies
- **Orchestrator API** must provide intake endpoints (or mocked)
- **Extraction Service** must be available (or mocked for development)
- **Impairment Dictionary Service** must be available (or mocked)
- **Prefill Engine** integration ready (or stubbed)

### 5.2 Internal Dependencies
- Base widget shell component (Phase 1)
- SessionService (existing)
- ApiService (existing)
- AnswerService (existing)
- QuestionService (existing)
- MessageListComponent (existing)
- ConsentDialogComponent (existing)

### 5.3 Design Dependencies
- Finalized UX wireframes (UX v0.2)
- Approved copy/microcopy
- Theme tokens for new components
- Accessibility acceptance criteria

---

## 6. Success Criteria (Day 2)

### 6.1 Functional
- [ ] Upload accepts PDF/JPG/PNG/DOCX; rejects others with clear error
- [ ] For sample asthma PDF, system detects *asthma*, matches to canonical impairment, confidence ≥0.75, presents for confirmation
- [ ] After acceptance, first medical history prompt acknowledges asthma and asks to confirm or add more
- [ ] User can remove prefilled asthma later; transcript shows change history
- [ ] Evidence peek masks personal identifiers by default
- [ ] "Skip for now" proceeds directly to interview
- [ ] Manual condition addition works via dictionary search

### 6.2 Non-Functional
- [ ] Upload P95 < 10s for 20MB file on 10 Mbps connection
- [ ] Extraction summary polling completes within 60s
- [ ] Dictionary search responds P95 < 500ms
- [ ] No PHI logged in browser console
- [ ] WCAG 2.1 AA compliance maintained
- [ ] All new components keyboard accessible
- [ ] Works on latest 2 versions of major browsers

### 6.3 Security & Privacy
- [ ] No PHI parsing on client-side (thumbnails only)
- [ ] All evidence displays masked by default
- [ ] Audit events logged for all user actions
- [ ] TLS 1.2+ for all API calls
- [ ] No PHI in localStorage/sessionStorage

---

## 7. Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Upload & File Management | 1 week | Upload UI, file validation, upload service |
| Phase 2: Review & Confirmation UI | 1 week | Review screen, evidence peek, dictionary search |
| Phase 3: Extraction & Matching Integration | 1 week | API integrations, flow orchestration |
| Phase 4: Prefill & Interview Adaptation | 1 week | Prefill service, adaptive prompts |
| Phase 5: Security, Privacy & Compliance | 3-4 days | PHI masking, audit logging, compliance |
| Phase 6: Testing & Polish | 1 week | Tests, audits, performance, errors |

**Total Estimated Duration: 4-5 weeks**

---

## 8. Team Structure Recommendations

### 8.1 Core Team
- **1 Frontend Lead Developer** (Angular expertise, Day 2 feature owner)
- **1-2 Frontend Developers** (component development)
- **1 QA Engineer** (testing, accessibility audits)
- **1 Security/Compliance Reviewer** (PHI handling review)

### 8.2 Supporting Roles
- **Backend Engineer** (intake API support, extraction service integration)
- **UX/Designer** (design review, accessibility guidance)
- **Product Owner** (requirements clarification, acceptance criteria)

---

## 9. Next Steps

1. **Stakeholder Review** of this development plan
2. **API Contract Agreement** - Finalize intake API endpoints
3. **Mock Services Setup** - Create mock orchestrator for development
4. **Design Review** - Approve final UX designs for upload and review screens
5. **Security Review** - Review PHI handling approach
6. **Kickoff Meeting** - Align team on Day 2 requirements
7. **Begin Phase 1** - Start upload component development

---

## 10. Open Questions & Decisions Needed

1. **Upload Placement** - After consent (default) or before consent? (FRD2-001 mentions both options)
2. **Extraction Timing** - Real-time during upload or batch after all uploads complete?
3. **Dictionary Taxonomy** - SNOMED CT, ICD-10, or proprietary? (Open question #2 in FRD)
4. **Confidence Thresholds** - Per-tenant configurable or global defaults? (Open question #5)
5. **Evidence Preview** - Full document preview allowed or snippets only?
6. **Retention Display** - Show retention policy in UI or only in consent?
7. **Handwriting OCR** - Required for Phase 1 or future enhancement? (Open question #1)

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Owner:** Development Team  
**Status:** Draft for Review  
**Depends on:** Day 1 Development Plan (Base Widget)

