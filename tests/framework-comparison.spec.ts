import { test, expect } from '@playwright/test';

test.describe('BlizzardBerry Framework Comparison Tests', () => {
  const frameworks = [
    { name: 'Vanilla JavaScript', file: 'vanilla.html', agentId: 'test-agent-vanilla' },
    { name: 'React', file: 'react.html', agentId: 'test-agent-react' },
    { name: 'Vue', file: 'vue.html', agentId: 'test-agent-vue' },
    { name: 'Angular', file: 'angular.html', agentId: 'test-agent-angular' }
  ];

  for (const framework of frameworks) {
    test.describe(`${framework.name} Framework`, () => {
      test('Agent script loads correctly', async ({ page }) => {
        await page.goto(`/tests/framework-test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');
        
        // Check that all required scripts are present
        const configScript = page.locator('#blizzardberry-config');
        const agentScript = page.locator('#blizzardberry-agent');
        const actionsScript = page.locator('#blizzardberry-actions');
        
        await expect(configScript).toBeVisible();
        await expect(agentScript).toBeVisible();
        await expect(actionsScript).toBeVisible();
        
        // Verify agent ID is correct
        await expect(agentScript).toHaveAttribute('data-agent-id', framework.agentId);
        
        // Verify script source
        await expect(agentScript).toHaveAttribute('src', 'https://blizzardberry.com/agent/agent.js');
      });

      test('User configuration is properly set', async ({ page }) => {
        await page.goto(`/tests/framework-test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');
        
        // Wait for initial tests to complete
        await page.waitForTimeout(3000);
        
        // Check that user config is loaded
        const userConfigResult = page.locator('text=User config found');
        await expect(userConfigResult).toBeVisible();
        
        // Verify framework-specific user ID
        const expectedUserId = framework.name === 'React' ? 'react_user_123' : 
                              framework.name === 'Vue' ? 'vue_user_123' :
                              framework.name === 'Angular' ? 'angular_user_123' : 'test_user_123';
        const userIdResult = page.locator(`text=User ID: ${expectedUserId}`);
        await expect(userIdResult).toBeVisible();
      });

      test('Agent actions are functional', async ({ page }) => {
        await page.goto(`/tests/framework-test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');
        
        // Wait for initial tests to complete
        await page.waitForTimeout(3000);
        
        // Click test actions button
        await page.click('button:text("Test Agent Actions")');
        
        // Wait for test results
        await page.waitForTimeout(2000);
        
        // Check that actions were executed successfully
        const actionsResult = page.locator('text=AgentActions object found');
        await expect(actionsResult).toBeVisible();
        
        const successResult = page.locator('text=status: success');
        await expect(successResult).toBeVisible();
      });

      test('Console logging works correctly', async ({ page }) => {
        const consoleMessages: string[] = [];
        
        page.on('console', msg => {
          consoleMessages.push(msg.text());
        });
        
        await page.goto(`/tests/framework-test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Check for framework-specific console messages
        const configMessage = consoleMessages.find(msg => 
          msg.includes('BlizzardBerry config loaded') && 
          (framework.name === 'React' ? msg.includes('(React)') :
           framework.name === 'Vue' ? msg.includes('(Vue)') :
           framework.name === 'Angular' ? msg.includes('(Angular)') : true)
        );
        expect(configMessage).toBeTruthy();
        
        const actionsMessage = consoleMessages.find(msg => 
          msg.includes('BlizzardBerry actions loaded') && 
          (framework.name === 'React' ? msg.includes('(React)') :
           framework.name === 'Vue' ? msg.includes('(Vue)') :
           framework.name === 'Angular' ? msg.includes('(Angular)') : true)
        );
        expect(actionsMessage).toBeTruthy();
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
      { framework: 'Angular', file: 'angular.html' }
    ];

    for (const testCase of testCases) {
      await page.goto(`/tests/framework-test-pages/${testCase.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verify that the agent script loads the same way in both frameworks
      const agentScript = page.locator('#blizzardberry-agent');
      await expect(agentScript).toHaveAttribute('src', 'https://blizzardberry.com/agent/agent.js');
      
      // Verify that AgentActions object is available
      const actionsAvailable = await page.evaluate(() => {
        return typeof (window as any).AgentActions === 'object' && (window as any).AgentActions !== null;
      });
      expect(actionsAvailable).toBeTruthy();
      
      // Verify that agentUserConfig is available
      const configAvailable = await page.evaluate(() => {
        return typeof (window as any).agentUserConfig === 'object' && (window as any).agentUserConfig !== null;
      });
      expect(configAvailable).toBeTruthy();
    }
  });

  test('Performance comparison', async ({ page }) => {
    const performanceResults: { [key: string]: number } = {};
    
    for (const framework of frameworks) {
      const startTime = Date.now();
      
      await page.goto(`/tests/framework-test-pages/${framework.file}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Wait for all scripts to load
      
      const loadTime = Date.now() - startTime;
      performanceResults[framework.name] = loadTime;
      
      console.log(`${framework.name} load time: ${loadTime}ms`);
    }
    
    // Verify that all frameworks load within reasonable time (under 10 seconds)
    for (const [framework, loadTime] of Object.entries(performanceResults)) {
      expect(loadTime).toBeLessThan(10000);
    }
  });
}); 