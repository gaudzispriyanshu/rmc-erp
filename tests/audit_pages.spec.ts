import { test, expect } from '@playwright/test';

test.describe('ERP Application Comprehensive Audit', () => {
    test.beforeEach(async ({ page }) => {
        // Go to login page
        await page.goto('http://localhost:5173');
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        const submitButton = page.locator('button[type="submit"]');

        await emailInput.fill('admin@gmail.com');
        await passwordInput.fill('123456');
        await submitButton.click();

        // Wait until we are navigated to the dashboard
        await page.waitForURL('**/');
        await expect(page.locator('text=Total Orders')).toBeVisible({ timeout: 15000 });
    });

    test('Test 1: Dashboard Elements', async ({ page }) => {
        await page.screenshot({ path: 'screenshots/dashboard.png' });
    });

    test('Test 2: Orders List', async ({ page }) => {
        await page.goto('http://localhost:5173/orders');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshots/orders-list.png' });
    });

    test('Test 3: Orders Creation - Empty Form Validation', async ({ page }) => {
        await page.goto('http://localhost:5173/orders/new');
        await page.waitForTimeout(1000);
        // Try submitting empty form
        await page.locator('button:has-text("Create Order")').click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/orders-new-empty-submit.png' });
    });

    test('Test 4: Customers List', async ({ page }) => {
        await page.goto('http://localhost:5173/customers');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/customers-list.png' });
    });

    test('Test 5: Drivers List', async ({ page }) => {
        await page.goto('http://localhost:5173/drivers');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/drivers-list.png' });
    });

    test('Test 6: Vehicles List', async ({ page }) => {
        await page.goto('http://localhost:5173/vehicles');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/vehicles-list.png' });
    });

    test('Test 7: Inventory List', async ({ page }) => {
        await page.goto('http://localhost:5173/inventory');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/inventory-list.png' });
    });

    test('Test 8: Mix Designs', async ({ page }) => {
        await page.goto('http://localhost:5173/mix-designs');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/mix-designs.png' });
    });

    test('Test 9: Administration - Roles', async ({ page }) => {
        await page.goto('http://localhost:5173/administration/security-roles');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screenshots/admin-roles.png' });
    });

});
