import { ApolloServer } from '@apollo/server';

import sequelize from '../../../src/config/sequelize';
import { UserFriendship, User } from '../../../src/resources';
import { type Context } from '../../../src/config/apolloServer';
import schema from '../../../src/schema';
import { type SingleGraphQLResponse } from '../types';
import AuthService from '../../../src/services/authService';

describe('User Friendship Queries Integration Tests', () => {
  const GET_FRIENDSHIPS = `
        query {
            userFriendships {
                sender_id
                receiver_id
                created_at
                accepted_at
                status
            }
        }
    `;

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

  it("should return the authenticated user's friendships", async () => {
    // Set up test data
    const users = await User.bulkCreate([
      {
        username: 'test_username',
        email: 'test@email.com',
        password: 'test_password',
      },
      {
        username: 'test_username2',
        email: 'test2@email.com',
        password: 'test_password2',
      },
    ]);
    const friendship = await UserFriendship.create({
      sender_id: users[0].id,
      receiver_id: users[1].id,
    });
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;
    const authService = new AuthService(accessToken);

    // Define expectation
    const expectedResult = [
      {
        sender_id: users[0].id.toString(),
        receiver_id: users[1].id.toString(),
        created_at: friendship.created_at.toISOString(),
        accepted_at: null,
        status: 'pending',
      },
    ];

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    interface ResponseData {
      userFriendships: typeof expectedResult;
    }
    const response = (await server.executeOperation<ResponseData>(
      { query: GET_FRIENDSHIPS },
      { contextValue: { authService } }
    )) as SingleGraphQLResponse<ResponseData>;

    // Get result
    const result = response.body.singleResult.data.userFriendships;

    // Assert
    expect(result).toEqual(expectedResult);
  });
});
