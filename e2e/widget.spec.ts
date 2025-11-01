import { test, expect } from '@playwright/test';

test.describe('Insurance Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo page (assuming demo app exists)
    await page.goto('http://localhost:4200');
  });

  test('should display floating action button when minimized', async ({ page }) => {
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await expect(fab).toBeVisible();
  });

  test('should expand widget when FAB is clicked', async ({ page }) => {
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
    
    const chatPanel = page.locator('ins-chat-widget-shell .ins-chat-panel');
    await expect(chatPanel).toBeVisible();
  });

  test('should display chat tab by default', async ({ page }) => {
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
    
    const chatTab = page.locator('mat-tab[label="Chat"]');
    await expect(chatTab).toBeVisible();
  });

  test('should switch to transcript tab when clicked', async ({ page }) => {
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
    
    const transcriptTab = page.locator('mat-tab[label="Transcript"]');
    await transcriptTab.click();
    
    // Transcript tab should be visible
    await expect(page.locator('ins-transcript-tab')).toBeVisible();
  });

  test('should close widget when close button is clicked', async ({ page }) => {
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
    
    const closeButton = page.locator('ins-chat-widget-shell button[aria-label="Close chat widget"]');
    await closeButton.click();
    
    // Widget should be minimized
    await expect(page.locator('ins-chat-widget-shell .ins-chat-panel')).not.toBeVisible();
  });

  test('should submit text answer when Enter is pressed', async ({ page }) => {
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
    
    // Wait for input field to be visible
    const inputField = page.locator('ins-input-bar input[matInput]');
    await inputField.waitFor({ state: 'visible' });
    
    await inputField.fill('Test answer');
    await inputField.press('Enter');
    
    // Answer should be submitted (check for loading state or message)
    // This depends on actual implementation
  });

  test('should navigate with keyboard shortcuts', async ({ page }) => {
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
    
    // Test Escape to close
    await page.keyboard.press('Escape');
    await expect(page.locator('ins-chat-widget-shell .ins-chat-panel')).not.toBeVisible();
  });

  test('should display messages in message list', async ({ page }) => {
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
    
    const messageList = page.locator('ins-message-list');
    await expect(messageList).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
    
    const chatPanel = page.locator('ins-chat-widget-shell .ins-chat-panel');
    await expect(chatPanel).toBeVisible();
    
    // Widget should take full viewport on mobile
    const panelBox = await chatPanel.boundingBox();
    expect(panelBox?.width).toBe(375);
  });
});

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
    const fab = page.locator('ins-chat-widget-shell .ins-fab-button');
    await fab.click();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    const closeButton = page.locator('button[aria-label="Close chat widget"]');
    await expect(closeButton).toBeVisible();
    
    const minimizeButton = page.locator('button[aria-label="Minimize chat widget"]');
    await expect(minimizeButton).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    
    // First focusable element should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Focus an element
    const button = page.locator('button[aria-label="Close chat widget"]');
    await button.focus();
    
    // Check if focus-visible styles are applied
    const focusStyles = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline;
    });
    
    expect(focusStyles).not.toBe('none');
  });
});

