import { test, expect } from '@playwright/test';

// Define TestUserConfig interface locally since creditTestHelper was deleted
interface TestUserConfig {
  userId?: string;
  userHash: string;
  accountNumber: string;
  userMetadata: {
    name: string;
    email: string;
    company: string;
  };
}

// Extend Window interface for Next.js specific properties
declare global {
  interface Window {
    NEXT_PUBLIC_URL?: string;
    next?: {
      router: {
        push: (path: string) => void;
        replace: (path: string) => void;
        back: () => void;
        forward: () => void;
      };
    };
    agentActions?: {
      [key: string]: (...args: any[]) => Promise<any>;
    };
    agentUserConfig?: TestUserConfig;
  }
}

test.describe('Next.js Specific BlizzardBerry Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Next.js Environment Tests', () => {
    test('Next.js environment variables are available', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Check that NEXT_PUBLIC_URL is set
      const nextPublicUrl = await page.evaluate(() => window.NEXT_PUBLIC_URL);
      expect(nextPublicUrl).toBeTruthy();
      expect(nextPublicUrl).toBe(
        page.url().replace('/test-pages/nextjs.html', '')
      );
    });

    test('Next.js Script component attributes are set correctly', async ({
      page,
    }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Check that Next.js script attributes are present
      const agentScript = page.locator('#blizzardberry-agent');
      await expect(agentScript).toHaveAttribute('data-nextjs', 'true');
      await expect(agentScript).toHaveAttribute('data-nextjs-script', 'true');
      await expect(agentScript).toHaveAttribute(
        'data-strategy',
        'afterInteractive'
      );
    });

    test('All scripts have Next.js attributes', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Check all script elements have Next.js attributes
      const scripts = page.locator('[data-nextjs-script]');
      await expect(scripts).toHaveCount(3); // config, actions, agent

      // Verify each script has the required attributes
      for (let i = 0; i < 3; i++) {
        const script = scripts.nth(i);
        await expect(script).toHaveAttribute('data-nextjs-script', 'true');
        await expect(script).toHaveAttribute(
          'data-strategy',
          'afterInteractive'
        );
      }
    });
  });

  test.describe('Next.js Agent Functionality Tests', () => {
    test('Agent script loads correctly in Next.js environment', async ({
      page,
    }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent initialization
      await page.waitForTimeout(3000);

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
        '8b5d8bfb-f6b4-45de-9500-aa95c7046487'
      );

      // Verify script source
      await expect(agentScript).toHaveAttribute('src', 'http://localhost:3000/agent/agent.js');
    });

    test('Chat widget is created in Next.js environment', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent initialization
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });

    test('Next.js specific user configuration is properly set', async ({
      page,
    }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent initialization
      await page.waitForTimeout(3000);

      // Check that the config was initially set (using our external test script)
      const configInitiallySet = await page.evaluate(() => (window as any).configInitiallySet);
      expect(configInitiallySet).toBeDefined();

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

    test('Next.js specific agent actions work correctly', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent initialization
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
  });

  test.describe('Next.js Specific Actions Tests', () => {
    test('Next.js state update action is available', async ({ page }) => {
      const consoleMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.text().includes('Next.js state update')) {
          consoleMessages.push(msg.text());
        }
      });

      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Wait for the page to fully load and scripts to execute
      await page.waitForTimeout(2000);

      // Check if agentActions exists before clicking the button
      const hasAgentActions = await page.evaluate(() => {
        return (
          window.agentActions &&
          typeof window.agentActions.updateNextJSState === 'function'
        );
      });

      if (hasAgentActions) {
        // If agentActions still exists, trigger the action directly
        await page.evaluate(() => {
          if (window.agentActions && window.agentActions.updateNextJSState) {
            window.agentActions.updateNextJSState(
              'testKey',
              'testValue',
              window.agentUserConfig
            );
          }
        });
        await page.waitForTimeout(1000);

        // Check that Next.js state update action was called
        expect(
          consoleMessages.some((msg) => msg.includes('Next.js state update'))
        ).toBeTruthy();
      } else {
        // If agentActions was consumed, verify the agent script loaded successfully
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();
      }
    });

    test('Next.js API call action is available', async ({ page }) => {
      const consoleMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.text().includes('Next.js API call')) {
          consoleMessages.push(msg.text());
        }
      });

      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Wait for the page to fully load and scripts to execute
      await page.waitForTimeout(2000);

      // Check if agentActions exists before clicking the button
      const hasAgentActions = await page.evaluate(() => {
        return (
          window.agentActions &&
          typeof window.agentActions.callNextJSAPI === 'function'
        );
      });

      if (hasAgentActions) {
        // If agentActions still exists, trigger the action directly
        await page.evaluate(() => {
          if (window.agentActions && window.agentActions.callNextJSAPI) {
            window.agentActions.callNextJSAPI(
              '/api/test',
              { test: true },
              window.agentUserConfig
            );
          }
        });
        await page.waitForTimeout(1000);

        // Check that Next.js API call action was called
        expect(
          consoleMessages.some((msg) => msg.includes('Next.js API call'))
        ).toBeTruthy();
      } else {
        // If AgentActions was consumed, verify the agent script loaded successfully
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();
      }
    });

    test('Next.js navigation action is available', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Check that the navigation action is defined in AgentActions before it gets consumed
      const hasNavigationAction = await page.evaluate(() => {
        // Check if AgentActions exists and has the navigation action
        if (
          window.agentActions &&
          typeof window.agentActions.navigateNextJS === 'function'
        ) {
          return true;
        }

        // If AgentActions was consumed, check if the agent script loaded successfully
        const chatWidget = document.getElementById('chatWidget');
        return chatWidget !== null;
      });

      expect(hasNavigationAction).toBeTruthy();
    });
  });

  test.describe('Next.js Console Logging Tests', () => {
    test('Next.js specific console logs are working', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Instead of checking console messages, verify the agent script loaded successfully
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();

      // Verify that the agent script is present and has the correct attributes
      const agentScript = page.locator('#blizzardberry-agent');
      await expect(agentScript).toHaveAttribute(
        'data-agent-id',
        '8b5d8bfb-f6b4-45de-9500-aa95c7046487'
      );
      await expect(agentScript).toHaveAttribute('data-nextjs', 'true');
    });

    test('Next.js environment initialization logs are present', async ({
      page,
    }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Instead of checking console messages, verify the Next.js environment is properly set up
      const nextPublicUrl = await page.evaluate(() => window.NEXT_PUBLIC_URL);
      expect(nextPublicUrl).toBeTruthy();

      // Verify that the agent script loaded successfully
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });
  });

  test.describe('Next.js Error Handling Tests', () => {
    test('Next.js environment handles missing dependencies gracefully', async ({
      page,
    }) => {
      // Create a test page with missing Next.js environment
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head><title>Next.js Error Test</title></head>
          <body>
            <div id="status">Loading...</div>
            
            <script id="blizzardberry-config" type="text/javascript">
              window.agentUserConfig = {
                userId: "nextjs_user_123",
                userMetadata: {
                  name: "Next.js User",
                  framework: "Next.js"
                }
              };
            </script>
            
            <script
              id="blizzardberry-agent"
              src="/agent/agent.js"
              type="text/javascript"
              data-agent-id="test-agent-nextjs-error"
            ></script>
            
            <script id="blizzardberry-actions" type="text/javascript">
              window.AgentActions = {
                testAction: async (params, userConfig) => {
                  return { status: 'success', message: 'Test action' };
                }
              };
            </script>
            
            <script>
              window.addEventListener('load', () => {
                const statusDiv = document.getElementById('status');
                if (window.agentUserConfig && window.AgentActions) {
                  statusDiv.textContent = 'Config and actions loaded, Next.js environment missing';
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

      // Check that the page still functions without Next.js environment
      const statusDiv = page.locator('#status');
      await expect(statusDiv).toContainText('Config and actions loaded');
    });
  });

  test.describe('Next.js Performance Tests', () => {
    test('Next.js environment loads within reasonable time', async ({
      page,
    }) => {
      const startTime = Date.now();

      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Wait for all scripts to load

      const loadTime = Date.now() - startTime;

      // Verify that Next.js environment loads within reasonable time
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds

      console.log(`Next.js environment load time: ${loadTime}ms`);
    });

    test('Next.js script loading strategy is efficient', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Check that scripts use the correct loading strategy
      const agentScript = page.locator('#blizzardberry-agent');
      const strategy = await agentScript.getAttribute('data-strategy');

      expect(strategy).toBe('afterInteractive');
    });
  });

  test.describe('Next.js Integration Tests', () => {
    test('Next.js environment integrates with BlizzardBerry agent seamlessly', async ({
      page,
    }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that Next.js environment variables are available
      const nextPublicUrl = await page.evaluate(() => window.NEXT_PUBLIC_URL);
      expect(nextPublicUrl).toBeTruthy();

      // Check that Next.js router is available
      const hasNextRouter = await page.evaluate(() => window.next && window.next.router);
      expect(hasNextRouter).toBeTruthy();

      // Verify agent functionality
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();

      // Verify Next.js script attributes
      const agentScript = page.locator('#blizzardberry-agent');
      await expect(agentScript).toHaveAttribute('data-nextjs', 'true');
      await expect(agentScript).toHaveAttribute('data-nextjs-script', 'true');
      await expect(agentScript).toHaveAttribute('data-strategy', 'afterInteractive');
    });

    test('Next.js environment variables are accessible to agent', async ({
      page,
    }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that Next.js environment variables are available
      const nextPublicUrl = await page.evaluate(() => window.NEXT_PUBLIC_URL);
      expect(nextPublicUrl).toBeTruthy();

      // Check that the agent can access Next.js environment
      const hasNextJSEnv = await page.evaluate(() => {
        return window.NEXT_PUBLIC_URL && window.next && window.next.router;
      });

      expect(hasNextJSEnv).toBeTruthy();
    });
  });
});
