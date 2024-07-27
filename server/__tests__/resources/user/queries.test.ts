import { executeOperation } from '../helpers';
import { User, UserBlock, UserFriendship } from '../../../src/resources';
import {
  PublicUserFields,
  UserFields,
} from '../../../src/resources/user/schema';
import AuthService from '../../../src/services/authService';
import sequelize from '../../../src/config/sequelize';
import gql from 'graphql-tag';

describe('User Queries Integration Tests', () => {
  const GET_USERS = gql`
    ${PublicUserFields}
    query {
      users {
        ...PublicUserFields
      }
    }
  `;

  const GET_USER = gql`
    ${PublicUserFields}
    query ($id: ID!) {
      user(id: $id) {
        ...PublicUserFields
      }
    }
  `;

  const GET_ME = gql`
    ${UserFields}
    query {
      me {
        ...UserFields
      }
    }
  `;

  const GET_FRIENDS = gql`
    ${PublicUserFields}
    query {
      friends {
        ...PublicUserFields
      }
    }
  `;

  const GET_BLOCKED_USERS = gql`
    ${PublicUserFields}
    query {
      blocked {
        ...PublicUserFields
      }
    }
  `;

  let validUser: User;
  let validAccessToken: string;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.truncate({ cascade: true, restartIdentity: true });

    validUser = await User.create({ username: 'test' });
    validAccessToken = AuthService.createAccessToken(validUser.id).accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('users', () => {
    it('should return all users', async () => {
      // Define expected user
      const expectedUser = {
        ...validUser.get({ plain: true }),
        id: validUser.id.toString(),
        created_at: validUser.created_at.toISOString(),
        email: undefined,
        password_hash: undefined,
      };
      // Execute query and get results
      const result = await executeOperation(GET_USERS);
      const users = result.data.users;

      // Assert
      expect(users).toContainEqual(expectedUser);
    });
  });

  describe('user', () => {
    describe('if the specified user ID is not of type ID', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Variable "$id" of non-null type "ID!" must not be null.',
          code: 'BAD_USER_INPUT',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_USER, { id: null });
        const error = '0' in result.errors && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if the user is not found', () => {
      const invalidUserId = 0;

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'User not found',
          code: 'NOT_FOUND',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_USER, { id: invalidUserId });
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else', () => {
      it('should return the specified user', async () => {
        // Define expected user
        const expectedUser = {
          ...validUser.get({ plain: true }),
          id: validUser.id.toString(),
          created_at: validUser.created_at.toISOString(),
          email: undefined,
          password_hash: undefined,
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_USER,
          { id: validUser.id },
          validAccessToken
        );
        const user = result.data.user;

        // Assert
        expect(user).toEqual(expectedUser);
      });
    });
  });

  describe('me', () => {
    describe('if the user is not authenticated', () => {
      const invalidAccessToken = '';

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_ME, {}, invalidAccessToken);
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else', () => {
      it('should return the authenticated user', async () => {
        // Define expected user
        const expectedUser = {
          ...validUser.get({ plain: true }),
          id: validUser.id.toString(),
          created_at: validUser.created_at.toISOString(),
          last_login_at: validUser.last_login_at?.toISOString() ?? null,
          password_hash: undefined,
        };

        // Execute query and get results
        const result = await executeOperation(GET_ME, {}, validAccessToken);
        const user = result.data.me;

        // Assert
        expect(user).toEqual(expectedUser);
      });
    });
  });

  describe('friends', () => {
    let validFriendUser: User;

    beforeEach(async () => {
      validFriendUser = await User.create({ username: 'friend' });
      await UserFriendship.create({
        sender_id: validUser.id,
        receiver_id: validFriendUser.id,
      });
    });

    describe('if the user is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_FRIENDS);
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else', () => {
      it('should return all friends', async () => {
        // Define expected friend
        const expectedFriend = {
          ...validFriendUser.get({ plain: true }),
          id: validFriendUser.id.toString(),
          created_at: validFriendUser.created_at.toISOString(),
          last_login_at: validFriendUser.last_login_at?.toISOString() ?? null,
          email: undefined,
          password_hash: undefined,
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_FRIENDS,
          {},
          validAccessToken
        );
        const friends = result.data.friends;

        // Assert
        expect(friends).toContainEqual(expectedFriend);
      });
    });
  });

  describe('blockedUsers', () => {
    let validBlockedUser: User;

    beforeEach(async () => {
      validBlockedUser = await User.create({ username: 'blocked' });
      await UserBlock.create({
        user_id: validUser.id,
        blocked_user_id: validBlockedUser.id,
      });
    });

    describe('if the user is not authenticated', () => {
      let invalidAccessToken: '';

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_BLOCKED_USERS,
          {},
          invalidAccessToken
        );
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else', () => {
      it('should return all blocked users', async () => {
        // Define expected blocked user
        const expectedBlockedUser = {
          ...validBlockedUser.get({ plain: true }),
          id: validBlockedUser.id.toString(),
          created_at: validBlockedUser.created_at.toISOString(),
          last_login_at: validBlockedUser.last_login_at?.toISOString() ?? null,
          email: undefined,
          password_hash: undefined,
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_BLOCKED_USERS,
          {},
          validAccessToken
        );
        const blockedUsers = result.data.blocked;

        // Assert
        expect(blockedUsers).toContainEqual(expectedBlockedUser);
      });
    });
  });
});
