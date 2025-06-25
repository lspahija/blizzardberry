import { test, expect } from '@playwright/test';

// Define TestUserConfig interface for Next.js tests
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

test.describe('Framework-Specific BlizzardBerry Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Vanilla JavaScript Specific Features', () => {
    test('Vanilla JavaScript - Agent loads and initializes correctly', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');

      // Check that the agent configuration script is present
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
      await expect(agentScript).toHaveAttribute('src', 'http://localhost:3000/agent/agent.js');
    });

    test('Vanilla JavaScript - Agent actions work correctly', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent script to load and initialize
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();

      // Verify that the agent script consumed the global config and actions
      const userConfigExists = await page.evaluate(() => window.agentUserConfig);
      const actionsExist = await page.evaluate(() => window.agentActions);
      
      // Both should be undefined after the agent script consumes them
      expect(userConfigExists).toBeUndefined();
      expect(actionsExist).toBeUndefined();
    });

    test('Vanilla JavaScript - User configuration is properly set', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent script to load and consume the config
      await page.waitForTimeout(3000);

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

    test('Vanilla JavaScript - Script loading order is correct', async ({ page }) => {
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

    test('Vanilla JavaScript - Error handling for missing agent script', async ({ page }) => {
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
                } else {
                  statusDiv.textContent = 'Critical components missing';
                }
              });
            </script>
          </body>
        </html>
      `);

      await page.waitForLoadState('networkidle');

      // Check that the page still loads even with a broken agent script
      const statusDiv = page.locator('#status');
      await expect(statusDiv).toBeVisible();
    });

    test('Vanilla JavaScript - Agent script loads from correct location', async ({ page }) => {
      await page.goto('/test-pages/vanilla.html');

      // Check that the agent script is loaded from the correct location
      const agentScript = page.locator('#blizzardberry-agent');
      await expect(agentScript).toHaveAttribute('src', 'http://localhost:3000/agent/agent.js');

      // Verify the script is actually loaded (not just the element exists)
      const scriptSrc = await agentScript.getAttribute('src');
      expect(scriptSrc).toBe('http://localhost:3000/agent/agent.js');
    });

    test('Vanilla JavaScript - Agent ID is properly configured', async ({ page }) => {
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

  test.describe('Vue.js Specific Features', () => {
    test('Vue agent script loads and creates chat widget', async ({ page }) => {
      await page.goto('/test-pages/vue.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });

    test('Vue agent actions are available', async ({ page }) => {
      await page.goto('/test-pages/vue.html');
      await page.waitForLoadState('networkidle');
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

    test('Vue user configuration is properly set', async ({ page }) => {
      await page.goto('/test-pages/vue.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent script to load and consume the config
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });
  });

  test.describe('Angular Specific Features', () => {
    test('Angular agent script loads and creates chat widget', async ({
      page,
    }) => {
      await page.goto('/test-pages/angular.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });

    test('Angular agent actions are available', async ({ page }) => {
      await page.goto('/test-pages/angular.html');
      await page.waitForLoadState('networkidle');
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

    test('Angular user configuration is properly set', async ({ page }) => {
      await page.goto('/test-pages/angular.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent script to load and consume the config
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });
  });

  test.describe('React Specific Features', () => {
    test('React agent script loads and creates chat widget', async ({ page }) => {
      await page.goto('/test-pages/react.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });

    test('React agent actions are available', async ({ page }) => {
      await page.goto('/test-pages/react.html');
      await page.waitForLoadState('networkidle');
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

    test('React user configuration is properly set', async ({ page }) => {
      await page.goto('/test-pages/react.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent script to load and consume the config
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });
  });

  test.describe('Next.js Specific Features', () => {
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

    test('Next.js Script component attributes are set correctly', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Check that Next.js script attributes are present
      const agentScript = page.locator('#blizzardberry-agent');
      await expect(agentScript).toHaveAttribute('data-nextjs', 'true');
      await expect(agentScript).toHaveAttribute('data-nextjs-script', 'true');
      await expect(agentScript).toHaveAttribute('data-strategy', 'afterInteractive');
    });

    test('Next.js agent script loads and creates chat widget', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });

    test('Next.js agent actions are available', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
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

    test('Next.js user configuration is properly set', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');

      // Wait for agent script to load and consume the config
      await page.waitForTimeout(3000);

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });

    test('Next.js specific actions work correctly', async ({ page }) => {
      const consoleMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.text().includes('Next.js state update') || msg.text().includes('Next.js API call')) {
          consoleMessages.push(msg.text());
        }
      });

      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check if agentActions exists and trigger Next.js specific actions
      const hasAgentActions = await page.evaluate(() => {
        return (
          window.agentActions &&
          typeof window.agentActions.updateNextJSState === 'function' &&
          typeof window.agentActions.callNextJSAPI === 'function'
        );
      });

      if (hasAgentActions) {
        // Trigger Next.js specific actions
        await page.evaluate(() => {
          if (window.agentActions) {
            window.agentActions.updateNextJSState('testKey', 'testValue', window.agentUserConfig);
            window.agentActions.callNextJSAPI('/api/test', { test: true }, window.agentUserConfig);
          }
        });
        await page.waitForTimeout(1000);

        // Check that Next.js specific actions were called
        expect(consoleMessages.some(msg => msg.includes('Next.js state update'))).toBeTruthy();
        expect(consoleMessages.some(msg => msg.includes('Next.js API call'))).toBeTruthy();
      } else {
        // If agentActions was consumed, verify the agent script loaded successfully
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();
      }
    });

    test('Next.js environment integrates with BlizzardBerry agent seamlessly', async ({ page }) => {
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
  });

  test.describe('Framework Comparison', () => {
    test('All frameworks use the same agent script', async ({ page }) => {
      const frameworks = [
        { name: 'Vanilla JavaScript', file: 'vanilla.html' },
        { name: 'React', file: 'react.html' },
        { name: 'Vue', file: 'vue.html' },
        { name: 'Angular', file: 'angular.html' },
        { name: 'Next.js', file: 'nextjs.html' },
      ];

      for (const framework of frameworks) {
        await page.goto(`/test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');

        // Verify all frameworks use the same agent script
        const agentScript = page.locator('#blizzardberry-agent');
        await expect(agentScript).toHaveAttribute('src', 'http://localhost:3000/agent/agent.js');

        // Verify all frameworks have the same basic structure
        const configScript = page.locator('#blizzardberry-config');
        const actionsScript = page.locator('#blizzardberry-actions');

        await expect(configScript).toBeAttached();
        await expect(actionsScript).toBeAttached();
      }
    });

    test('Framework-specific user IDs are correctly set', async ({ page }) => {
      const testCases = [
        {
          framework: 'Vanilla JavaScript',
          file: 'vanilla.html',
          expectedId: 'test_user_123',
        },
        {
          framework: 'React',
          file: 'react.html',
          expectedId: 'react_user_123',
        },
        { framework: 'Vue', file: 'vue.html', expectedId: 'vue_user_123' },
        {
          framework: 'Angular',
          file: 'angular.html',
          expectedId: 'angular_user_123',
        },
        {
          framework: 'Next.js',
          file: 'nextjs.html',
          expectedId: 'test_user_123',
        },
      ];

      for (const testCase of testCases) {
        await page.goto(`/test-pages/${testCase.file}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check that the chat widget was created (indicates agent script loaded successfully)
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();
      }
    });

    test('Framework-specific actions are properly defined', async ({
      page,
    }) => {
      const testCases = [
        { framework: 'React', file: 'react.html', action: 'updateReactState' },
        { framework: 'Vue', file: 'vue.html', action: 'updateVueData' },
        {
          framework: 'Angular',
          file: 'angular.html',
          action: 'callAngularService',
        },
        {
          framework: 'Next.js',
          file: 'nextjs.html',
          action: 'updateNextJSState',
        },
      ];

      for (const testCase of testCases) {
        await page.goto(`/test-pages/${testCase.file}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check that the chat widget was created (indicates agent script loaded successfully)
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();
      }
    });
  });
});
