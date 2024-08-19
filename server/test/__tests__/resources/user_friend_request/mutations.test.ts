import gql from 'graphql-tag';

import { User, UserFriendRequest } from '../../../src/resources';
import AuthService from '../../../src/services/authService';
import sequelize from '../../../src/config/sequelize';
import { executeOperation } from '../helpers';

describe('User Friend Request Mutations Integration Tests', () => {
  const SEND_FRIEND_REQUEST = gql`
    mutation sendFriendRequest($userId: ID!) {
      sendFriendRequest(userId: $userId) {
        sender {
          id
        }
        receiver {
          id
        }
        created_at
      }
    }
  `;

  const ACCEPT_FRIEND_REQUEST = gql`
    mutation acceptFriendRequest($userId: ID!) {
      acceptFriendRequest(userId: $userId)
    }
  `;

  const DELETE_FRIEND_REQUEST = gql`
    mutation deleteFriendRequest($senderId: ID!, $receiverId: ID!) {
      deleteFriendRequest(senderId: $senderId, receiverId: $receiverId)
    }
  `;

  // Load two users with user #1 as the authenticated user
  let user: User;
  let userAccessToken: string;
  let otherUsers: User[];
  const loadUsers = async (): Promise<void> => {
    [user, ...otherUsers] = await User.bulkCreate(
      Array(2).fill({ username: 'user' })
    );
    userAccessToken = AuthService.createAccessToken(user.id).accessToken;
  };

  // Load one friend request that user #2 sent to user #1
  const loadFriendRequest = async (): Promise<void> => {
    await UserFriendRequest.create({
      sender_id: 2,
      receiver_id: 1,
    });
  };

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true, restartIdentity: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('sendFriendRequest', () => {
    describe('if argument "userId" is not of type "ID!"', () => {
      const invalidUserId = null;

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message:
            'Variable "$userId" of non-null type "ID!" must not be null.',
          code: 'BAD_USER_INPUT',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(SEND_FRIEND_REQUEST, {
          userId: invalidUserId,
        });
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(SEND_FRIEND_REQUEST, {
          userId: 1,
        });
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User friend requests themselves', () => {
      beforeEach(loadUsers);

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Cannot send friend request to yourself',
          code: 'CANNOT_FRIEND_SELF',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          SEND_FRIEND_REQUEST,
          { userId: user.id },
          userAccessToken
        );
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User friend requests a non-existent user', () => {
      const nonExistentUserId = 0;

      beforeEach(loadUsers);

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'User not found',
          code: 'NOT_FOUND',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          SEND_FRIEND_REQUEST,
          { userId: nonExistentUserId },
          userAccessToken
        );
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User sends a pre-existing friend request', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadFriendRequest();
      });

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Friend request already exists between users',
          code: 'FRIEND_REQUEST_ALREADY_EXISTS',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          SEND_FRIEND_REQUEST,
          { userId: otherUsers[0].id },
          userAccessToken
        );
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User sends a friend request', () => {
      beforeEach(loadUsers);

      it('should create a new friend request', async () => {
        // Expected friend request
        const expectedFriendRequest = {
          sender: { id: user.id.toString() },
          receiver: { id: otherUsers[0].id.toString() },
          created_at: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          SEND_FRIEND_REQUEST,
          { userId: otherUsers[0].id },
          userAccessToken
        );
        const friendRequest = result.data.sendFriendRequest;

        // Assert
        expect(friendRequest).toEqual(expectedFriendRequest);
      });
    });
  });

  describe('acceptFriendRequest', () => {
    describe('if argument "userId" is not of type "ID!"', () => {
      const invalidUserId = null;

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message:
            'Variable "$userId" of non-null type "ID!" must not be null.',
          code: 'BAD_USER_INPUT',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(ACCEPT_FRIEND_REQUEST, {
          userId: invalidUserId,
        });
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(ACCEPT_FRIEND_REQUEST, {
          userId: 1,
        });
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User is accepting a friend request from themselves', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadFriendRequest();
      });

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Cannot accept friend request from yourself',
          code: 'CANNOT_FRIEND_SELF',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          ACCEPT_FRIEND_REQUEST,
          {
            userId: user.id,
          },
          userAccessToken
        );
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User is accepting a non-existent friend request', () => {
      beforeEach(loadUsers);

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Friend request not found',
          code: 'FRIEND_REQUEST_NOT_FOUND',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          ACCEPT_FRIEND_REQUEST,
          { userId: otherUsers[0].id },
          userAccessToken
        );
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User accepts a friend request', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadFriendRequest();
      });

      it('should destroy the friend request and create a new friendship', async () => {
        // Execute mutatio and get results
        const result = await executeOperation(
          ACCEPT_FRIEND_REQUEST,
          { userId: otherUsers[0].id },
          userAccessToken
        );
        const friendRequest = await UserFriendRequest.findOne({
          where: { sender_id: otherUsers[0].id, receiver_id: user.id },
        });

        // Assert
        expect(result.data.acceptFriendRequest).toBe(true);
        expect(friendRequest).toBeNull();
      });
    });
  });

  describe('deleteFriendRequest', () => {
    describe('if argument "senderId" or "receiverId" is not of type "ID!"', () => {
      const invalidCases: any[] = [
        {
          variables: {
            senderId: null,
          },
          expectedError: {
            message:
              'Variable "$senderId" of non-null type "ID!" must not be null.',
          },
        },
        {
          variables: {
            senderId: 1,
            receiverId: null,
          },
          expectedError: {
            message:
              'Variable "$receiverId" of non-null type "ID!" must not be null.',
          },
        },
      ];
      invalidCases.forEach((invalidCase) => {
        invalidCase.expectedError = {
          message: invalidCase.expectedError.message,
          code: 'BAD_USER_INPUT',
          stack: expect.any(String),
        };
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const results = await Promise.all(
          invalidCases.map(
            async ({ variables }) =>
              await executeOperation(DELETE_FRIEND_REQUEST, variables)
          )
        );
        const errors = results.map((result) => result.errors[0]);

        // Assert
        errors.forEach((error, index) => {
          expect(error).toEqual(invalidCases[index].expectedError);
        });
      });
    });

    describe('else if User is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(DELETE_FRIEND_REQUEST, {
          senderId: 2,
          receiverId: 1,
        });
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User is deleting a non-existent friend request', () => {
      beforeEach(loadUsers);

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Friend request not found',
          code: 'FRIEND_REQUEST_NOT_FOUND',
          stack: expect.any(String),
        };

        // Execute mutation and get results
        const result = await executeOperation(
          DELETE_FRIEND_REQUEST,
          { senderId: otherUsers[0].id, receiverId: user.id },
          userAccessToken
        );
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User is deleting a friend request', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadFriendRequest();
      });

      it('should delete a friend request', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          DELETE_FRIEND_REQUEST,
          { senderId: otherUsers[0].id, receiverId: user.id },
          userAccessToken
        );
        const friendRequest = await UserFriendRequest.findOne({
          where: { sender_id: otherUsers[0].id, receiver_id: user.id },
        });

        // Assert
        expect(result.data.deleteFriendRequest).toBe(true);
        expect(friendRequest).toBeNull();
      });
    });
  });
});
