import { test, expect } from '@playwright/test';

import { addFriend, login } from './helpers/e2e-testing';
import { connectToPostgres, getSequelize } from '../config/sequelize';

test.beforeEach(async ({ page }) => {
  await connectToPostgres();
  await Promise.all([
    getSequelize().getQueryInterface().bulkDelete('user_friendships', {}),
    getSequelize().getQueryInterface().bulkDelete('user_friend_requests', {}),
  ]);

  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await login(page, 'test1@gmail.com', 'A1!aaaaa');
});

test.describe('Friend Remove', () => {
  test('should allow me to remove a friend', async ({ page }) => {
    // Add tester2#0 as a friend
    const user = {
      email: 'test1@gmail.com',
      name: 'tester1#0',
      password: 'A1!aaaaa',
    };
    const otherUser = {
      email: 'test2@gmail.com',
      name: 'tester2#0',
      password: 'A1!aaaaa',
    };
    await addFriend(page, user, otherUser);

    // Remove tester2#0 from the friends list
    await page.getByRole('link', { name: 'connections' }).click();
    await page.waitForLoadState('domcontentloaded');
    await page
      .locator('div')
      .filter({ hasText: 'tester2#0' })
      .getByRole('button', { name: 'remove friend' })
      .click();
    await page.getByRole('button', { name: 'Unfriend' }).click();

    // Expect tester2#0 to not be in the friends list
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('tester2#0')).not.toBeVisible();
  });
});
