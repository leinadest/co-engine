import bcrypt from 'bcrypt';

import { executeOperation } from '../helpers';
import { sequelize } from '../../../src/config/sequelize';
import { User } from '../../../src/resources';
import { ACCESS_TOKEN_EXPIRATION_TIME } from '../../../src/config';

describe('User Mutations Integration Tests', () => {
  const CREATE_USER = `
    mutation($user: CreateUserInput!) {
        createUser(user: $user) {
            id
            email
            username
            discriminator
            password_hash
            created_at
            last_login_at
            is_online
            profile_pic
            bio
        }
    }`;

  const AUTHENTICATE = `
    mutation($credentials: AuthenticateInput!) {
        authenticate(credentials: $credentials) {
            user {
                id
                email
                username
                discriminator
                password_hash
                created_at
                last_login_at
                is_online
                profile_pic
                bio
            }
            accessToken
            expiresAt
        }
    }`;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.truncate({ cascade: true, restartIdentity: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('createUser', () => {
    const validUser = {
      username: 'test',
      email: 'test@email.com',
      password: 'Test123!',
    };

    describe('if the username is empty, not within 3–30, or is not alphanumeric', () => {
      it('should throw an error', async () => {
        // Set up test data
        const invalidUsernames = ['', 'a', 'a'.repeat(31), '!@#$%^&*()'];

        // Define expectations
        const expectedMessages = [
          'Username is required',
          'Username must be between 3 and 30 characters long',
          'Username must be between 3 and 30 characters long',
          'Username must contain only letters or numbers',
        ];
        const expectedCode = 'BAD_USER_INPUT';

        // Execute mutation and get results
        const results = await Promise.all(
          invalidUsernames.map(
            async (invalidUsername) =>
              await executeOperation(CREATE_USER, {
                user: {
                  username: invalidUsername,
                  email: validUser.email,
                  password: validUser.password,
                },
              })
          )
        );
        const errors = results.map((result) => (result.errors as any[])[0]);

        // Assert
        errors.forEach((error, index) => {
          expect(error.message).toEqual(expectedMessages[index]);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });
    });

    describe('else if the email is not valid', () => {
      it('should throw an error', async () => {
        // Set up test data
        const invalidEmails = ['', 'a', 'a@', 'a@b', 'a@.com', 'a@b.c'];

        // Define expectations
        const expectedMessages = [
          'Email is required',
          'Email must be a valid email',
        ];
        const expectedCode = 'BAD_USER_INPUT';

        // Execute mutation and get results
        const results = await Promise.all(
          invalidEmails.map(
            async (invalidEmail) =>
              await executeOperation(CREATE_USER, {
                user: {
                  username: validUser.username,
                  email: invalidEmail,
                  password: validUser.password,
                },
              })
          )
        );
        const errors = results.map((result) =>
          result.errors === undefined ? null : result.errors[0]
        );

        // Assert
        errors.forEach((error, index) => {
          expect(error).toBeTruthy();
          expect(error.message).toEqual(expectedMessages[index === 0 ? 0 : 1]);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });
    });

    describe('else if the password is not at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character', () => {
      it('should throw an error', async () => {
        // Set up test data
        const invalidPasswords = [
          '',
          'a',
          'a'.repeat(9),
          `${'a'.repeat(9)}B`,
          `${'a'.repeat(9)}B1`,
        ];

        // Define expectations
        const expectedMessages = [
          'Password is required',
          'Password must have at least eight characters, including one lowercase letter, one uppercase letter, one number, and one special character',
        ];
        const expectedCode = 'BAD_USER_INPUT';

        // Execute mutation and get results
        const results = await Promise.all(
          invalidPasswords.map(
            async (invalidPassword) =>
              await executeOperation(CREATE_USER, {
                user: {
                  username: validUser.username,
                  email: validUser.email,
                  password: invalidPassword,
                },
              })
          )
        );
        const errors = results.map((result) => result.errors[0]);

        // Assert
        errors.forEach((error, index) => {
          expect(error.message).toEqual(expectedMessages[index === 0 ? 0 : 1]);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });
    });

    describe('else if the email is already in use', () => {
      let user: User;

      beforeEach(async () => {
        user = await User.create({
          username: 'test',
          email: 'test@gmail.com',
        });
      });

      it('should throw an error', async () => {
        // Define expectations
        const expectedMessage = `Email ${user.email} is already taken. Choose another email`;
        const expectedCode = 'EMAIL_TAKEN';

        // Execute mutation and get result
        const result = await executeOperation(CREATE_USER, {
          user: {
            username: validUser.username,
            email: user.email,
            password: validUser.password,
          },
        });
        const error = result.errors[0];

        // Assert
        expect(error.message).toEqual(expectedMessage);
        expect(error.extensions.code).toEqual(expectedCode);
      });
    });

    describe('else', () => {
      it('should create a user', async () => {
        // Define expected mutation result
        const expectedUser = {
          id: '1',
          email: validUser.email,
          username: validUser.username,
          discriminator: '0',
          password_hash: expect.any(String),
          created_at: expect.any(String),
          last_login_at: null,
          is_online: false,
          profile_pic: null,
          bio: null,
        };

        // Execute mutation and get result
        const result = await executeOperation(CREATE_USER, {
          user: validUser,
        });
        const user = result.data?.createUser;

        // Assert
        expect(user).toEqual(expectedUser);
      });
    });
  });

  describe('authenticate', () => {
    const validPassword = 'Test123!';
    let validUser: User;

    beforeEach(async () => {
      validUser = await User.create({
        username: 'test',
        email: 'test@email.com',
        password_hash: await bcrypt.hash(validPassword, 10),
      });
    });

    describe('if the email is not valid', () => {
      it('should throw an error', async () => {
        // Set up test data and expectations
        const invalidEmails = [
          {
            email: '',
            expectedMessage: 'Email is required',
            expectedCode: 'BAD_USER_INPUT',
          },
          {
            email: 'a',
            expectedMessage: 'Email must be a valid email',
            expectedCode: 'BAD_USER_INPUT',
          },
          {
            email: 'a@b',
            expectedMessage: 'Email must be a valid email',
            expectedCode: 'BAD_USER_INPUT',
          },
          {
            email: 'a@.com',
            expectedMessage: 'Email must be a valid email',
            expectedCode: 'BAD_USER_INPUT',
          },
          {
            email: 'a@b.c',
            expectedMessage: 'Email must be a valid email',
            expectedCode: 'BAD_USER_INPUT',
          },
          {
            email: 'test@mail.com',
            expectedMessage: 'Email not found',
            expectedCode: 'EMAIL_NOT_FOUND',
          },
        ];

        // Execute mutation and get results
        const results = await Promise.all(
          invalidEmails.map(
            async ({ email }) =>
              await executeOperation(AUTHENTICATE, {
                credentials: { email, password: validPassword },
              })
          )
        );
        const errors = results.map((result) =>
          result.errors === undefined ? null : result.errors[0]
        );

        // Assert
        errors.forEach((error, index) => {
          expect(error).toBeTruthy();
          expect(error.message).toEqual(invalidEmails[index].expectedMessage);
          expect(error.extensions.code).toEqual(
            invalidEmails[index].expectedCode
          );
        });
      });
    });

    describe('else if the password is not valid', () => {
      it('should throw an error', async () => {
        // Set up test data
        const invalidPasswords = [
          '',
          'a',
          'a'.repeat(9),
          `${'a'.repeat(9)}B`,
          `${'a'.repeat(9)}B1`,
          'Test123?',
        ];

        // Define expectations
        const expectedMessages = ['Password is required', 'Incorrect password'];
        const expectedCodes = ['BAD_USER_INPUT', 'INCORRECT_PASSWORD'];

        // Execute mutation and get results
        const results = await Promise.all(
          invalidPasswords.map(
            async (invalidPassword) =>
              await executeOperation(AUTHENTICATE, {
                credentials: {
                  email: validUser.email,
                  password: invalidPassword,
                },
              })
          )
        );
        const errors = results.map((result) =>
          result.errors === undefined ? null : result.errors[0]
        );

        // Assert
        errors.forEach((error, index) => {
          expect(error).toBeTruthy();
          expect(error.message).toEqual(expectedMessages[index === 0 ? 0 : 1]);
          expect(error.extensions.code).toEqual(
            expectedCodes[index === 0 ? 0 : 1]
          );
        });
      });
    });

    describe('else', () => {
      it('should authenticate the user', async () => {
        // Define expected mutation result
        const expectedData = {
          user: {
            ...validUser.get({ plain: true }),
            id: validUser.id.toString(),
            created_at: validUser.created_at.toISOString(),
          },
          accessToken: expect.any(String),
          expiresAt: expect.any(String),
        };
        const expectedExpiresAt =
          Date.now() + ACCESS_TOKEN_EXPIRATION_TIME * 1000;

        // Execute mutation and get results
        const result = await executeOperation(AUTHENTICATE, {
          credentials: {
            email: validUser.email,
            password: validPassword,
          },
        });
        const data = result.data.authenticate;

        // Assert
        expect(data).toEqual(expectedData);
        expect(Date.parse(data.expiresAt as string)).toBeGreaterThanOrEqual(
          expectedExpiresAt
        );
        expect(Date.parse(data.expiresAt as string)).toBeLessThanOrEqual(
          expectedExpiresAt + 5000
        );
      });
    });
  });
});
