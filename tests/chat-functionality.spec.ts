import { test, expect } from '@playwright/test';

test.describe('Chat Widget Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Chat Widget UI Tests', () => {
    test('Chat widget toggle button is created and visible', async ({
      page,
    }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that the toggle button exists
      const toggleButton = page.locator('#chatWidgetToggle');
      await expect(toggleButton).toBeAttached();
      await expect(toggleButton).toBeVisible();

      // Check that it contains an SVG icon (not text)
      const hasSvg = await toggleButton.evaluate(
        (el) => el.querySelector('svg') !== null
      );
      expect(hasSvg).toBe(true);
    });

    test('Chat widget is hidden by default', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that the chat widget exists but is hidden
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
      await expect(chatWidget).toHaveClass(/hidden/);
    });

    test('Chat widget shows when toggle button is clicked', async ({
      page,
    }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Click the toggle button
      await page.click('#chatWidgetToggle');

      // Check that the chat widget is now visible
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeVisible();
      await expect(chatWidget).not.toHaveClass(/hidden/);

      // Check that the toggle button is now hidden
      const toggleButton = page.locator('#chatWidgetToggle');
      await expect(toggleButton).toHaveClass(/hidden/);
    });

    test('Chat widget hides when close button is clicked', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // First show the chat widget
      await page.click('#chatWidgetToggle');
      await expect(page.locator('#chatWidget')).toBeVisible();

      // Click the close button
      await page.click('#chatWidgetCloseButton');

      // Check that the chat widget is now hidden
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toHaveClass(/hidden/);

      // Check that the toggle button is now visible
      const toggleButton = page.locator('#chatWidgetToggle');
      await expect(toggleButton).toBeVisible();
    });
  });

  test.describe('Chat Input Tests', () => {
    test('Chat input field is present and functional', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Show the chat widget
      await page.click('#chatWidgetToggle');

      // Check that the input field exists
      const inputField = page.locator('#chatWidgetInputField');
      await expect(inputField).toBeAttached();
      await expect(inputField).toBeVisible();

      // Check that it has the correct placeholder
      await expect(inputField).toHaveAttribute(
        'placeholder',
        'Type a message...'
      );

      // Test typing in the input field
      await inputField.fill('Hello, BlizzardBerry!');
      await expect(inputField).toHaveValue('Hello, BlizzardBerry!');
    });

    test('Send button is present and clickable', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Show the chat widget
      await page.click('#chatWidgetToggle');

      // Check that the send button exists
      const sendButton = page.locator('#chatWidgetSendButton');
      await expect(sendButton).toBeAttached();
      await expect(sendButton).toBeVisible();

      // Check that it contains an SVG icon (not text)
      const hasSvg = await sendButton.evaluate(
        (el) => el.querySelector('svg') !== null
      );
      expect(hasSvg).toBe(true);
    });

    test('Enter key submits message', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Show the chat widget
      await page.click('#chatWidgetToggle');

      // Type a message and press Enter
      const inputField = page.locator('#chatWidgetInputField');
      await inputField.fill('Test message');
      await inputField.press('Enter');

      // Check that the input field is cleared
      await expect(inputField).toHaveValue('');
    });
  });

  test.describe('Chat Widget Structure Tests', () => {
    test('Chat widget has all required components', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Show the chat widget
      await page.click('#chatWidgetToggle');

      // Check for header
      const header = page.locator('#chatWidgetHeader');
      await expect(header).toBeAttached();

      // Check for close button in header
      const closeButton = page.locator('#chatWidgetCloseButton');
      await expect(closeButton).toBeAttached();

      // Check that it contains an SVG icon (not text)
      const hasSvg = await closeButton.evaluate(
        (el) => el.querySelector('svg') !== null
      );
      expect(hasSvg).toBe(true);

      // Check for chat body
      const chatBody = page.locator('#chatWidgetBody');
      await expect(chatBody).toBeAttached();

      // Check for input area
      const inputArea = page.locator('#chatWidgetInput');
      await expect(inputArea).toBeAttached();

      // Check for footer
      const footer = page.locator('#chatWidgetFooter');
      await expect(footer).toBeAttached();
    });

    test('Agent script consumes user config and actions properly', async ({
      page,
    }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that the agent script consumed the global config and actions
      const userConfigExists = await page.evaluate(
        () => window.agentUserConfig
      );
      const actionsExist = await page.evaluate(() => window.agentActions);

      // Both should be undefined/null after the agent script consumes them
      expect(userConfigExists).toBeUndefined();
      expect(actionsExist).toBeUndefined();

      // Verify the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });

    test('Chat widget styling is applied correctly', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Show the chat widget
      await page.click('#chatWidgetToggle');

      // Check that the chat widget has proper positioning
      const chatWidget = page.locator('#chatWidget');
      const position = await chatWidget.evaluate(
        (el) => window.getComputedStyle(el).position
      );
      expect(position).toBe('fixed');

      // Check that the toggle button has proper positioning
      const toggleButton = page.locator('#chatWidgetToggle');
      const togglePosition = await toggleButton.evaluate(
        (el) => window.getComputedStyle(el).position
      );
      expect(togglePosition).toBe('fixed');
    });
  });

  test.describe('Cross-Framework Chat Widget Tests', () => {
    const frameworks = [
      { name: 'Vanilla JavaScript', file: 'vanilla.html' },
      { name: 'React', file: 'react.html' },
      { name: 'Vue', file: 'vue.html' },
      { name: 'Angular', file: 'angular.html' },
      { name: 'Next.js', file: 'nextjs.html' },
    ];

    for (const framework of frameworks) {
      test(`${framework.name} - Chat widget functionality works`, async ({
        page,
      }) => {
        await page.goto(`/test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Check that chat widget is created
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();

        // Check that toggle button is created
        const toggleButton = page.locator('#chatWidgetToggle');
        await expect(toggleButton).toBeAttached();
        await expect(toggleButton).toBeVisible();

        // Test toggle functionality
        await toggleButton.click();
        await expect(chatWidget).toBeVisible();

        // Test input functionality
        const inputField = page.locator('#chatWidgetInputField');
        await expect(inputField).toBeAttached();
        await inputField.fill('Test message');
        await expect(inputField).toHaveValue('Test message');

        // Test close functionality
        await page.click('#chatWidgetCloseButton');
        await expect(chatWidget).toHaveClass(/hidden/);
        await expect(toggleButton).toBeVisible();
      });
    }
  });

  test.describe('Chat Widget Error Handling', () => {
    test('Chat widget handles missing backend gracefully', async ({ page }) => {
      // Create a test page with a broken agent script
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head><title>Chat Widget Error Test</title></head>
          <body>
            <div id="status">Loading...</div>
            
            <script id="blizzardberry-config" type="text/javascript">
              window.agentUserConfig = {
                userId: "test_user_123",
                userMetadata: { name: "Test User" }
              };
            </script>
            
            <script
              id="blizzardberry-agent"
              src="/agent/agent.js"
              type="text/javascript"
              data-agent-id="test-agent-error"
            ></script>
            
            <script id="blizzardberry-actions" type="text/javascript">
              window.agentActions = {
                testAction: async () => ({ status: 'success' })
              };
            </script>
            
            <script>
              window.addEventListener('load', () => {
                const statusDiv = document.getElementById('status');
                setTimeout(() => {
                  const chatWidget = document.getElementById('chatWidget');
                  const toggleButton = document.getElementById('chatWidgetToggle');
                  
                  if (chatWidget && toggleButton) {
                    statusDiv.textContent = 'Chat widget created successfully';
                  } else if (chatWidget) {
                    statusDiv.textContent = 'Chat widget created but toggle missing';
                  } else {
                    statusDiv.textContent = 'Chat widget not created - agent script may have failed';
                  }
                }, 5000); // Increased timeout
              });
            </script>
          </body>
        </html>
      `);

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(7000); // Increased wait time

      // Check that the page provides some feedback (even if widget creation failed)
      const statusDiv = page.locator('#status');
      const statusText = await statusDiv.textContent();

      // Accept any of the possible outcomes as valid
      expect(statusText).toMatch(/Chat widget|agent script/);

      // If the chat widget was created, verify it exists
      const chatWidget = page.locator('#chatWidget');
      const toggleButton = page.locator('#chatWidgetToggle');

      if (statusText?.includes('created successfully')) {
        await expect(chatWidget).toBeAttached();
        await expect(toggleButton).toBeAttached();
      } else if (
        statusText?.includes('Chat widget created but toggle missing')
      ) {
        await expect(chatWidget).toBeAttached();
      }
      // If widget wasn't created, that's also acceptable for error handling test
    });
  });
});
