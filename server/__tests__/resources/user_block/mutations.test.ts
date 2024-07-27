import sequelize from '../../../src/config/sequelize';
import { User, UserBlock, UserFriendship } from '../../../src/resources';
import AuthService from '../../../src/services/authService';
import { executeOperation } from '../helpers';

describe('User Block Mutations Integration Tests', () => {
  const BLOCK_USER = `
    mutation($userId: ID!) {
      blockUser(userId: $userId) {
        user_id
        blocked_user_id
        created_at
      }
    }`;

  const UNBLOCK_USER = `
    mutation($userId: ID!) {
      unblockUser(userId: $userId) {
        user_id
        blocked_user_id
        created_at
      }
    }`;

  let validUser: User;
  let validAccessToken: string;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true });

    validUser = await User.create({ username: 'test' });
    validAccessToken = AuthService.createAccessToken(validUser.id).accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('blockUser', () => {
    let otherUser: User;

    beforeEach(async () => {
      otherUser = await User.create({ username: 'other' });
    });

    describe('if userId is not of type "ID!"', () => {
      const invalidUserIds = [
        {
          userId: undefined,
          expectedError: {
            message:
              'Variable "$userId" got invalid value undefined; Expected non-nullable type "ID!" not to be null.',
            code: 'BAD_USER_INPUT',
            stack: expect.any(String),
          },
        },
        {
          userId: null,
          expectedError: {
            message:
              'Variable "$userId" got invalid value undefined; Expected non-nullable type "ID!" not to be null.',
            code: 'BAD_USER_INPUT',
            stack: expect.any(String),
          },
        },
        {
          userId: true,
          expectedError: {
            message:
              'Variable "$userId" got invalid value undefined; Expected non-nullable type "ID!" not to be null.',
            code: 'BAD_USER_INPUT',
            stack: expect.any(String),
          },
        },
      ];

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          BLOCK_USER,
          { userId: invalidUserIds[0].userId },
          validAccessToken
        );
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        invalidUserIds.forEach((invalidUserId) => {
          expect(error).toEqual(invalidUserId.expectedError);
        });
      });
    });

    describe('else if user is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(BLOCK_USER, {
          userId: otherUser.id,
        });
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if other user is already blocked by user', () => {
      beforeEach(async () => {
        await UserBlock.create({
          user_id: validUser.id,
          blocked_user_id: otherUser.id,
        });
      });

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'User already blocked',
          code: 'BAD_USER_INPUT',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          BLOCK_USER,
          { userId: otherUser.id },
          validAccessToken
        );
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else', () => {
      it('should block the other user', async () => {
        // Define expected user_block data
        const expectedUserBlock = {
          user_id: validUser.id.toString(),
          blocked_user_id: otherUser.id.toString(),
          created_at: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          BLOCK_USER,
          { userId: otherUser.id },
          validAccessToken
        );
        const userBlock = result.data.blockUser;

        // Assert
        expect(userBlock).toEqual(expectedUserBlock);
      });
    });

    describe('and if other user is a friend of user', () => {
      beforeEach(async () => {
        await UserFriendship.create({
          sender_id: validUser.id,
          receiver_id: otherUser.id,
          status: 'accepted',
        });
      });

      it('should delete friendship', async () => {
        // Execute mutation and get results
        await executeOperation(
          BLOCK_USER,
          { userId: otherUser.id },
          validAccessToken
        );
        const friendship = await UserFriendship.findOne({
          where: {
            sender_id: validUser.id,
            receiver_id: otherUser.id,
          },
        });

        // Assert
        expect(friendship).toBeNull();
      });
    });
  });

  describe('unblockUser', () => {
    let blockedUser: User;
    let userBlock: UserBlock;

    beforeEach(async () => {
      blockedUser = await User.create({ username: 'blocked' });
      userBlock = await UserBlock.create({
        user_id: validUser.id,
        blocked_user_id: blockedUser.id,
      });
    });

    describe('if userId is not of type "ID!"', () => {
      const invalidUserIds = [
        {
          userId: undefined,
          expectedError: {
            message:
              'Variable "$userId" got invalid value undefined; Expected non-nullable type "ID!" not to be null.',
            code: 'BAD_USER_INPUT',
            stack: expect.any(String),
          },
        },
        {
          userId: null,
          expectedError: {
            message:
              'Variable "$userId" got invalid value undefined; Expected non-nullable type "ID!" not to be null.',
            code: 'BAD_USER_INPUT',
            stack: expect.any(String),
          },
        },
        {
          userId: true,
          expectedError: {
            message:
              'Variable "$userId" got invalid value undefined; Expected non-nullable type "ID!" not to be null.',
            code: 'BAD_USER_INPUT',
            stack: expect.any(String),
          },
        },
      ];

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          UNBLOCK_USER,
          { userId: invalidUserIds[0].userId },
          validAccessToken
        );
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        invalidUserIds.forEach((invalidUserId) => {
          expect(error).toEqual(invalidUserId.expectedError);
        });
      });
    });

    describe('else if user is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(UNBLOCK_USER, {
          userId: blockedUser.id,
        });
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if other user is not blocked', () => {
      beforeEach(async () => {
        await userBlock.destroy();
      });

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'User not blocked',
          code: 'BAD_USER_INPUT',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          UNBLOCK_USER,
          { userId: blockedUser.id },
          validAccessToken
        );
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else', () => {
      it('should unblock the other user', async () => {
        // Define expected user_block data
        const expectedUserBlock = {
          user_id: validUser.id.toString(),
          blocked_user_id: blockedUser.id.toString(),
          created_at: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          UNBLOCK_USER,
          { userId: blockedUser.id },
          validAccessToken
        );
        const userBlock = result.data.unblockUser;

        // Assert
        expect(userBlock).toEqual(expectedUserBlock);
      });
    });
  });
});
