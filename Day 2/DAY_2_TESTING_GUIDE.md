# Day 2 Testing Guide

## Overview

This guide provides comprehensive testing documentation for Day 2 features (Medical Report Intake & Prefill).

## Unit Testing

### Test Framework
- **Framework**: Jasmine/Karma
- **HTTP Mocking**: HttpClientTestingModule
- **Test Environment**: Angular TestBed
- **Coverage Target**: ≥80% for services

### Running Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch

# Run specific test file
npm test -- --include='**/file-upload.service.spec.ts'
```

### Test Files

1. **file-upload.service.spec.ts** - FileUploadService tests
2. **intake.service.spec.ts** - IntakeService tests
3. **dictionary.service.spec.ts** - DictionaryService tests
4. **prefill.service.spec.ts** - PrefillService tests
5. **phi-redaction.service.spec.ts** - PhiRedactionService tests
6. **security.service.spec.ts** - SecurityService tests

## Integration Testing

### Test Scenarios

#### 1. Upload → Extraction → Review → Confirmation Flow

```typescript
describe('Complete Upload Flow', () => {
  it('should handle complete flow', (done) => {
    // 1. Upload file
    // 2. Wait for extraction
    // 3. Review conditions
    // 4. Submit confirmations
    // 5. Verify prefill answers
  });
});
```

**Steps:**
1. User selects file → File validated
2. File uploaded → Upload progress tracked
3. Extraction starts → Polling begins
4. Extraction completes → Candidates presented
5. User reviews conditions → Accept/Reject
6. Confirmations submitted → Prefill generated
7. Prefill answers submitted → Interview continues

#### 2. Error Recovery Scenarios

**Upload Failure:**
- Network error during upload
- File size exceeds limit
- Unsupported file type
- Too many files

**Extraction Failure:**
- Extraction timeout
- Server error during extraction
- No candidates found

**Validation Errors:**
- Invalid confirmation payload
- Missing required fields
- Invalid condition codes

#### 3. Dictionary Search Integration

**Test Cases:**
- Search with valid query
- Search with empty query
- Search error handling
- Search result caching
- Autocomplete integration

#### 4. Prefill Answer Submission

**Test Cases:**
- Prefill answers stored correctly
- Prefill answers submitted to AnswerService
- Prefill answers appear in transcript
- Edit/remove prefill answers
- Error handling during submission

## E2E Testing

### Playwright Setup

```typescript
import { test, expect } from '@playwright/test';

test('should complete upload flow', async ({ page }) => {
  await page.goto('http://localhost:4200');
  
  // Open widget
  await page.click('.ins-fab-button');
  
  // Upload file
  await page.setInputFiles('.file-input', 'test.pdf');
  
  // Wait for extraction
  await page.waitForSelector('.ins-extraction-complete');
  
  // Review conditions
  await page.click('.ins-confirm-button');
  
  // Verify prefill in interview
  await expect(page.locator('.ins-prefill-indicator')).toBeVisible();
});
```

### E2E Test Scenarios

1. **Complete Upload Flow**
   - Upload file → Review conditions → Submit → Continue interview

2. **Skip Upload Flow**
   - Click "Skip for now" → Continue without upload

3. **Manual Condition Addition**
   - Search condition → Add manually → Confirm

4. **Edit/Remove Prefill**
   - Upload → Confirm → Edit in transcript → Remove

5. **Error Recovery**
   - Upload failure → Retry → Success

## Test Coverage

### Service Coverage

| Service | Coverage | Test Cases |
|---------|----------|------------|
| FileUploadService | ≥80% | 15+ |
| IntakeService | ≥80% | 10+ |
| DictionaryService | ≥80% | 5+ |
| PrefillService | ≥80% | 10+ |
| PhiRedactionService | ≥80% | 10+ |
| SecurityService | ≥80% | 8+ |

### Test Categories

1. **Happy Path Tests**
   - Normal operation flows
   - Success scenarios

2. **Error Handling Tests**
   - Network errors
   - Validation errors
   - Server errors

3. **Edge Case Tests**
   - Empty inputs
   - Boundary conditions
   - Timeout scenarios

4. **Integration Tests**
   - Service interactions
   - API integrations
   - Event flows

## Testing Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking
- Mock HTTP requests with HttpClientTestingModule
- Use spy functions for analytics
- Mock dependencies appropriately

### 3. Async Testing
- Use fakeAsync/tick for time-based tests
- Properly handle Observable subscriptions
- Use done callback for async tests

### 4. Assertions
- Clear, specific assertions
- Validate both success and error paths
- Check side effects (analytics, state changes)

## Debugging Tests

### Common Issues

1. **HTTP Mock Not Matched**
   - Check URL and method match
   - Verify request body

2. **Observable Not Completing**
   - Ensure error handling
   - Check for unsubscribed observables

3. **Async Test Failures**
   - Use fakeAsync/tick properly
   - Check done callback usage

### Debug Commands

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test
npm test -- --grep="should upload file successfully"

# Debug in browser
npm test -- --browsers=ChromeDebug
```

## Test Coverage Report

### View Coverage
```bash
npm run test:coverage
# Open coverage/insurance-chat-widget/index.html
```

### Coverage Thresholds
- **Statements**: ≥80%
- **Branches**: ≥80%
- **Functions**: ≥80%
- **Lines**: ≥80%

## Continuous Integration

### CI Configuration
- Run tests on every commit
- Generate coverage reports
- Fail build on coverage drop
- Report test results

### Test Scripts
```json
{
  "scripts": {
    "test": "ng test",
    "test:coverage": "ng test --code-coverage",
    "test:ci": "ng test --browsers=ChromeHeadless --watch=false"
  }
}
```

## Conclusion

Comprehensive testing ensures reliability and maintainability of Day 2 features. Follow this guide for consistent, effective testing practices.

