import { test, expect } from '@playwright/test';

test.describe('Framework-Specific BlizzardBerry Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Vue.js Specific Features', () => {
    test('Vue reactive data updates work correctly', async ({ page }) => {
      await page.goto('/tests/framework-test-pages/vue.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Click Vue integration test button
      await page.click('button:text("Test Vue Integration")');
      await page.waitForTimeout(2000);
      
      // Check that Vue-specific actions are executed
      const vueDataResult = page.locator('text=Vue data update result:');
      await expect(vueDataResult).toBeVisible();
      
      const vueMethodResult = page.locator('text=Vue method call result:');
      await expect(vueMethodResult).toBeVisible();
      
      const vueLifecycleResult = page.locator('text=Vue lifecycle result:');
      await expect(vueLifecycleResult).toBeVisible();
    });

    test('Vue lifecycle hooks are properly handled', async ({ page }) => {
      await page.goto('/tests/framework-test-pages/vue.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Click Vue integration test button
      await page.click('button:text("Test Vue Integration")');
      await page.waitForTimeout(2000);
      
      // Check that mounted lifecycle hook was triggered
      const mountedResult = page.locator('text=Vue mounted lifecycle hook triggered');
      await expect(mountedResult).toBeVisible();
    });

    test('Vue component methods can be called', async ({ page }) => {
      await page.goto('/tests/framework-test-pages/vue.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Click Vue integration test button
      await page.click('button:text("Test Vue Integration")');
      await page.waitForTimeout(2000);
      
      // Check that component method call was successful
      const methodResult = page.locator('text=Vue component method called successfully');
      await expect(methodResult).toBeVisible();
      
      // Verify the method parameters
      const methodParams = page.locator('text=TestComponent');
      await expect(methodParams).toBeVisible();
    });
  });

  test.describe('Angular Specific Features', () => {
    test('Angular service calls work correctly', async ({ page }) => {
      await page.goto('/tests/framework-test-pages/angular.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Click Angular integration test button
      await page.click('button:text("Test Angular Integration")');
      await page.waitForTimeout(2000);
      
      // Check that Angular-specific actions are executed
      const angularServiceResult = page.locator('text=Angular service call result:');
      await expect(angularServiceResult).toBeVisible();
      
      const angularComponentResult = page.locator('text=Angular component interaction result:');
      await expect(angularComponentResult).toBeVisible();
      
      const angularHttpResult = page.locator('text=Angular HTTP result:');
      await expect(angularHttpResult).toBeVisible();
    });

    test('Angular lifecycle hooks are properly handled', async ({ page }) => {
      await page.goto('/tests/framework-test-pages/angular.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Click Angular integration test button
      await page.click('button:text("Test Angular Integration")');
      await page.waitForTimeout(2000);
      
      // Check that ngOnInit lifecycle hook was triggered
      const ngOnInitResult = page.locator('text=Angular ngOnInit lifecycle hook triggered');
      await expect(ngOnInitResult).toBeVisible();
    });

    test('Angular HTTP service calls work', async ({ page }) => {
      await page.goto('/tests/framework-test-pages/angular.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Click Angular integration test button
      await page.click('button:text("Test Angular Integration")');
      await page.waitForTimeout(2000);
      
      // Check that HTTP service call was successful
      const httpResult = page.locator('text=Angular HTTP service call successful');
      await expect(httpResult).toBeVisible();
      
      // Verify the HTTP parameters
      const httpUrl = page.locator('text=/api/users');
      await expect(httpUrl).toBeVisible();
    });

    test('Angular component interactions work', async ({ page }) => {
      await page.goto('/tests/framework-test-pages/angular.html');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Click Angular integration test button
      await page.click('button:text("Test Angular Integration")');
      await page.waitForTimeout(2000);
      
      // Check that component interaction was successful
      const componentResult = page.locator('text=Angular component interaction successful');
      await expect(componentResult).toBeVisible();
      
      // Verify the component name
      const componentName = page.locator('text=UserComponent');
      await expect(componentName).toBeVisible();
    });
  });

  test.describe('Framework Comparison', () => {
    test('All frameworks use the same agent script', async ({ page }) => {
      const frameworks = [
        { name: 'Vanilla JavaScript', file: 'vanilla.html' },
        { name: 'React', file: 'react.html' },
        { name: 'Vue', file: 'vue.html' },
        { name: 'Angular', file: 'angular.html' }
      ];

      for (const framework of frameworks) {
        await page.goto(`/tests/framework-test-pages/${framework.file}`);
        await page.waitForLoadState('networkidle');
        
        // Verify all frameworks use the same agent script
        const agentScript = page.locator('#blizzardberry-agent');
        await expect(agentScript).toHaveAttribute('src', 'https://blizzardberry.com/agent/agent.js');
        
        // Verify all frameworks have the same basic structure
        const configScript = page.locator('#blizzardberry-config');
        const actionsScript = page.locator('#blizzardberry-actions');
        
        await expect(configScript).toBeVisible();
        await expect(actionsScript).toBeVisible();
      }
    });

    test('Framework-specific user IDs are correctly set', async ({ page }) => {
      const testCases = [
        { framework: 'Vanilla JavaScript', file: 'vanilla.html', expectedId: 'test_user_123' },
        { framework: 'React', file: 'react.html', expectedId: 'react_user_123' },
        { framework: 'Vue', file: 'vue.html', expectedId: 'vue_user_123' },
        { framework: 'Angular', file: 'angular.html', expectedId: 'angular_user_123' }
      ];

      for (const testCase of testCases) {
        await page.goto(`/tests/framework-test-pages/${testCase.file}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Click test user config button
        await page.click('button:text("Test User Config")');
        await page.waitForTimeout(1000);
        
        // Verify framework-specific user ID
        const userIdResult = page.locator(`text=User ID: ${testCase.expectedId}`);
        await expect(userIdResult).toBeVisible();
      }
    });

    test('Framework-specific actions are properly defined', async ({ page }) => {
      const testCases = [
        { framework: 'React', file: 'react.html', action: 'updateReactState' },
        { framework: 'Vue', file: 'vue.html', action: 'updateVueData' },
        { framework: 'Angular', file: 'angular.html', action: 'callAngularService' }
      ];

      for (const testCase of testCases) {
        await page.goto(`/tests/framework-test-pages/${testCase.file}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Click framework integration test button
        const integrationButton = testCase.framework === 'React' ? 'Test React Integration' :
                                 testCase.framework === 'Vue' ? 'Test Vue Integration' :
                                 'Test Angular Integration';
        
        await page.click(`button:text("${integrationButton}")`);
        await page.waitForTimeout(2000);
        
        // Verify framework-specific action was called
        const successResult = page.locator('text=status: success');
        await expect(successResult).toBeVisible();
      }
    });
  });
}); 