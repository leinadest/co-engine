import { test, expect } from '@playwright/test';

import { login, startNewChat } from './helpers/e2e-testing';
import { connectToPostgres, getSequelize } from '../config/sequelize';

test.beforeEach(async ({ page }) => {
  await connectToPostgres();
  await getSequelize().getQueryInterface().bulkDelete('chats', {}, {});

  await page.goto('/');
  await page.getByText('Login').click();
  await login(page, 'test0@gmail.com', 'A1!aaaaa');
  await startNewChat(page, 'tester1');
});

test.describe('New Chat', () => {
  test('should allow me to create a new chat', async ({ page }) => {
    // Expect chat header to contain tester1#0 and add/remove buttons
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('link', { name: 'tester1#0' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'add user' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'remove user' })
    ).toBeVisible();

    // Look at the users in the chat
    const collapseButton = await page
      .getByRole('button', { name: 'collapse button' })
      .nth(1);
    await collapseButton.click();

    // Expect tester0#0 and tester1#0 to be in the chat
    const tester0 = await page
      .locator('div')
      .filter({ hasText: /^tester0#0$/ })
      .nth(1);
    const tester1 = await page
      .locator('div')
      .filter({ hasText: /^tester1#0$/ })
      .nth(1);
    await expect(tester0).toBeVisible();
    await expect(tester1).toBeVisible();
  });
});

test.describe('Chat Users', () => {
  test('should allow me to add a user to a chat', async ({ page }) => {
    // Add tester2#0 to the chat
    await page.getByRole('button', { name: 'add user' }).click();
    await page
      .getByRole('textbox', { name: 'Enter username#discriminator' })
      .fill('tester2#0');
    await page.getByRole('button', { name: 'Add User', exact: true }).click();

    // Look at the users in the chat
    const collapseButton = await page
      .getByRole('button', { name: 'collapse button' })
      .nth(1);
    await collapseButton.click();

    // Expect tester2#0 to be in the chat
    await page.waitForLoadState('domcontentloaded');
    const tester2 = await page.getByRole('link', { name: 'tester2#0' });
    await expect(tester2).toBeVisible();
  });

  test('should allow me to remove a user from a chat', async ({ page }) => {
    // Remove tester1#0 from the chat
    await page.getByRole('button', { name: 'remove user' }).click();
    await page
      .getByRole('textbox', { name: 'Enter username#discriminator' })
      .fill('tester1');
    await page
      .getByRole('button', { name: 'Remove User', exact: true })
      .click();

    // Look at the users in the chat
    const collapseButton = await page
      .getByRole('button', { name: 'collapse button' })
      .nth(1);
    await collapseButton.click();

    // Expect tester1#0 to not be in the chat
    await page.waitForLoadState('domcontentloaded');
    const tester2 = await page.getByRole('link', { name: 'tester2#0' });
    await expect(tester2).toHaveCount(0);
  });
});

test.describe('Chat Leave', () => {
  test('should allow me to leave a chat', async ({ page }) => {
    // Leave the chat
    await page.getByRole('button', { name: 'leave chat' }).click();
    await page.getByRole('button', { name: 'Leave', exact: true }).click();
    await page.waitForURL('/home');

    // Expect chat to be gone from chat list
    await expect(
      page.getByRole('link', { name: 'tester1#0' })
    ).not.toBeAttached();
  });
});
