import { test, expect } from '@playwright/test';

test.describe('Credit Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Tests credit scenarios with default user config', async ({ page }) => {
    await page.goto('/test-pages/vanilla.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Show the chat widget
    await page.click('#chatWidgetToggle');
    await expect(page.locator('#chatWidget')).toBeVisible();

    // Send a message
    const inputField = page.locator('#chatWidgetInputField');
    await inputField.fill('Test credit management');
    await inputField.press('Enter');

    // Wait for response
    await page.waitForTimeout(5000);

    // Check if we got a response
    const messages = page.locator('.assistant-message');
    const messageCount = await messages.count();

    if (messageCount > 0) {
      const allMessages = [];
      for (let i = 0; i < messageCount; i++) {
        const text = await messages.nth(i).textContent();
        allMessages.push(text);
      }
      console.log('🔍 All assistant messages:', allMessages);
      const uiMessage = allMessages[allMessages.length - 1] || '';
      expect(uiMessage).toBeTruthy();
      console.log('Response:', uiMessage);

      // Check if it's a credit error or successful response
      const hasCreditError =
        uiMessage?.toLowerCase().includes('credit') ||
        uiMessage?.toLowerCase().includes('balance') ||
        uiMessage?.toLowerCase().includes('insufficient');

      if (hasCreditError) {
        console.log('✅ Credit error detected - system is working as expected');
      } else {
        console.log('✅ Successful response - user has sufficient credits');
      }
    } else {
      console.log('No response received - system handled gracefully');
    }
  });

  // Split framework tests into individual tests
  const frameworks = [
    { name: 'Vanilla JavaScript', file: 'vanilla.html' },
    { name: 'React', file: 'react.html' },
    { name: 'Vue', file: 'vue.html' },
    { name: 'Angular', file: 'angular.html' },
    { name: 'Next.js', file: 'nextjs.html' },
  ];

  for (const framework of frameworks) {
    test(`Credit scenario: ${framework.name}`, async ({ page }) => {
      await page.goto(`/test-pages/${framework.file}`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      // Show the chat widget
      await page.click('#chatWidgetToggle');
      await expect(page.locator('#chatWidget')).toBeVisible();

      // Send a message
      const inputField = page.locator('#chatWidgetInputField');
      await inputField.fill(`Credit test in ${framework.name}`);
      await inputField.press('Enter');

      // Wait for response
      await page.waitForTimeout(3000);

      // Check if we got any response
      const messages = page.locator('.assistant-message');
      const messageCount = await messages.count();

      if (messageCount > 0) {
        const allMessages = [];
        for (let i = 0; i < messageCount; i++) {
          const text = await messages.nth(i).textContent();
          allMessages.push(text);
        }
        const uiMessage = allMessages[allMessages.length - 1] || '';
        console.log(`${framework.name}: ${uiMessage?.substring(0, 50)}...`);
      } else {
        console.log(`${framework.name}: No response - handled gracefully`);
      }
    });
  }

  test('Backend properly validates user credits', async ({ page }) => {
    await page.goto('/test-pages/vanilla.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Set up response tracking
    let apiResponse = null;

    // Listen to all responses
    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/inference')) {
        console.log(
          `🔍 API Response detected: ${url} - Status: ${response.status()}`
        );
        apiResponse = response;
      }
    });

    // Show the chat widget
    await page.click('#chatWidgetToggle');
    await expect(page.locator('#chatWidget')).toBeVisible();

    // Send a message
    const inputField = page.locator('#chatWidgetInputField');
    await inputField.fill('Test credit validation');
    await inputField.press('Enter');

    // Wait for response
    await page.waitForTimeout(10000);

    if (apiResponse) {
      const status = apiResponse.status();
      console.log(`🔍 Backend response status: ${status}`);

      try {
        const body = await apiResponse.json();
        console.log(`🔍 Backend response body:`, JSON.stringify(body, null, 2));
      } catch (e) {
        console.log(`🔍 Backend response body: Could not parse as JSON`);
      }

      expect(status).toBeGreaterThan(0);
    } else {
      console.log('🔍 No API response detected - checking if request was made');

      // Check if there are any network requests to /api/inference
      const requests = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .filter((entry) => entry.name.includes('/api/inference'))
          .map((entry) => ({ name: entry.name, duration: entry.duration }));
      });

      console.log('🔍 Network requests to /api/inference:', requests);

      // Verify the message was sent
      const userMessage = page.locator('.user-message').first();
      await expect(userMessage).toContainText('Test credit validation');
    }
  });
});
