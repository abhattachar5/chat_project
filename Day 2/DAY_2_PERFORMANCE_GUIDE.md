# Day 2 Performance Guide

## Overview

This guide documents performance optimizations and targets for Day 2 features (Medical Report Intake & Prefill).

## Performance Targets

### Upload Performance
- **P95 Upload Time**: < 10s for 20MB file on 10 Mbps connection
- **Progress Tracking**: Real-time updates without blocking UI
- **Multiple Files**: Parallel upload support

### Dictionary Search Performance
- **Response Time**: < 200ms for search queries
- **Debouncing**: 300ms delay to reduce requests
- **Caching**: Results cached per query

### Extraction Performance
- **Polling Interval**: 2 seconds (optimized)
- **Timeout**: 60 seconds maximum
- **UI Responsiveness**: Non-blocking polling

### Component Rendering
- **Frame Rate**: 60 FPS (16ms per frame)
- **Change Detection**: OnPush where applicable
- **Lazy Loading**: Evidence expanded on demand

## Optimizations Implemented

### Dictionary Search

#### Debouncing
```typescript
searchSubject.pipe(
  debounceTime(300),  // Wait 300ms after last input
  distinctUntilChanged()  // Only search if query changed
)
```

#### Caching
```typescript
private searchCache = new Map<string, DictionarySearchResult[]>();

search(query: string): Observable<DictionarySearchResult[]> {
  if (this.searchCache.has(query)) {
    return of(this.searchCache.get(query)!);
  }
  // ... perform search and cache result
}
```

### Extraction Polling

#### Optimized Interval
```typescript
private readonly POLL_INTERVAL = 2000;  // 2 seconds
private readonly MAX_POLL_TIME = 60000;  // 60 seconds max
```

#### Progressive Updates
```typescript
pollExtractionSummary().pipe(
  tap(summary => {
    // Update UI without blocking
    onProgress?.(summary);
  })
)
```

### Component Rendering

#### OnPush Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

#### Lazy Loading
```typescript
// Evidence expanded on demand
showEvidence(condition: ProcessedCondition): void {
  condition.showEvidence = !condition.showEvidence;
  // Load evidence only when expanded
}
```

## Performance Monitoring

### Metrics to Track

#### Upload Metrics
- Upload start time
- Upload duration
- Upload progress milestones (25%, 50%, 75%, 100%)
- Upload success/failure rate
- File size distribution

#### Extraction Metrics
- Extraction start time
- Extraction duration
- Polling count
- Extraction success/failure rate
- Candidate count distribution

#### Search Metrics
- Search query length
- Search response time
- Cache hit rate
- Search success/failure rate

### Performance Logging

#### Client-Side
```typescript
const startTime = Date.now();
// ... operation
const duration = Date.now() - startTime;
analyticsService.emit({
  event: 'performance.metric',
  metric: 'upload_duration',
  value: duration,
});
```

#### Server-Side
- Track API response times
- Monitor polling frequency
- Analyze extraction patterns

## Best Practices

### 1. Minimize HTTP Requests
- **Debounce Search**: Reduce dictionary search requests
- **Cache Results**: Cache dictionary search results
- **Batch Operations**: Group related operations

### 2. Optimize Rendering
- **OnPush Strategy**: Use where applicable
- **Lazy Loading**: Load content on demand
- **Virtual Scrolling**: For long lists (if needed)

### 3. Network Optimization
- **Progress Tracking**: Show progress without blocking
- **Parallel Uploads**: Support multiple file uploads
- **Timeout Handling**: Reasonable timeouts with fallbacks

### 4. Memory Management
- **Clear Cache**: Clear cache when appropriate
- **Unsubscribe**: Unsubscribe from observables
- **Cleanup**: Clean up resources on destroy

## Performance Testing

### Load Testing

#### Upload Load Test
- Test with various file sizes (1MB, 5MB, 10MB, 20MB)
- Test with multiple files (1, 3, 5 files)
- Test on different connection speeds (slow 3G, 4G, WiFi)

#### Extraction Load Test
- Test with various extraction times
- Test with various candidate counts
- Test polling behavior under load

### Lighthouse Audit

#### Performance Score
- Target: 90+ performance score
- Areas to optimize:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Time to Interactive (TTI)
  - Total Blocking Time (TBT)

### Real User Monitoring (RUM)

#### Metrics
- Page load time
- Time to interactive
- API response times
- Error rates
- User engagement metrics

## Performance Checklist

### Upload Performance
- [ ] Upload P95 < 10s for 20MB file
- [ ] Progress tracking non-blocking
- [ ] Multiple file support optimized
- [ ] Error handling doesn't block UI

### Search Performance
- [ ] Search response time < 200ms
- [ ] Debouncing implemented (300ms)
- [ ] Caching implemented
- [ ] Empty query handling optimized

### Extraction Performance
- [ ] Polling interval optimized (2s)
- [ ] Timeout reasonable (60s)
- [ ] UI remains responsive during polling
- [ ] Error handling doesn't block UI

### Component Performance
- [ ] OnPush change detection where applicable
- [ ] Lazy loading for evidence
- [ ] Virtual scrolling if needed
- [ ] Memory leaks prevented

## Conclusion

Performance optimizations ensure smooth user experience. Follow this guide for optimal performance targets and best practices.

