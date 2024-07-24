/* eslint-disable @typescript-eslint/naming-convention */
import { ApolloServer } from '@apollo/server';

import { type Context } from '../../../src/config/apolloServer';
import schema from '../../../src/schema';
import { Chat, ChatUser, User } from '../../../src/resources';
import sequelize from '../../../src/config/sequelize';
import { type SingleGraphQLResponse } from '../types';
import AuthService from '../../../src/services/authService';

describe('Chat Queries Integration Tests', () => {
  const GET_CHATS = `
    query {
      chats {
        id
        created_at
        name
        picture
        last_message_at
        last_message
      }
    }
    `;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Chat.truncate({ cascade: true, restartIdentity: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should return all chats', async () => {
    // Set up test data
    const chats = await Chat.bulkCreate([
      {
        name: 'test_name',
        picture: 'test_picture',
        last_message_at: new Date(),
        last_message: 'test_last_message',
      },
      {},
    ]);
    const users = await User.bulkCreate([
      {
        username: 'test_username',
        email: 'test@email.com',
        password: 'test_password',
      },
    ]);
    await ChatUser.bulkCreate([
      { chat_id: chats[0].id, user_id: users[0].id, is_creator: true },
      { chat_id: chats[1].id, user_id: users[0].id },
    ]);
    const accessToken = AuthService.createAccessToken(users[0].id).accessToken;
    const authService = new AuthService(accessToken);

    // Define expectation
    const expectedResult = chats.map((chat) => ({
      ...chat.toJSON(),
      id: chat.id.toString(),
      created_at: chat.created_at.toISOString(),
      last_message_at: chat.last_message_at?.toISOString() ?? null,
    }));

    // Execute query
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });
    interface ResponseData {
      chats: typeof expectedResult;
    }
    const response = (await server.executeOperation<ResponseData>(
      { query: GET_CHATS },
      { contextValue: { authService } }
    )) as SingleGraphQLResponse<ResponseData>;

    // Get result
    const result = response.body.singleResult.data.chats;

    // Assert
    expect(result).toEqual(expectedResult);
  });
});
