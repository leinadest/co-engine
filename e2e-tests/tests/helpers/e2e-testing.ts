import { expect, type Page } from '@playwright/test';

export const login = async (page: Page, email: string, password: string) => {
  // page.on('requestfailed', (request) =>
  //   console.log(`Request Failed: ${request.method()} ${request.url()}`)
  // );
  await page.getByPlaceholder('Enter your email').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('/home');
};

export const startNewChat = async (page: Page, name: string) => {
  await page.getByRole('button', { name: '+' }).click();
  await page
    .getByRole('textbox', { name: 'Enter username#discriminator' })
    .fill(name);
  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForURL('/home/chat/*');
};

export const sendFriendRequest = async (page: Page, name: string) => {
  await page
    .getByRole('textbox', { name: 'Enter username#discriminator' })
    .fill(name);
  await page.getByRole('button', { name: 'Send Friend Request' }).click();
};

export const addFriend = async (
  page: Page,
  user: {
    email: string;
    name: string;
    password: string;
  },
  otherUser: {
    email: string;
    name: string;
    password: string;
  }
) => {
  // Send friend request to tester2#0
  await page.goto('/home/add-friends');
  await sendFriendRequest(page, otherUser.name);

  // Login as otherUser
  await page.goto('/login');
  await login(page, otherUser.email, otherUser.password);

  // Navigate to incoming friend requests page
  await page.getByRole('link', { name: 'connections' }).click();
  await page.getByRole('link', { name: 'Pending' }).click();

  // Accept user's friend request
  await page
    .getByText(`${user.name}Incoming Friend Request✓✕`)
    .getByRole('button', { name: '✓' })
    .click();

  // Log back in as user
  await page.goto('/login');
  await login(page, user.email, user.password);
};
