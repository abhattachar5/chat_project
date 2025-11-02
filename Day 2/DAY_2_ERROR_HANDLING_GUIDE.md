# Day 2 Error Handling Guide

## Overview

This guide documents error handling patterns and user-friendly error messages for Day 2 features (Medical Report Intake & Prefill).

## Error Catalog

### Upload Errors

#### upload_error_400 - Invalid File Format
- **Message**: "Invalid file format. Please check the file and try again."
- **Retryable**: Yes
- **Severity**: Error
- **Action**: Retry
- **Recovery**: User can check file format and retry

#### upload_error_413 - File Too Large
- **Message**: "File too large. Maximum size is 20MB. Please use a smaller file."
- **Retryable**: No
- **Severity**: Error
- **Action**: Resize file
- **Recovery**: User must use a smaller file or compress the file

#### upload_error_415 - Unsupported File Type
- **Message**: "Unsupported file type. Please use PDF, JPG, PNG, or DOCX."
- **Retryable**: No
- **Severity**: Error
- **Action**: Convert file
- **Recovery**: User must convert file to supported format

#### upload_error_0 - Network Error
- **Message**: "Upload failed. Please check your connection and try again."
- **Retryable**: Yes
- **Severity**: Error
- **Action**: Retry
- **Recovery**: User can check connection and retry

#### upload_timeout - Upload Timeout
- **Message**: "Upload timeout. Please check your connection and try again."
- **Retryable**: Yes
- **Severity**: Warning
- **Action**: Retry
- **Recovery**: User can retry with better connection

#### too_many_files - Maximum Files Exceeded
- **Message**: "Maximum 5 files allowed. Please remove some files and try again."
- **Retryable**: No
- **Severity**: Error
- **Action**: Remove files
- **Recovery**: User must remove excess files

### Extraction Errors

#### extraction_failed - Extraction Failure
- **Message**: "Failed to extract conditions from document. Please try uploading again or continue without upload."
- **Retryable**: Yes
- **Severity**: Warning
- **Action**: Retry or skip
- **Recovery**: User can retry upload or skip this step

#### extraction_timeout - Extraction Timeout
- **Message**: "Extraction is taking longer than expected. You can wait or skip this step."
- **Retryable**: Yes
- **Severity**: Warning
- **Action**: Wait or skip
- **Recovery**: User can wait or skip to continue

#### no_candidates_found - No Conditions Detected
- **Message**: "No medical conditions detected in your documents. You can continue with the interview."
- **Retryable**: No
- **Severity**: Info
- **Action**: Continue
- **Recovery**: User can continue with interview

#### low_confidence_candidates - Low Confidence Warning
- **Message**: "Some conditions have low confidence. Please review carefully."
- **Retryable**: No
- **Severity**: Warning
- **Action**: Review
- **Recovery**: User should review conditions carefully

### Dictionary Errors

#### dictionary_search_failed - Search Failure
- **Message**: "Search temporarily unavailable. You can add conditions manually."
- **Retryable**: Yes
- **Severity**: Warning
- **Action**: Retry
- **Recovery**: User can retry search or add manually

### Confirmation Errors

#### confirmation_failed - Confirmation Failure
- **Message**: "Failed to save your selections. Please try again."
- **Retryable**: Yes
- **Severity**: Error
- **Action**: Retry
- **Recovery**: User can retry submission

#### confirmation_validation_error - Validation Error
- **Message**: "Please select at least one condition or add a new one."
- **Retryable**: No
- **Severity**: Error
- **Action**: Select condition
- **Recovery**: User must select or add a condition

## Error Handling Patterns

### Pattern 1: Retryable Errors
```typescript
{
  retryable: true,
  severity: 'error' | 'warning',
  action: 'retry',
  message: 'Clear action message with retry option',
}
```

### Pattern 2: User Action Required
```typescript
{
  retryable: false,
  severity: 'error',
  action: 'resize_file' | 'convert_file' | 'remove_files',
  message: 'Specific action user must take',
}
```

### Pattern 3: Informational
```typescript
{
  retryable: false,
  severity: 'info' | 'warning',
  action: 'continue' | 'review',
  message: 'Informational message with guidance',
}
```

## User-Friendly Error Messages

### Principles
1. **Clear and Specific**: Tell user exactly what went wrong
2. **Actionable**: Provide clear next steps
3. **Context-Aware**: Relevant to user's current action
4. **Recovery Options**: Always provide a way forward
5. **Non-Technical**: Avoid technical jargon

### Examples

#### Good Error Messages
- ✅ "File too large. Maximum size is 20MB. Please use a smaller file."
- ✅ "Upload failed. Please check your connection and try again."
- ✅ "No medical conditions detected in your documents. You can continue with the interview."

#### Bad Error Messages
- ❌ "Error 413"
- ❌ "Upload failed"
- ❌ "Network error occurred"

## Recovery Strategies

### Automatic Recovery
- **Network Errors**: Auto-retry with exponential backoff
- **Transient Errors**: Auto-retry with user notification

### User-Initiated Recovery
- **Validation Errors**: User must fix input
- **File Errors**: User must fix file (resize, convert)
- **Confirmation Errors**: User can retry submission

### Skip Option
- **Extraction Timeout**: User can skip and continue
- **Extraction Failure**: User can skip and continue
- **Upload Failure**: User can skip and continue

## Error Logging

### Client-Side Logging
- **Error Codes**: Logged for debugging
- **Context**: User action context included
- **No PHI**: Never log sensitive information
- **Analytics**: Errors tracked via AnalyticsService

### Server-Side Logging
- **Error Details**: Full error details on server
- **Session Context**: Session ID included
- **File Context**: File ID included (no file contents)
- **User Context**: Session metadata (no PHI)

## Testing Error Scenarios

### Upload Errors
1. Upload invalid file type
2. Upload oversized file
3. Upload too many files
4. Network error during upload
5. Upload timeout

### Extraction Errors
1. Extraction failure
2. Extraction timeout
3. No candidates found
4. Low confidence candidates

### Dictionary Errors
1. Search failure
2. Search timeout
3. Empty search results

### Confirmation Errors
1. Validation error
2. Submission failure
3. Network error during submission

## Best Practices

### 1. Error Prevention
- **Validation**: Validate input before submission
- **User Guidance**: Clear instructions prevent errors
- **Progressive Enhancement**: Graceful degradation

### 2. Error Communication
- **Timely**: Show errors immediately
- **Clear**: Use plain language
- **Actionable**: Provide recovery options

### 3. Error Recovery
- **Automatic**: Retry transient errors automatically
- **Manual**: Provide manual retry for user errors
- **Skip Option**: Allow users to skip non-critical steps

### 4. Error Analytics
- **Track Errors**: Log all errors for analysis
- **Monitor Patterns**: Identify common error patterns
- **Improve UX**: Use error data to improve user experience

## Conclusion

Comprehensive error handling ensures users can recover from errors gracefully and continue their workflow. Follow this guide for consistent, user-friendly error handling.

