import sequelize from '../../../src/config/sequelize';
import { User, UserFriendRequest } from '../../../src/resources';
import AuthService from '../../../src/services/authService';
import { executeOperation } from '../helpers';

describe('User Friend Request Queries Integration Tests', () => {
  const GET_FRIEND_REQUESTS = `
    query($query: UserFriendRequestsInput) {
      userFriendRequests(query: $query) {
        sender {
          id
        }
        receiver {
          id
        }
        created_at
      }
    }`;

  // Load 20 users, with user #1 being the authenticated user
  let user: User;
  let userAccessToken: string;
  const usersLoader = async (): Promise<void> => {
    [user] = await User.bulkCreate(Array(20).fill({ username: 'user' }));
    userAccessToken = AuthService.createAccessToken(user.id).accessToken;
  };

  // Load 19 friend requests between user #1 and the other 19 users
  let friendRequests: UserFriendRequest[];
  const friendRequestsLoader = async (): Promise<void> => {
    const data = [];
    for (let userId = 2; userId < 20; userId += 1) {
      data.push({
        sender_id: userId <= 10 ? 1 : userId,
        receiver_id: userId <= 10 ? userId : 1,
        created_at: new Date(Math.random() * 100000),
      });
    }
    friendRequests = await UserFriendRequest.bulkCreate(data);
  };

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('userFriendRequests', () => {
    describe('if argument "query" is not of type "UserFriendRequestsInput"', () => {
      const invalidCases: Array<Record<string, any>> = [
        {
          query: { type: 0 },
          expectedError: {
            message:
              'Variable "$query" got invalid value 0 at "query.type"; String cannot represent a non string value: 0',
          },
        },
        {
          query: { orderBy: 0 },
          expectedError: {
            message:
              'Variable "$query" got invalid value 0 at "query.orderBy"; String cannot represent a non string value: 0',
          },
        },
        {
          query: { orderDirection: 0 },
          expectedError: {
            message:
              'Variable "$query" got invalid value 0 at "query.orderDirection"; String cannot represent a non string value: 0',
          },
        },
        {
          query: { limit: 'a' },
          expectedError: {
            message:
              'Variable "$query" got invalid value "a" at "query.limit"; Int cannot represent non-integer value: "a"',
          },
        },
        {
          query: { offset: 'a' },
          expectedError: {
            message:
              'Variable "$query" got invalid value "a" at "query.offset"; Int cannot represent non-integer value: "a"',
          },
        },
      ];
      invalidCases.forEach((query) => {
        query.expectedError = {
          message: query.expectedError.message,
          code: 'BAD_USER_INPUT',
          stack: expect.any(String),
        };
      });

      it('should return an error', async () => {
        // Execute query and get results
        const results = await Promise.all(
          invalidCases.map(
            async ({ query }) =>
              await executeOperation(
                GET_FRIEND_REQUESTS,
                { query },
                userAccessToken
              )
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
      it('should return an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_FRIEND_REQUESTS, {});
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User queries first 10 received friend requests by dates descending', () => {
      beforeEach(async () => {
        await usersLoader();
        await friendRequestsLoader();
      });

      it('should return the friend requests', async () => {
        // Define expected friend requests
        const expectedFriendRequests = friendRequests
          .filter((friendRequest) => friendRequest.receiver_id === user.id)
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
          .map((friendRequest) => ({
            sender: { id: friendRequest.sender_id.toString() },
            receiver: { id: friendRequest.receiver_id.toString() },
            created_at: friendRequest.created_at.toISOString(),
          }));

        // Execute query and get results
        const result = await executeOperation(
          GET_FRIEND_REQUESTS,
          {},
          userAccessToken
        );
        const friendRequestConnection = result.data.userFriendRequests;

        // Assert
        expect(friendRequestConnection).toEqual(expectedFriendRequests);
      });
    });

    describe('else if User queries first 4 sent friend requests by dates ascending', () => {
      beforeEach(async () => {
        await usersLoader();
        await friendRequestsLoader();
      });

      it('should return the friend requests', async () => {
        // Define expected friend requests
        const expectedFriendRequests = friendRequests
          .filter((friendRequest) => friendRequest.sender_id === user.id)
          .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
          .slice(0, 4)
          .map((friendRequest) => ({
            sender: { id: friendRequest.sender_id.toString() },
            receiver: { id: friendRequest.receiver_id.toString() },
            created_at: friendRequest.created_at.toISOString(),
          }));

        // Execute query and get results
        const result = await executeOperation(
          GET_FRIEND_REQUESTS,
          { query: { type: 'sent', orderDirection: 'ASC', limit: 4 } },
          userAccessToken
        );
        const friendRequestConnection = result.data.userFriendRequests;

        // Assert
        expect(friendRequestConnection).toEqual(expectedFriendRequests);
      });
    });

    describe('else if User queries next 4 sent friend requests by dates ascending', () => {
      beforeEach(async () => {
        await usersLoader();
        await friendRequestsLoader();
      });

      it('should return the friend requests', async () => {
        // Define expected friend requests
        const expectedFriendRequests = friendRequests
          .filter((friendRequest) => friendRequest.sender_id === user.id)
          .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
          .slice(4, 8)
          .map((friendRequest) => ({
            sender: { id: friendRequest.sender_id.toString() },
            receiver: { id: friendRequest.receiver_id.toString() },
            created_at: friendRequest.created_at.toISOString(),
          }));

        // Execute query and get results
        const result = await executeOperation(
          GET_FRIEND_REQUESTS,
          {
            query: { type: 'sent', orderDirection: 'ASC', limit: 4, offset: 4 },
          },
          userAccessToken
        );
        const friendRequestConnection = result.data.userFriendRequests;

        // Assert
        expect(friendRequestConnection).toEqual(expectedFriendRequests);
      });
    });
  });
});
