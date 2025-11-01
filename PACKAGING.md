# Packaging & Distribution Guide

## npm Package

### Package Configuration

The widget is configured as an npm package: `@provider/insurance-chat-widget`

**Package Info:**
- Name: `@provider/insurance-chat-widget`
- Version: `0.1.0` (SemVer)
- License: MIT
- Keywords: angular, chat-widget, insurance, voice-input, accessibility, wcag

### Installation

```bash
npm install @provider/insurance-chat-widget
```

### Usage

```typescript
import { InsuranceChatWidgetModule } from '@provider/insurance-chat-widget';

@NgModule({
  imports: [InsuranceChatWidgetModule],
})
export class AppModule { }
```

### Build for npm

```bash
npm run build:lib
```

Output: `dist/insurance-chat-widget/`

## UMD Bundle

### Build UMD Bundle

```bash
npm run build:umd
```

### Usage in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.example.com/insurance-chat-widget.css">
</head>
<body>
  <div id="chat-widget-container"></div>
  
  <script src="https://cdn.example.com/insurance-chat-widget.umd.js"></script>
  <script>
    InsuranceChatWidget.init({
      container: document.getElementById('chat-widget-container'),
      config: {
        apiBaseUrl: 'https://api.example.com',
        tenantId: 'tenant-123',
      },
    });
  </script>
</body>
</html>
```

## CDN Distribution

### CDN URLs

**Production:**
- JavaScript: `https://cdn.example.com/insurance-chat-widget/v0.1.0/insurance-chat-widget.umd.js`
- CSS: `https://cdn.example.com/insurance-chat-widget/v0.1.0/insurance-chat-widget.css`

**Latest:**
- JavaScript: `https://cdn.example.com/insurance-chat-widget/latest/insurance-chat-widget.umd.js`
- CSS: `https://cdn.example.com/insurance-chat-widget/latest/insurance-chat-widget.css`

### Versioning

The widget follows [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Distribution Checklist

- [ ] Build UMD bundle
- [ ] Minify JavaScript
- [ ] Minify CSS
- [ ] Generate source maps (optional for production)
- [ ] Upload to CDN
- [ ] Test CDN URLs
- [ ] Update documentation with CDN URLs
- [ ] Create version tag (git)
- [ ] Publish to npm (if applicable)

## Package Structure

```
dist/insurance-chat-widget/
├── insurance-chat-widget.umd.js    # UMD bundle
├── insurance-chat-widget.css       # Styles
├── esm2020/                        # ES modules
├── esm2015/                        # ES modules (ES2015)
├── fesm2020/                       # Flattened ES modules
├── fesm2015/                       # Flattened ES modules (ES2015)
├── lib/                            # CommonJS
├── package.json                    # Package metadata
├── public-api.d.ts                 # Type definitions
└── README.md                       # Package README
```

## TypeScript Definitions

Type definitions are included in the package:

```typescript
// Type definitions available
import { WidgetConfig, ChatMessage, Session } from '@provider/insurance-chat-widget';
```

## Publishing

### npm Publishing

```bash
# Build the library
npm run build:lib

# Publish to npm
npm publish --access public
```

### CDN Publishing

1. Build UMD bundle
2. Minify and optimize
3. Upload to CDN
4. Update CDN URLs in documentation

## Version Management

### Versioning Strategy

- **Patch (0.1.x)** - Bug fixes
- **Minor (0.x.0)** - New features
- **Major (x.0.0)** - Breaking changes

### Changelog

Maintain `CHANGELOG.md` with all version changes.

### Git Tags

```bash
# Create version tag
git tag -a v0.1.0 -m "Version 0.1.0"
git push origin v0.1.0
```

## Distribution Checklist

### Pre-Release

- [ ] All tests passing (`npm test`)
- [ ] E2E tests passing (`npm run e2e`)
- [ ] Coverage ≥80%
- [ ] No linting errors
- [ ] Documentation up-to-date
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json

### Build

- [ ] Build library (`npm run build:lib`)
- [ ] Build UMD bundle (`npm run build:umd`)
- [ ] Test bundle locally
- [ ] Check bundle size (< 500KB gzipped)

### Distribution

- [ ] Publish to npm (if applicable)
- [ ] Upload to CDN
- [ ] Create git tag
- [ ] Update documentation
- [ ] Announce release

## Browser Compatibility

See [BROWSER_COMPATIBILITY.md](./BROWSER_COMPATIBILITY.md) for supported browsers.

## Support

For issues and questions:
- GitHub Issues: https://github.com/provider/insurance-chat-widget/issues
- Documentation: See [README.md](./README.md)

