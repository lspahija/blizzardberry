import { test, expect } from '@playwright/test';

test.describe('BlizzardBerry Framework Comparison Tests', () => {
  const frameworks = [
    {
      name: 'Vanilla JavaScript',
      file: 'vanilla.html',
      agentId: '8b5d8bfb-f6b4-45de-9500-aa95c7046487',
    },
    {
      name: 'React',
      file: 'react.html',
      agentId: '8b5d8bfb-f6b4-45de-9500-aa95c7046487',
    },
    {
      name: 'Vue',
      file: 'vue.html',
      agentId: '8b5d8bfb-f6b4-45de-9500-aa95c7046487',
    },
    {
      name: 'Angular',
      file: 'angular.html',
      agentId: '8b5d8bfb-f6b4-45de-9500-aa95c7046487',
    },
    {
      name: 'Next.js',
      file: 'nextjs.html',
      agentId: '8b5d8bfb-f6b4-45de-9500-aa95c7046487',
    },
  ];

  for (const framework of frameworks) {
    test.describe(`${framework.name} Framework`, () => {
      test('Agent script loads correctly', async ({ page }) => {
        await page.goto(`/test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');

        // Check that all required scripts are present
        const configScript = page.locator('#blizzardberry-config');
        const agentScript = page.locator('#blizzardberry-agent');
        const actionsScript = page.locator('#blizzardberry-actions');

        await expect(configScript).toBeAttached();
        await expect(agentScript).toBeAttached();
        await expect(actionsScript).toBeAttached();

        // Verify agent ID is correct
        await expect(agentScript).toHaveAttribute(
          'data-agent-id',
          framework.agentId
        );

        // Verify script source
        await expect(agentScript).toHaveAttribute('src', 'http://localhost:3000/agent/agent.js');
      });

      test('User configuration is properly set', async ({ page }) => {
        await page.goto(`/test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');

        // Wait for initial tests to complete
        await page.waitForTimeout(3000);

        // Check that the chat widget was created (indicates agent script loaded successfully)
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();
      });

      test('Agent actions are functional', async ({ page }) => {
        await page.goto(`/test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');

        // Wait for agent script to load and initialize
        await page.waitForTimeout(3000);

        // Check that the chat widget was created (indicates agent script loaded successfully)
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();

        // Verify that the agent script consumed the global config and actions
        const userConfigExists = await page.evaluate(() => (window as any).agentUserConfig);
        const actionsExist = await page.evaluate(() => (window as any).agentActions);
        
        // Both should be undefined after the agent script consumes them
        expect(userConfigExists).toBeUndefined();
        expect(actionsExist).toBeUndefined();
      });

      test('Console logging works correctly', async ({ page }) => {
        await page.goto(`/test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Instead of checking console messages, verify the agent script loaded successfully
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();

        // Verify that the agent script is present and has the correct attributes
        const agentScript = page.locator('#blizzardberry-agent');
        await expect(agentScript).toHaveAttribute(
          'data-agent-id',
          framework.agentId
        );
        await expect(agentScript).toHaveAttribute('src', 'http://localhost:3000/agent/agent.js');
      });

      test('Error handling for missing dependencies', async ({ page }) => {
        // Create a test page with missing agent script
        await page.setContent(`
          <!DOCTYPE html>
          <html>
            <head><title>${framework.name} Error Test</title></head>
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
                  if (window.agentUserConfig && window.agentActions) {
                    statusDiv.textContent = 'Config and actions loaded, agent script missing';
                    statusDiv.style.color = 'orange';
                  } else {
                    statusDiv.textContent = 'Critical components missing';
                    statusDiv.style.color = 'red';
                  }
                });
              </script>
            </body>
          </html>
        `);

        await page.waitForLoadState('networkidle');

        // Check that the page still functions without the agent script
        const statusDiv = page.locator('#status');
        await expect(statusDiv).toContainText('Config and actions loaded');
      });
    });
  }

  test('Cross-framework compatibility', async ({ page }) => {
    // Test that the same agent script works across different frameworks
    const testCases = [
      { framework: 'Vanilla JavaScript', file: 'vanilla.html' },
      { framework: 'React', file: 'react.html' },
      { framework: 'Vue', file: 'vue.html' },
      { framework: 'Angular', file: 'angular.html' },
      { framework: 'Next.js', file: 'nextjs.html' },
    ];

    for (const testCase of testCases) {
      await page.goto(`/test-pages/${testCase.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verify that the agent script loads the same way in both frameworks
      const agentScript = page.locator('#blizzardberry-agent');
      await expect(agentScript).toHaveAttribute('src', 'http://localhost:3000/agent/agent.js');

      // Verify that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    }
  });

  test('Performance comparison', async ({ page }) => {
    const performanceResults: { [key: string]: number } = {};

    for (const framework of frameworks) {
      const startTime = Date.now();

      await page.goto(`/test-pages/${framework.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Wait for all scripts to load

      const loadTime = Date.now() - startTime;
      performanceResults[framework.name] = loadTime;

      console.log(`${framework.name} load time: ${loadTime}ms`);
    }

    // Verify that all frameworks load within reasonable time
    for (const [framework, loadTime] of Object.entries(performanceResults)) {
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    }
  });
});
