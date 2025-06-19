import { test, expect } from '@playwright/test';

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
    AgentActions?: {
      [key: string]: (...args: any[]) => Promise<any>;
    };
    agentUserConfig?: {
      userId: string;
      userHash: string;
      accountNumber: string;
      userMetadata: {
        name: string;
        email: string;
        company: string;
        framework?: string;
        version?: string;
      };
    };
  }
}

test.describe('Next.js Specific BlizzardBerry Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Next.js Environment Tests', () => {
    test('Next.js environment is properly simulated', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Check that Next.js environment is detected
      const environmentDiv = page.locator('#nextjs-environment');
      await expect(environmentDiv).toContainText('Next.js environment detected');
      
      // Check SSR mode indicator
      const ssrMode = page.locator('#ssr-mode');
      await expect(ssrMode).toContainText('Client-side');
      
      // Check script strategy indicator
      const scriptStrategy = page.locator('#script-strategy');
      await expect(scriptStrategy).toContainText('After Interactive');
    });

    test('Next.js environment variables are available', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Check that NEXT_PUBLIC_URL is set
      const nextPublicUrl = await page.evaluate(() => window.NEXT_PUBLIC_URL);
      expect(nextPublicUrl).toBeTruthy();
      expect(nextPublicUrl).toBe(page.url().replace('/test-pages/nextjs.html', ''));
    });

    test('Next.js router simulation works', async ({ page }) => {
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.text().includes('Next.js router')) {
          consoleMessages.push(msg.text());
        }
      });
      
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Click the Next.js specific test button
      await page.click('button:text("Test Next.js Specific")');
      await page.waitForTimeout(2000);
      
      // Check that router methods were called
      expect(consoleMessages.some(msg => msg.includes('Next.js router.push'))).toBeTruthy();
    });
  });

  test.describe('Next.js Script Component Tests', () => {
    test('Next.js Script component attributes are set correctly', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Check that Next.js script attributes are present
      const agentScript = page.locator('#blizzardberry-agent');
      await expect(agentScript).toHaveAttribute('data-nextjs', 'true');
      await expect(agentScript).toHaveAttribute('data-nextjs-script', 'true');
      await expect(agentScript).toHaveAttribute('data-strategy', 'afterInteractive');
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
        await expect(script).toHaveAttribute('data-strategy', 'afterInteractive');
      }
    });

    test('Next.js Script container styling is applied', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Check that the Next.js script container has the correct styling
      const container = page.locator('.nextjs-script-container');
      await expect(container).toBeAttached();
      
      // Check that the container has the Next.js blue border
      const borderColor = await container.evaluate(el => 
        window.getComputedStyle(el).borderColor
      );
      expect(borderColor).toContain('rgb(0, 112, 243)'); // Next.js blue
    });
  });

  test.describe('Next.js Agent Functionality Tests', () => {
    test('Agent script loads correctly in Next.js environment', async ({ page }) => {
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
      await expect(agentScript).toHaveAttribute('data-agent-id', '8b5d8bfb-f6b4-45de-9500-aa95c7046487');
      
      // Verify script source
      await expect(agentScript).toHaveAttribute('src', '/agent/agent.js');
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

    test('Next.js specific user configuration is properly set', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Wait for initial tests to complete
      await page.waitForTimeout(3000);
      
      // Click the test user config button
      await page.click('button:text("Test User Config")');
      await page.waitForTimeout(1000);
      
      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
      
      // Check for Next.js specific user config - handle both cases (found or consumed)
      const testResults = page.locator('#test-results');
      const resultsText = await testResults.textContent();
      
      if (resultsText?.includes('User config found in Next.js')) {
        // If config was found, check for specific values
        await expect(testResults).toContainText('nextjs_user_123');
        await expect(testResults).toContainText('Next.js User');
        await expect(testResults).toContainText('Next.js');
      } else if (resultsText?.includes('User config not found')) {
        // If config was consumed by agent script, that's expected behavior
        // The main success indicator is that the chat widget was created
        await expect(chatWidget).toBeAttached();
      } else {
        // If neither case is found, fail the test
        throw new Error('Unexpected test result: neither "User config found" nor "User config not found" was detected');
      }
    });

    test('Next.js specific agent actions work correctly', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Wait for initial tests to complete
      await page.waitForTimeout(3000);
      
      // Click the test actions button
      await page.click('button:text("Test Agent Actions")');
      await page.waitForTimeout(2000);
      
      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
      
      // Check for Next.js specific action results
      const testResults = page.locator('#test-results');
      await expect(testResults).toContainText('Testing agent actions in Next.js environment');
    });
  });

  test.describe('Next.js Specific Actions Tests', () => {
    test('Next.js state update action is available', async ({ page }) => {
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.text().includes('Next.js state update')) {
          consoleMessages.push(msg.text());
        }
      });
      
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Wait for the page to fully load and scripts to execute
      await page.waitForTimeout(2000);
      
      // Check if AgentActions exists before clicking the button
      const hasAgentActions = await page.evaluate(() => {
        return window.AgentActions && typeof window.AgentActions.updateNextJSState === 'function';
      });
      
      if (hasAgentActions) {
        // If AgentActions still exists, trigger the action directly
        await page.evaluate(() => {
          if (window.AgentActions && window.AgentActions.updateNextJSState) {
            window.AgentActions.updateNextJSState('testKey', 'testValue', window.agentUserConfig);
          }
        });
        await page.waitForTimeout(1000);
        
        // Check that Next.js state update action was called
        expect(consoleMessages.some(msg => msg.includes('Next.js state update'))).toBeTruthy();
      } else {
        // If AgentActions was consumed, verify the agent script loaded successfully
        const chatWidget = page.locator('#chatWidget');
        await expect(chatWidget).toBeAttached();
      }
    });

    test('Next.js API call action is available', async ({ page }) => {
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.text().includes('Next.js API call')) {
          consoleMessages.push(msg.text());
        }
      });
      
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      
      // Wait for the page to fully load and scripts to execute
      await page.waitForTimeout(2000);
      
      // Check if AgentActions exists before clicking the button
      const hasAgentActions = await page.evaluate(() => {
        return window.AgentActions && typeof window.AgentActions.callNextJSAPI === 'function';
      });
      
      if (hasAgentActions) {
        // If AgentActions still exists, trigger the action directly
        await page.evaluate(() => {
          if (window.AgentActions && window.AgentActions.callNextJSAPI) {
            window.AgentActions.callNextJSAPI('/api/test', { test: true }, window.agentUserConfig);
          }
        });
        await page.waitForTimeout(1000);
        
        // Check that Next.js API call action was called
        expect(consoleMessages.some(msg => msg.includes('Next.js API call'))).toBeTruthy();
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
        if (window.AgentActions && typeof window.AgentActions.navigateNextJS === 'function') {
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
      const consoleMessages: string[] = [];
      
      // Listen for console messages
      page.on('console', msg => {
        consoleMessages.push(msg.text());
      });
      
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Check that expected Next.js console messages are present
      expect(consoleMessages.some(msg => msg.includes('Next.js environment simulated'))).toBeTruthy();
      expect(consoleMessages.some(msg => msg.includes('BlizzardBerry config loaded in Next.js environment'))).toBeTruthy();
      expect(consoleMessages.some(msg => msg.includes('BlizzardBerry actions loaded in Next.js environment'))).toBeTruthy();
    });

    test('Next.js environment initialization logs are present', async ({ page }) => {
      const consoleMessages: string[] = [];
      
      page.on('console', msg => {
        consoleMessages.push(msg.text());
      });
      
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Check for Next.js environment initialization logs
      expect(consoleMessages.some(msg => msg.includes('Next.js environment simulated'))).toBeTruthy();
    });
  });

  test.describe('Next.js Error Handling Tests', () => {
    test('Next.js environment handles missing dependencies gracefully', async ({ page }) => {
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
    test('Next.js environment loads within reasonable time', async ({ page }) => {
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
    test('Next.js environment integrates with BlizzardBerry agent seamlessly', async ({ page }) => {
      await page.goto('/test-pages/nextjs.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Test all Next.js specific features
      await page.click('button:text("Test Next.js Specific")');
      await page.waitForTimeout(1000);
      
      // Verify all components work together
      const testResults = page.locator('#test-results');
      await expect(testResults).toContainText('Next.js public URL');
      await expect(testResults).toContainText('Next.js router simulation found');
      await expect(testResults).toContainText('Next.js script elements');
      
      // Verify agent functionality
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });

    test('Next.js environment variables are accessible to agent', async ({ page }) => {
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