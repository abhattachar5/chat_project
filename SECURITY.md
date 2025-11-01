# Security Guide

## Security Features

### Authentication

The widget uses JWT tokens for authentication:

```typescript
config: {
  apiBaseUrl: 'https://api.example.com',
  tenantId: 'tenant-123',
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
}
```

**Best Practices:**
- Tokens should be short-lived (recommended: 1 hour)
- Tokens should be renewed before expiration
- Never log or expose tokens in console
- Use HTTPS for all API communications

### CORS Configuration

The widget respects CORS headers from the orchestrator:

- Only requests to configured `apiBaseUrl` are allowed
- CORS errors should be handled gracefully
- Preflight requests are automatically handled

### XSS Prevention

**Input Sanitization:**
- All user input is sanitized before display
- Angular's built-in sanitization is used
- HTML in messages is sanitized
- No inline JavaScript execution

**Output Encoding:**
```typescript
// Safe: Angular automatically escapes
{{ userInput }}

// For trusted content, use sanitization
[innerHTML]="sanitize(content)"
```

### Data Privacy

**No PII Storage:**
- No PII stored in localStorage
- No PII stored in sessionStorage
- All PII is stored in-memory only
- Session data is cleared on close

**Sensitive Data Masking:**
- Sensitive fields are automatically masked in transcript
- Masking is done client-side for display
- Server receives unmasked data (if required)

### Idempotency

POST requests include idempotency keys:

```typescript
headers.set('Idempotency-Key', idempotencyService.generateKey());
```

This prevents:
- Duplicate submissions
- Race conditions
- Accidental re-submissions

### Content Security Policy (CSP)

When embedding the widget, ensure CSP headers allow:

```
Content-Security-Policy: 
  script-src 'self' https://cdn.example.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com wss://api.example.com;
```

### Security Checklist

- [ ] JWT tokens are validated on server
- [ ] CORS is properly configured
- [ ] HTTPS is used for all communications
- [ ] User input is sanitized
- [ ] No XSS vulnerabilities
- [ ] No PII in localStorage
- [ ] Idempotency keys are unique
- [ ] Dependencies are up-to-date (no vulnerabilities)
- [ ] CSP headers are configured
- [ ] Error messages don't expose sensitive information

### Dependency Scanning

Regularly scan for vulnerabilities:

```bash
npm audit
npm audit fix
```

### Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@example.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices

### For Integrators

1. **Validate JWT tokens** on the server
2. **Use HTTPS** for all communications
3. **Configure CORS** properly
4. **Sanitize input** on the server as well
5. **Monitor** for suspicious activity
6. **Keep dependencies** up-to-date

### For Developers

1. **Never commit** tokens or secrets
2. **Use environment variables** for sensitive config
3. **Sanitize** all user input
4. **Validate** all server responses
5. **Handle errors** gracefully (no sensitive info in errors)
6. **Review** code for security issues
7. **Test** for XSS and injection vulnerabilities

## Known Security Considerations

### WebSocket Connections

- WebSocket URLs should use `wss://` (secure WebSocket)
- Validate WebSocket origin on server
- Implement rate limiting for WebSocket connections

### File Uploads

- Validate file types and sizes
- Scan uploads for malware
- Store uploads securely
- Don't execute uploaded files

### Voice Data

- Voice recordings may contain sensitive information
- Ensure secure transmission (wss://)
- Clear recordings after processing
- Comply with data privacy regulations

