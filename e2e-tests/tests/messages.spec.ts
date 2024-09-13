import { test, expect, Page } from '@playwright/test';

import { login, startNewChat } from './helpers/e2e-testing';
import mongoose, { connectToMongo } from '../config/mongo';

test.beforeEach(async ({ page }) => {
  await connectToMongo();
  const collection = await mongoose.connection.collection('messages');
  await collection.deleteMany({});

  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await login(page, 'test0@gmail.com', 'A1!aaaaa');
  await startNewChat(page, 'tester1');
});

test.describe('New Message', () => {
  test('should allow me to send a message', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Send new message
    await page.getByPlaceholder('Enter your message').fill('new message!');
    await page.getByPlaceholder('Enter your message').press('Enter');

    // Expect message to be visible
    await expect(page.getByText('new message!')).toBeVisible();
  });

  test('should not allow me to send an empty message', async ({
    page,
  }: {
    page: Page;
  }) => {
    // Send an empty message
    await page.getByPlaceholder('Enter your message').press('Enter');

    // Expect no message and for error to be visible
    await expect(page.getByText('new message!')).not.toBeVisible();
    await expect(page.getByText('Error: Content is required')).toBeVisible();
  });
});
