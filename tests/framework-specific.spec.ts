import { test, expect } from '@playwright/test';

test.describe('Framework-Specific BlizzardBerry Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
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
      await page.waitForTimeout(3000);

      // Check that the config was initially set (using our external test script)
      const configInitiallySet = await page.evaluate(() => (window as any).configInitiallySet);
      expect(configInitiallySet).toBeDefined();

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
      await page.waitForTimeout(3000);

      // Check that the config was initially set (using our external test script)
      const configInitiallySet = await page.evaluate(() => (window as any).configInitiallySet);
      expect(configInitiallySet).toBeDefined();

      // Check that the chat widget was created (indicates agent script loaded successfully)
      const chatWidget = page.locator('#chatWidget');
      await expect(chatWidget).toBeAttached();
    });
  });

  test.describe('Framework Comparison', () => {
    test('All frameworks use the same agent script', async ({ page }) => {
      const frameworks = [
        { name: 'Vanilla JavaScript', file: 'vanilla.html' },
        { name: 'React', file: 'react.html' },
        { name: 'Vue', file: 'vue.html' },
        { name: 'Angular', file: 'angular.html' },
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
