# Day 2 Accessibility Guide

## Overview

This guide documents accessibility features and WCAG 2.1 AA compliance for Day 2 features (Medical Report Intake & Prefill).

## WCAG 2.1 AA Compliance

### Level AA Success Criteria

#### Perceivable
- ✅ **1.3.1 Info and Relationships**: Semantic HTML structure
- ✅ **1.4.3 Contrast (Minimum)**: 4.5:1 contrast ratio
- ✅ **1.4.11 Non-text Contrast**: Focus indicators meet 3:1 ratio

#### Operable
- ✅ **2.1.1 Keyboard**: All functionality keyboard accessible
- ✅ **2.4.3 Focus Order**: Logical focus order
- ✅ **2.4.7 Focus Visible**: 3px outline on focus
- ✅ **2.5.3 Label in Name**: Accessible names match visible labels

#### Understandable
- ✅ **3.2.3 Consistent Navigation**: Consistent navigation patterns
- ✅ **3.3.2 Labels or Instructions**: Clear labels and instructions

#### Robust
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA attributes
- ✅ **4.1.3 Status Messages**: Live regions for dynamic updates

## Keyboard Navigation

### Upload Screen

#### Tab Navigation
- **Tab**: Move to next interactive element
- **Shift+Tab**: Move to previous element
- **Enter/Space**: Activate buttons or file picker
- **Escape**: Close dialogs (if any)

#### File Picker
- **Enter/Space**: Open file picker
- **Arrow Keys**: Navigate file list (if native dialog)
- **Escape**: Cancel file selection

#### Drag-and-Drop Alternative
- **Button**: "Choose files" button for keyboard users
- **Accessible**: Full keyboard support via button

### Review Screen

#### Tab Navigation
- **Tab**: Move through conditions
- **Shift+Tab**: Move backwards
- **Enter/Space**: Toggle accept/reject
- **Arrow Keys**: Navigate within condition groups

#### Evidence Expansion
- **Enter/Space**: Expand/collapse evidence
- **Tab**: Move to evidence controls
- **Escape**: Collapse evidence

#### Dictionary Search
- **Tab**: Move to search input
- **Arrow Keys**: Navigate autocomplete results
- **Enter**: Select autocomplete result
- **Escape**: Close autocomplete

### Component Navigation

#### Condition List
- **Tab**: Move between conditions
- **Arrow Keys**: Navigate within groups
- **Enter/Space**: Toggle selection
- **Tab**: Move to edit/save buttons

#### Manual Condition Addition
- **Tab**: Move to search input
- **Type**: Enter search query
- **Arrow Keys**: Navigate results
- **Enter**: Add selected condition

## Screen Reader Support

### ARIA Labels

#### Upload Screen
```html
<button aria-label="Choose files. Allowed types: PDF, JPG, PNG, DOCX">
  Choose files
</button>

<div 
  role="button" 
  aria-label="Drop files here or click to choose files"
  aria-describedby="upload-help">
  Drop zone
</div>
```

#### Review Screen
```html
<div role="list" aria-label="Detected medical conditions">
  <div role="listitem" aria-label="Condition: Asthma, Confidence: 90%">
    <!-- Condition details -->
  </div>
</div>

<button aria-label="Accept condition Asthma">
  Accept
</button>
```

### Live Regions

#### Upload Progress
```html
<div role="status" aria-live="polite" aria-atomic="true">
  Uploading file.pdf: 50% complete
</div>
```

#### Extraction Status
```html
<div role="status" aria-live="polite">
  Extracting conditions from documents...
</div>
```

### ARIA Descriptions

#### Complex Interactions
```html
<div 
  aria-describedby="evidence-help"
  aria-expanded="false"
  role="button">
  Show evidence
</div>

<div id="evidence-help" class="sr-only">
  Click to view evidence snippet. Personal information is masked for privacy.
</div>
```

## Focus Management

### Focus Indicators

#### Style
```css
.ins-focus-visible:focus-visible {
  outline: 3px solid #1976d2;
  outline-offset: 2px;
}
```

#### Visibility
- **3px outline**: Meets WCAG 2.1 AA contrast requirements
- **2px offset**: Clear separation from element
- **High contrast**: Blue (#1976d2) on white background

### Focus Order

#### Upload Screen
1. Drop zone / Choose files button
2. File list (if files uploaded)
3. Skip button
4. Continue button

#### Review Screen
1. Condition list header
2. Conditions (high confidence first)
3. Evidence expansion buttons
4. Manual condition search
5. Back button
6. Confirm button

### Focus Trapping

#### Dialogs
- **Escape**: Close dialog
- **Tab**: Cycle through dialog elements
- **Shift+Tab**: Cycle backwards
- **Focus Return**: Return focus to trigger element

## Screen Reader Testing

### NVDA (Windows)
- ✅ All interactive elements announced
- ✅ Form fields have labels
- ✅ Buttons have descriptive labels
- ✅ Live regions announce updates
- ✅ Heading structure logical

### JAWS (Windows)
- ✅ All content readable
- ✅ Forms navigable
- ✅ Error messages announced
- ✅ Status changes announced

### VoiceOver (macOS/iOS)
- ✅ Gestures work correctly
- ✅ All content accessible
- ✅ Focus management works
- ✅ Voice control supported

## Color Contrast

### Text Contrast
- **Primary Text**: 4.5:1 contrast ratio (meets AA)
- **Secondary Text**: 4.5:1 contrast ratio
- **Error Text**: 4.5:1 contrast ratio
- **Link Text**: 4.5:1 contrast ratio

### Non-Text Contrast
- **Focus Indicators**: 3:1 contrast ratio (meets AA)
- **Button Borders**: 3:1 contrast ratio
- **Icons**: 3:1 contrast ratio

## Testing Checklist

### Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Escape closes dialogs

### Screen Reader
- [ ] All elements have accessible names
- [ ] Form fields have labels
- [ ] Buttons have descriptive labels
- [ ] Dynamic content announced
- [ ] Error messages announced

### Color and Contrast
- [ ] Text meets 4.5:1 contrast
- [ ] Non-text meets 3:1 contrast
- [ ] Color not only indicator
- [ ] Focus indicators visible

### Forms
- [ ] All inputs have labels
- [ ] Error messages associated with inputs
- [ ] Required fields indicated
- [ ] Validation errors clear

## Best Practices

### 1. Semantic HTML
- Use proper HTML elements (button, input, label)
- Use headings for structure (h1-h6)
- Use lists for related items (ul, ol)

### 2. ARIA Attributes
- Use ARIA labels for non-text content
- Use ARIA describedby for additional context
- Use ARIA live regions for dynamic updates
- Use ARIA expanded for expandable content

### 3. Keyboard Support
- Ensure all functionality keyboard accessible
- Provide keyboard alternatives for mouse actions
- Maintain logical focus order
- Provide skip links for long pages

### 4. Testing
- Test with keyboard only
- Test with screen readers
- Test with high contrast mode
- Test with reduced motion

## Conclusion

Comprehensive accessibility ensures all users can interact with Day 2 features effectively. Follow this guide for WCAG 2.1 AA compliance.

