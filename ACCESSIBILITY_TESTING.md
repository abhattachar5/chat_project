# Accessibility Testing Guide

## Automated Testing

### Axe-core Integration

```typescript
import { inject } from '@angular/core';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const component = createComponent();
  const results = await axe(component.nativeElement);
  expect(results).toHaveNoViolations();
});
```

### Playwright Accessibility Tests

```typescript
import { test, expect } from '@playwright/test';

test('should pass accessibility checks', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await page.locator('.ins-fab-button').click();
  
  // Run axe-core
  const accessibilityScanResults = await page.accessibility.snapshot();
  
  // Check for violations
  const violations = await page.evaluate(() => {
    return window.axe?.run().then(results => results.violations);
  });
  
  expect(violations).toHaveLength(0);
});
```

## Manual Testing Checklist

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Shift+Tab navigates backwards
- [ ] Enter activates buttons and submits forms
- [ ] Escape closes dialogs/cancels actions
- [ ] Arrow keys navigate tabs/selects
- [ ] Focus order is logical
- [ ] No focus traps
- [ ] Focus indicators are visible (3px outline)

### Screen Reader Testing

#### NVDA (Windows)
- [ ] All interactive elements have accessible names
- [ ] Form fields have labels
- [ ] Buttons have descriptive labels
- [ ] Live regions announce dynamic content
- [ ] Heading structure is logical
- [ ] Landmarks are properly used

#### JAWS (Windows)
- [ ] All content is readable
- [ ] Forms are navigable
- [ ] Error messages are announced
- [ ] Status changes are announced

#### VoiceOver (macOS/iOS)
- [ ] Gestures work correctly
- [ ] All content is accessible
- [ ] Focus management works
- [ ] Voice control is supported

### Color Contrast

- [ ] Body text: 4.5:1 contrast ratio
- [ ] Large text (18pt+): 3:1 contrast ratio
- [ ] Focus indicators: 3:1 contrast ratio
- [ ] Test with color blindness simulators

### Visual Testing

- [ ] High contrast mode works
- [ ] Reduced motion is respected
- [ ] Zoom up to 200% still works
- [ ] Text remains readable at all sizes

## Testing Tools

### Automated
- **axe-core** - Automated accessibility testing
- **pa11y** - Command-line accessibility testing
- **Lighthouse** - Accessibility audit in DevTools

### Manual
- **NVDA** - Free screen reader for Windows
- **JAWS** - Commercial screen reader for Windows
- **VoiceOver** - Built-in screen reader for macOS/iOS
- **Chrome DevTools** - Accessibility inspection
- **WAVE** - Web accessibility evaluation tool

## Test Scenarios

### Complete User Flow (Keyboard Only)

1. Tab to FAB button
2. Press Enter to open widget
3. Tab through tabs
4. Navigate to input field
5. Type answer
6. Tab to submit button
7. Press Enter to submit
8. Verify success message is announced

### Screen Reader Flow

1. Open widget with screen reader
2. Navigate through all elements
3. Verify all content is announced
4. Submit an answer
5. Verify confirmation is announced

### High Contrast Mode

1. Enable high contrast mode in OS
2. Open widget
3. Verify all elements are visible
4. Verify sufficient contrast

### Reduced Motion

1. Enable reduced motion in OS
2. Open widget
3. Verify VU meter shows numeric display
4. Verify no animations play

## Reporting Issues

When reporting accessibility issues, include:

1. **Issue Description** - What doesn't work
2. **Test Tool** - Screen reader/browser used
3. **Steps to Reproduce** - Detailed steps
4. **Expected Behavior** - What should happen
5. **Actual Behavior** - What actually happens
6. **WCAG Criteria** - Which criteria is violated

## Compliance Status

✅ **WCAG 2.1 AA Compliant**
- Keyboard accessible
- Screen reader compatible
- Color contrast compliant
- Focus indicators visible
- Reduced motion supported
- High contrast mode supported

