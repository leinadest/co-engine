import { ApolloServer } from '@apollo/server';

import sequelize from '../../../src/config/sequelize';
import { UserFriendship, User } from '../../../src/resources';
import { type Context } from '../../../src/config/apolloServer';
import schema from '../../../src/schema';
import { type SingleGraphQLResponse } from '../types';
import AuthService from '../../../src/services/authService';

describe('User Friendship Mutations Integration Tests', () => {
  const REQUEST_FRIENDSHIP = `
    mutation($userId: ID!) {
      requestFriendship(userId: $userId) {
        sender_id
        receiver_id
        created_at
        accepted_at
        status
      }
    }`;

  const ACCEPT_FRIENDSHIP = `
    mutation($userId: ID!) {
      acceptFriendship(userId: $userId) {
        sender_id
        receiver_id
        created_at
        accepted_at
        status
      }
    }`;

  const DELETE_FRIENDSHIP = `
    mutation($userId: ID!) {
      deleteFriendship(userId: $userId) {
        sender_id
        receiver_id
        created_at
        accepted_at
        status
      }
    }`;

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

  it('should send a friend request', async () => {
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
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;
    const authService = new AuthService(accessToken);

    // Define expectation
    const expectedResult = {
      sender_id: users[0].id.toString(),
      receiver_id: users[1].id.toString(),
      created_at: expect.any(String),
      accepted_at: null,
      status: 'pending',
    };

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    interface ResponseData {
      requestFriendship: typeof expectedResult;
    }
    const response = (await server.executeOperation<ResponseData>(
      {
        query: REQUEST_FRIENDSHIP,
        variables: { userId: users[1].id.toString() },
      },
      { contextValue: { authService } }
    )) as SingleGraphQLResponse<ResponseData>;

    // Get result
    const result = response.body.singleResult.data.requestFriendship;

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should accept a friend request', async () => {
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
      sender_id: users[1].id,
      receiver_id: users[0].id,
    });
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;
    const authService = new AuthService(accessToken);

    // Define expectation
    const expectedResult = {
      ...friendship.toJSON(),
      sender_id: users[1].id.toString(),
      receiver_id: users[0].id.toString(),
      created_at: friendship.created_at.toISOString(),
      accepted_at: expect.any(String),
      status: 'accepted',
    };

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    interface ResponseData {
      acceptFriendship: typeof expectedResult;
    }
    const response = (await server.executeOperation<ResponseData>(
      {
        query: ACCEPT_FRIENDSHIP,
        variables: { userId: users[1].id.toString() },
      },
      { contextValue: { authService } }
    )) as SingleGraphQLResponse<ResponseData>;

    // Get result
    const result = response.body.singleResult.data.acceptFriendship;

    const acceptedAtIsValid =
      Date.parse(result.accepted_at as string) >
      friendship.created_at.getTime();

    // Assert
    expect(result).toEqual(expectedResult);
    expect(acceptedAtIsValid);
  });

  it('should delete a friendship', async () => {
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
    const expectedResult = {
      sender_id: users[0].id.toString(),
      receiver_id: users[1].id.toString(),
      created_at: friendship.created_at.toISOString(),
      accepted_at: null,
      status: 'pending',
    };

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    interface ResponseData {
      deleteFriendship: typeof expectedResult;
    }
    const response = (await server.executeOperation<ResponseData>(
      {
        query: DELETE_FRIENDSHIP,
        variables: { userId: users[1].id.toString() },
      },
      { contextValue: { authService } }
    )) as SingleGraphQLResponse<ResponseData>;

    // Get result
    const result = response.body.singleResult.data.deleteFriendship;

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should throw an error if the user requests, accepts, or deletes a friend request while unauthenticated', async () => {
    // Set up test data
    const users = await User.create({
      username: 'test_username',
      email: 'test@email.com',
      password: 'test_password',
    });

    // Define expectations
    const expectedMessage = 'Not authenticated';
    const expectedCode = 'UNAUTHENTICATED';

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    const responses = (await Promise.all([
      server.executeOperation(
        {
          query: REQUEST_FRIENDSHIP,
          variables: { userId: users.id.toString() },
        },
        { contextValue: { authService: new AuthService('') } }
      ),
      server.executeOperation(
        {
          query: ACCEPT_FRIENDSHIP,
          variables: { userId: users.id.toString() },
        },
        { contextValue: { authService: new AuthService('') } }
      ),
      server.executeOperation(
        {
          query: DELETE_FRIENDSHIP,
          variables: { userId: users.id.toString() },
        },
        { contextValue: { authService: new AuthService('') } }
      ),
    ])) as Array<SingleGraphQLResponse<any>>;

    // Get results
    const results = responses.map(
      (response) => (response.body.singleResult.errors as any[])[0]
    );

    // Assert
    results.forEach((result) => {
      expect(result.message).toEqual(expectedMessage);
      expect(result.extensions.code).toEqual(expectedCode);
    });
  });

  it('should throw an error if the user requests a friend request to a non-existent user', async () => {
    // Set up test data
    const users = await User.bulkCreate([
      {
        username: 'test_username',
        email: 'test@email.com',
        password: 'test_password',
      },
    ]);
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;
    const authService = new AuthService(accessToken);

    // Define expectations
    const expectedMessages = ['User not found'];
    const expectedCodes = ['USER_NOT_FOUND'];

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    const response = (await server.executeOperation<any>(
      {
        query: REQUEST_FRIENDSHIP,
        variables: { userId: '123' },
      },
      { contextValue: { authService } }
    )) as SingleGraphQLResponse<any>;

    // Get result
    const result = (response.body.singleResult.errors as any[])[0];

    // Assert
    expect(result.message).toEqual(expectedMessages[0]);
    expect(result.extensions.code).toEqual(expectedCodes[0]);
  });

  it('should throw an error if the user requests a friend request when one already exists', async () => {
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
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;
    const authService = new AuthService(accessToken);
    await UserFriendship.create({
      sender_id: users[0].id,
      receiver_id: users[1].id,
    });

    // Define expectations
    const expectedMessage = 'Friendship already exists';
    const expectedCode = 'FRIENDSHIP_ALREADY_EXISTS';

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    const response = (await server.executeOperation<any>(
      {
        query: REQUEST_FRIENDSHIP,
        variables: { userId: users[1].id.toString() },
      },
      { contextValue: { authService } }
    )) as SingleGraphQLResponse<any>;

    // Get result
    const result = (response.body.singleResult.errors as any[])[0];

    // Assert
    expect(result.message).toEqual(expectedMessage);
    expect(result.extensions.code).toEqual(expectedCode);
  });

  it('should throw an error if the user requests, accepts, or deletes a friend request from themselves', async () => {
    // Set up test data
    const users = await User.bulkCreate([
      {
        username: 'test_username',
        email: 'test@email.com',
        password: 'test_password',
      },
    ]);
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;
    const authService = new AuthService(accessToken);

    // Define expectations
    const expectedMessages = [
      'Cannot send friend request to yourself',
      'Cannot accept friend request from yourself',
      'Cannot delete friend request from yourself',
    ];
    const expectedCodes = [
      'CANNOT_FRIEND_SELF',
      'CANNOT_FRIEND_SELF',
      'CANNOT_FRIEND_SELF',
    ];

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    const [requestResponse, acceptResponse, deleteResponse] =
      (await Promise.all([
        server.executeOperation<any>(
          {
            query: REQUEST_FRIENDSHIP,
            variables: { userId: users[0].id.toString() },
          },
          { contextValue: { authService } }
        ),
        server.executeOperation<any>(
          {
            query: ACCEPT_FRIENDSHIP,
            variables: { userId: users[0].id.toString() },
          },
          { contextValue: { authService } }
        ),
        server.executeOperation<any>(
          {
            query: DELETE_FRIENDSHIP,
            variables: { userId: users[0].id.toString() },
          },
          { contextValue: { authService } }
        ),
      ])) as Array<SingleGraphQLResponse<any>>;

    // Get results
    const requestResult = (
      requestResponse.body.singleResult.errors as any[]
    )[0];
    const acceptResult = (acceptResponse.body.singleResult.errors as any[])[0];
    const deleteResult = (deleteResponse.body.singleResult.errors as any[])[0];

    // Assert
    expect(requestResult.message).toEqual(expectedMessages[0]);
    expect(requestResult.extensions.code).toEqual(expectedCodes[0]);
    expect(acceptResult.message).toEqual(expectedMessages[1]);
    expect(acceptResult.extensions.code).toEqual(expectedCodes[1]);
    expect(deleteResult.message).toEqual(expectedMessages[2]);
    expect(deleteResult.extensions.code).toEqual(expectedCodes[2]);
  });

  it('should throw an error if the user accepts or deletes a nonexistent friend request', async () => {
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
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;
    const authService = new AuthService(accessToken);

    // Define expectations
    const expectedMessage = 'Friend request not found';
    const expectedCode = 'FRIEND_REQUEST_NOT_FOUND';

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    const responses = (await Promise.all([
      server.executeOperation<any>(
        {
          query: ACCEPT_FRIENDSHIP,
          variables: { userId: users[1].id.toString() },
        },
        { contextValue: { authService } }
      ),
      server.executeOperation<any>(
        {
          query: DELETE_FRIENDSHIP,
          variables: { userId: users[1].id.toString() },
        },
        { contextValue: { authService } }
      ),
    ])) as Array<SingleGraphQLResponse<any>>;

    // Get result
    const results = responses.map(
      ({ body }) => body.singleResult.errors as any[]
    )[0];

    // Assert
    results.forEach((result) => {
      expect(result.message).toEqual(expectedMessage);
      expect(result.extensions.code).toEqual(expectedCode);
    });
  });
});
