import { test, expect } from '@playwright/test';

import { login, sendFriendRequest } from './helpers/e2e-testing';
import { connectToPostgres, getSequelize } from '../config/sequelize';

test.beforeEach(async ({ page }) => {
  await connectToPostgres();
  await Promise.all([
    getSequelize().getQueryInterface().bulkDelete('user_friend_requests', {}),
    getSequelize().getQueryInterface().bulkDelete('user_friendships', {}),
  ]);

  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await login(page, 'test1@gmail.com', 'A1!aaaaa');
  await page.getByRole('link', { name: 'connections' }).click();
  await page.getByRole('link', { name: 'Add Friends', exact: true }).click();
});

test.describe('Send Friend Request', () => {
  test('should allow me to send a friend request', async ({ page }) => {
    // Send friend request to tester2#0
    await sendFriendRequest(page, 'tester2#0');

    // Navigate to outgoing friend requests page
    await page.getByRole('link', { name: 'Pending' }).click();
    await page.getByRole('button', { name: 'outgoing requests' }).click();

    // Expect tester2#0 to be in the requests list
    await expect(page.getByRole('link', { name: 'tester2#0' })).toBeVisible();
  });
});

test.describe('Cancel Friend Request', () => {
  test('should allow me to cancel a friend request', async ({ page }) => {
    // Send friend request to tester2#0
    await sendFriendRequest(page, 'tester2#0');

    // Navigate to outgoing friend requests page
    await page.getByRole('link', { name: 'Pending' }).click();
    await page.getByRole('button', { name: 'outgoing requests' }).click();

    // Remove tester2#0 from the friends list
    await page
      .getByText('tester2#0Outgoing Friend Request✕')
      .getByRole('button', { name: '✕' })
      .click();

    // Expect tester2#0 to not be in the friends list
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('tester2#0')).not.toBeVisible();
  });
});

test.describe('Accept Friend Request', () => {
  test('should allow me to accept a friend request', async ({ page }) => {
    // Send friend request to tester2#0
    await sendFriendRequest(page, 'tester2#0');

    // Login as tester2#0
    await page.goto('/login');
    await login(page, 'test2@gmail.com', 'A1!aaaaa');

    // Navigate to incoming friend requests page
    await page.getByRole('link', { name: 'connections' }).click();
    await page.getByRole('link', { name: 'Pending' }).click();

    // Accept tester1#0's friend request
    await page
      .getByText('tester1#0Incoming Friend Request✓✕')
      .getByRole('button', { name: '✓' })
      .click();

    // Expect tester1#0's friend request to be accepted
    await page.waitForLoadState('domcontentloaded');
    await expect(
      page.getByText('tester1#0Incoming Friend Request✓✕')
    ).not.toBeVisible();

    // Expect tester1#0 to be in the friends list
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.getByText('tester1#0')).toBeVisible();
  });
});
