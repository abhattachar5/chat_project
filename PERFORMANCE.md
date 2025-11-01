# Performance Guide

## Performance Targets

- **Bundle Size:** < 500KB (gzipped)
- **TTFB (Time to First Byte):** < 300ms for next question
- **TTS Start:** < 1.2s
- **First Contentful Paint (FCP):** < 1.5s
- **Time to Interactive (TTI):** < 3s

## Optimization Strategies

### Bundle Size Optimization

**Tree Shaking:**
- Only import what you need
- Use barrel exports sparingly
- Remove unused dependencies

**Code Splitting:**
- Lazy load components
- Split vendor bundles
- Use dynamic imports

**Compression:**
- Gzip compression
- Brotli compression (for modern browsers)

### Runtime Performance

**Virtual Scrolling:**
```typescript
<cdk-virtual-scroll-viewport itemSize="80">
  @for (message of messages(); track message.id) {
    <div class="ins-message">{{ message.content }}</div>
  }
</cdk-virtual-scroll-viewport>
```

**Change Detection:**
- Use OnPush change detection strategy
- Minimize signal updates
- Debounce frequent updates

**Memory Management:**
- Unsubscribe from observables
- Clear intervals/timeouts
- Remove event listeners

### Network Optimization

**API Requests:**
- Batch requests when possible
- Use HTTP/2 for multiplexing
- Implement request caching
- Compress payloads

**WebSocket:**
- Use binary frames when possible
- Implement message batching
- Handle reconnection efficiently

### Rendering Optimization

**Lazy Loading:**
- Load components on-demand
- Defer non-critical resources
- Use Intersection Observer for visibility

**Image Optimization:**
- Use appropriate formats (WebP, AVIF)
- Lazy load images
- Provide responsive images

## Performance Monitoring

### Lighthouse Audit

```bash
npx lighthouse http://localhost:4200 --view
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### Web Vitals

Monitor Core Web Vitals:

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Chrome DevTools

1. **Performance Tab:**
   - Record performance profiles
   - Identify bottlenecks
   - Analyze frame rates

2. **Memory Tab:**
   - Check for memory leaks
   - Monitor heap usage
   - Analyze snapshots

3. **Network Tab:**
   - Monitor request sizes
   - Check load times
   - Analyze waterfall

## Performance Checklist

### Build Time

- [ ] Bundle size < 500KB (gzipped)
- [ ] Tree shaking enabled
- [ ] Code splitting configured
- [ ] Minification enabled
- [ ] Source maps excluded from production

### Runtime

- [ ] Virtual scrolling for large lists
- [ ] Lazy loading for components
- [ ] Change detection optimized (OnPush)
- [ ] Observables properly unsubscribed
- [ ] Memory leaks checked

### Network

- [ ] API requests optimized
- [ ] WebSocket connections efficient
- [ ] Caching implemented where appropriate
- [ ] Compression enabled (gzip/brotli)

### Rendering

- [ ] FCP < 1.5s
- [ ] TTI < 3s
- [ ] No layout shifts
- [ ] Smooth animations (60fps)

## Measuring Performance

### Bundle Analysis

```bash
npm run build:lib
npx webpack-bundle-analyzer dist/insurance-chat-widget/main.js
```

### Runtime Metrics

```typescript
// Performance API
const perfData = performance.getEntriesByType('navigation');
console.log('TTFB:', perfData[0].responseStart - perfData[0].requestStart);
```

### Custom Metrics

```typescript
// Measure question load time
const start = performance.now();
questionService.fetchNextQuestion().subscribe(() => {
  const duration = performance.now() - start;
  console.log('Question load time:', duration);
});
```

## Performance Best Practices

1. **Minimize bundle size** - Only include what's needed
2. **Use virtual scrolling** - For large lists
3. **Lazy load** - Components and data
4. **Optimize images** - Use WebP, lazy load
5. **Debounce/throttle** - Frequent updates
6. **Cache** - Static assets and API responses
7. **Monitor** - Use performance monitoring tools
8. **Test** - Regularly audit performance

## Common Performance Issues

### Large Bundle Size
- **Cause:** Including entire libraries
- **Solution:** Use tree shaking, code splitting

### Slow API Responses
- **Cause:** Server latency, large payloads
- **Solution:** Optimize backend, compress payloads

### Memory Leaks
- **Cause:** Not unsubscribing from observables
- **Solution:** Always unsubscribe, use takeUntil pattern

### Slow Rendering
- **Cause:** Too many DOM updates
- **Solution:** Use virtual scrolling, OnPush change detection

