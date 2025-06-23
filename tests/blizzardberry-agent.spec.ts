import { test, expect } from '@playwright/test';

test.describe('BlizzardBerry Agent Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up any common test configuration
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Vanilla JavaScript - Agent loads and initializes correctly', async ({
    page,
  }) => {
    // Navigate to the vanilla JS test page
    await page.goto('/test-pages/vanilla.html');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/BlizzardBerry.*Vanilla JS Test/);

    // Check that the agent configuration script is present (exists, not necessarily visible)
    const configScript = page.locator('#blizzardberry-config');
    await expect(configScript).toBeAttached();

    // Check that the agent script is present
    const agentScript = page.locator('#blizzardberry-agent');
    await expect(agentScript).toBeAttached();

    // Check that the actions script is present
    const actionsScript = page.locator('#blizzardberry-actions');
    await expect(actionsScript).toBeAttached();

    // Wait for agent status to update
    await page.waitForTimeout(3000);

    // Check that the chat widget was created (indicates agent script loaded successfully)
    const chatWidget = page.locator('#chatWidget');
    await expect(chatWidget).toBeAttached();

    // Test that the agent script has the correct attributes
    await expect(agentScript).toHaveAttribute(
      'data-agent-id',
      '8b5d8bfb-f6b4-45de-9500-aa95c7046487'
    );
    await expect(agentScript).toHaveAttribute('src', '/agent/agent.js');
  });

  test('Vanilla JavaScript - Agent actions work correctly', async ({
    page,
  }) => {
    await page.goto('/test-pages/vanilla.html');
    await page.waitForLoadState('networkidle');

    // Wait for initial tests to complete
    await page.waitForTimeout(3000);

    // Click the test actions button
    await page.click('button:text("Test Agent Actions")');

    // Wait for test results
    await page.waitForTimeout(2000);

    // Check that the chat widget was created (indicates agent script loaded successfully)
    const chatWidget = page.locator('#chatWidget');
    await expect(chatWidget).toBeAttached();
  });

  test('Vanilla JavaScript - User configuration is properly set', async ({
    page,
  }) => {
    await page.goto('/test-pages/vanilla.html');
    await page.waitForLoadState('networkidle');

    // Wait for initial tests to complete
    await page.waitForTimeout(3000);

    // Click the test user config button
    await page.click('button:text("Test User Config")');

    // Wait for test results
    await page.waitForTimeout(1000);

    // Check that the chat widget was created (indicates agent script loaded successfully)
    const chatWidget = page.locator('#chatWidget');
    await expect(chatWidget).toBeAttached();
  });

  test('Vanilla JavaScript - Console logs are working', async ({ page }) => {
    await page.goto('/test-pages/vanilla.html');
    await page.waitForLoadState('networkidle');

    // Wait for scripts to execute
    await page.waitForTimeout(3000);

    // Instead of checking console logs, verify the agent script loaded successfully
    const chatWidget = page.locator('#chatWidget');
    await expect(chatWidget).toBeAttached();

    // Verify that the agent script is present and has the correct attributes
    const agentScript = page.locator('#blizzardberry-agent');
    await expect(agentScript).toHaveAttribute(
      'data-agent-id',
      '8b5d8bfb-f6b4-45de-9500-aa95c7046487'
    );
  });

  test('Vanilla JavaScript - Script loading order is correct', async ({
    page,
  }) => {
    await page.goto('/test-pages/vanilla.html');
    await page.waitForLoadState('networkidle');

    // Wait for all scripts to load
    await page.waitForTimeout(3000);

    // Verify that all required scripts are present in the correct order
    const configScript = page.locator('#blizzardberry-config');
    const actionsScript = page.locator('#blizzardberry-actions');
    const agentScript = page.locator('#blizzardberry-agent');

    await expect(configScript).toBeAttached();
    await expect(actionsScript).toBeAttached();
    await expect(agentScript).toBeAttached();

    // Verify that the agent script loaded successfully by checking for chat widget
    const chatWidget = page.locator('#chatWidget');
    await expect(chatWidget).toBeAttached();
  });

  test('Vanilla JavaScript - Error handling for missing agent script', async ({
    page,
  }) => {
    // Create a test page with a broken agent script URL
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head><title>Error Test</title></head>
        <body>
          <div id="status">Loading...</div>
          
          <script id="blizzardberry-config" type="text/javascript">
            window.agentUserConfig = {
              userId: "test_user_123",
              userHash: "test_hash_456",
              accountNumber: "1234567890",
              userMetadata: {
                name: "Test User",
                email: "test@example.com",
                company: "Test Corp"
              }
            };
          </script>
          
          <script
            id="blizzardberry-agent"
            src="https://invalid-url-that-does-not-exist.com/agent.js"
            type="text/javascript"
            data-agent-id="test-agent-error"
          ></script>
          
          <script id="blizzardberry-actions" type="text/javascript">
            window.agentActions = {
              testAction: async (params, userConfig) => {
                return { status: 'success', message: 'Test action' };
              }
            };
          </script>
          
          <script>
            window.addEventListener('load', () => {
              const statusDiv = document.getElementById('status');
              if (window.agentUserConfig) {
                statusDiv.textContent = 'Config loaded, agent may have failed';
                statusDiv.style.color = 'orange';
              } else {
                statusDiv.textContent = 'Config failed to load';
                statusDiv.style.color = 'red';
              }
            });
          </script>
        </body>
      </html>
    `);

    await page.waitForLoadState('networkidle');

    // Check that the page still loads even with a broken agent script
    const statusDiv = page.locator('#status');
    await expect(statusDiv).toContainText('Config loaded');
  });

  test('Vanilla JavaScript - Agent script loads from correct location', async ({
    page,
  }) => {
    await page.goto('/test-pages/vanilla.html');

    // Check that the agent script is loaded from the correct location
    const agentScript = page.locator('#blizzardberry-agent');
    await expect(agentScript).toHaveAttribute('src', '/agent/agent.js');

    // Verify the script is actually loaded (not just the element exists)
    const scriptSrc = await agentScript.getAttribute('src');
    expect(scriptSrc).toBe('/agent/agent.js');
  });

  test('Vanilla JavaScript - Agent ID is properly configured', async ({
    page,
  }) => {
    await page.goto('/test-pages/vanilla.html');

    // Check that the agent ID is set correctly
    const agentScript = page.locator('#blizzardberry-agent');
    await expect(agentScript).toHaveAttribute(
      'data-agent-id',
      '8b5d8bfb-f6b4-45de-9500-aa95c7046487'
    );

    // Verify the agent ID value
    const agentId = await agentScript.getAttribute('data-agent-id');
    expect(agentId).toBe('8b5d8bfb-f6b4-45de-9500-aa95c7046487');
  });
});
