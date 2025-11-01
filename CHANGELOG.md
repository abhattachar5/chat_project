# Changelog

All notable changes to the Insurance Chat Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-XX

### Added
- Initial release of Insurance Chat Widget
- Core chat functionality with message display
- Text input with validation
- Session lifecycle management
- Question rendering and answer submission
- Voice input support (push-to-talk)
- WebSocket ASR/TTS integration
- VU meter for audio visualization
- Transcript view with filtering and search
- Sensitive data masking
- Progress indicator
- Navigation controls (back/forward)
- Completion screen
- Comprehensive error handling
- Keyboard navigation (full keyboard support)
- Screen reader support (WCAG 2.1 AA)
- Color contrast compliance (4.5:1 body, 3:1 large text)
- Reduced motion support
- High contrast mode support
- Theme system with runtime switching
- Internationalization foundation (en-GB)
- Unit tests (≥80% coverage)
- E2E tests (Playwright)
- Comprehensive documentation

### Security
- JWT token authentication
- CORS configuration support
- XSS prevention (input sanitization)
- No PII in localStorage
- Idempotency keys for POST requests

### Performance
- Virtual scrolling for message list
- Lazy loading support
- Bundle size optimization
- API request optimization

## [Unreleased]

### Planned
- Additional locale support (en-US, etc.)
- Enhanced question type components (datepicker, file upload, signature)
- Full Angular i18n integration
- Advanced analytics features
- Custom question type support

