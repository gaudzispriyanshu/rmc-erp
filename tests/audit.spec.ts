import { test, expect } from '@playwright/test';

test.describe('ERP Application Audit', () => {
    test.beforeEach(async ({ page }) => {
        // Go to login page
        await page.goto('http://localhost:5173');
    });

    test('Login Page - Capture error message or state', async ({ page }) => {
        // Find inputs
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        const submitButton = page.locator('button[type="submit"]');

        // Perform login
        await emailInput.fill('admin@gmail.com');
        await passwordInput.fill('123456');

        // Setup listener for console and network
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        page.on('response', response => {
             console.log(`NETWORK: ${response.status()} ${response.url()}`);
        });

        await submitButton.click();

        await page.waitForTimeout(3000); // wait for 3 seconds to see what happens
        await page.screenshot({ path: 'login-after-submit.png' });
    });
});
