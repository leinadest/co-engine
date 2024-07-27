/* eslint-disable @typescript-eslint/naming-convention */
import { ApolloServer } from '@apollo/server';

import { type Context } from '../../../src/config/apolloServer';
import schema from '../../../src/schema';
import { Chat, ChatUser, User, UserBlock } from '../../../src/resources';
import sequelize from '../../../src/config/sequelize';
import { type SingleGraphQLResponse } from '../types';
import AuthService from '../../../src/services/authService';
import { executeOperation } from '../helpers';

describe('Chat Queries Integration Tests', () => {
  const GET_CHATS = `
    query {
      chats {
        id
        creator_id
        created_at
        name
        picture
        last_message_at
        last_message
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
    await sequelize.truncate({ cascade: true, restartIdentity: true });

    validUser = await User.create({
      username: 'test',
    });
    validAccessToken = AuthService.createAccessToken(validUser.id).accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('chats', () => {
    it('should return all chats', async () => {
      // Set up test data
      const chats = await Chat.bulkCreate([
        {
          name: 'test_name',
          creator_id: validUser.id.toString(),
          picture: 'test_picture',
          last_message_at: new Date(),
          last_message: 'test_last_message',
        },
        { creator_id: validUser.id },
      ]);
      await ChatUser.bulkCreate([
        { chat_id: chats[0].id, user_id: validUser.id },
        { chat_id: chats[1].id, user_id: validUser.id },
      ]);
      const authService = new AuthService(validAccessToken);

      // Define expectation
      const expectedResult = chats.map((chat) => ({
        ...chat.toJSON(),
        id: chat.id.toString(),
        creator_id: chat.creator_id.toString(),
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

    describe('and if there are chats from a blocked user', () => {
      let blockedUser: User;
      let blockedUserUnblockedChat: Chat;
      let blockedUserBlockedChat: Chat;

      beforeEach(async () => {
        blockedUser = await User.create({ username: 'blocked' });
        blockedUserUnblockedChat = await Chat.create({
          name: 'unblocked chat',
          creator_id: blockedUser.id,
        });
        await UserBlock.create({
          user_id: validUser.id,
          blocked_user_id: blockedUser.id,
        });
        blockedUserBlockedChat = await Chat.create({
          name: 'blocked chat',
          creator_id: blockedUser.id,
        });
        await ChatUser.bulkCreate([
          {
            chat_id: blockedUserUnblockedChat.id,
            user_id: validUser.id,
          },
          {
            chat_id: blockedUserBlockedChat.id,
            user_id: validUser.id,
          },
        ]);
      });

      it('should not return chats made after the creator is blocked', async () => {
        // Define expected and unexpected chats
        const expectedChat = {
          ...blockedUserUnblockedChat.toJSON(),
          id: blockedUserUnblockedChat.id.toString(),
          creator_id: blockedUser.id.toString(),
          created_at: blockedUserUnblockedChat.created_at.toISOString(),
        };
        const unexpectedChat = {
          ...blockedUserBlockedChat.toJSON(),
          id: blockedUserBlockedChat.id.toString(),
          creator_id: blockedUser.id.toString(),
          created_at: blockedUserBlockedChat.created_at.toISOString(),
        };

        // Execute query and get results
        const result = await executeOperation(GET_CHATS, {}, validAccessToken);
        const chats = result.data.chats;

        // Assert
        expect(chats).toContainEqual(expectedChat);
        expect(chats).not.toContainEqual(unexpectedChat);
      });
    });
  });
});
