import mongoose from 'mongoose';

import sequelize from '../../../../src/config/sequelize';
import connectToMongo from '../../../../src/config/mongo';
import {
  Chat,
  ChatUser,
  Message,
  User,
  UserBlock,
} from '../../../../src/resources/';
import { type IMessage } from '../../../../src/resources/message/model';
import { executeOperation } from '../helpers';
import AuthService from '../../../../src/services/authService';

describe('Message Queries Integration Tests', () => {
  const GET_MESSAGES = `
    query($query: MessagesInput!) {
      messages(query: $query) {
        edges {
          cursor
          node {
            id
            context_type
            context_id
            creator {
              id
            }
            formatted_created_at
            formatted_edited_at
            content
            reactions {
              reactor_id
              reaction
            }
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }`;

  beforeAll(async () => {
    await Promise.all([
      sequelize.authenticate(),
      sequelize.sync({ force: true }),
      connectToMongo(),
    ]);
  });

  beforeEach(async () => {
    await Promise.all([
      sequelize.truncate({ cascade: true, restartIdentity: true }),
      Message.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await Promise.all([mongoose.disconnect(), sequelize.close()]);
  });

  describe('getMessages', () => {
    let validUser: User;
    let validContext: Chat;
    let validMessages: IMessage[];
    let validContextUser: ChatUser;
    let validAccessToken: string;

    beforeEach(async () => {
      const validUserData = { username: 'test' };
      const validMessagesData = [];
      for (let i = 0; i < 20; i += 1) {
        validMessagesData[i] = {
          context_type: 'chat',
          context_id: 1,
          creator_id: 1,
          content: `test content ${i}`,
          created_at: new Date(Math.random() * 1000000000000),
        };
      }

      [validUser, validMessages] = await Promise.all([
        User.create(validUserData),
        Message.insertMany(validMessagesData),
      ]);

      validContext = await Chat.create({ creator_id: validUser.id });
      validContextUser = await ChatUser.create({
        chat_id: validContext.id,
        user_id: validUser.id,
      });
      validAccessToken = AuthService.createAccessToken(
        validUser.id
      ).accessToken;
    });

    describe('if the query argument is invalid', () => {
      let invalidQueries: any[];

      beforeEach(async () => {
        invalidQueries = [
          {
            contextType: 1,
            contextId: validContext.id.toString(),
            expectedMsg:
              'Variable "$query" got invalid value 1 at "query.contextType"; String cannot represent a non string value: 1',
            expectedCode: 'BAD_USER_INPUT',
          },
          {
            contextType: 'chat',
            contextId: 1,
            expectedMsg:
              'Variable "$query" got invalid value 1 at "query.contextId"; String cannot represent a non string value: 1',
            expectedCode: 'BAD_USER_INPUT',
          },
          {
            contextType: 'a',
            contextId: validContext.id.toString(),
            expectedMsg: 'Context must be either chat or channel',
            expectedCode: 'BAD_USER_INPUT',
          },
          {
            contextType: 'chat',
            contextId: (validContext.id + 1).toString(),
            expectedMsg: 'User not found in context',
            expectedCode: 'NOT_FOUND',
          },
        ];
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const results = await Promise.all(
          invalidQueries.map(
            async (invalidQuery) =>
              await executeOperation(
                GET_MESSAGES,
                {
                  query: {
                    contextType: invalidQuery.contextType,
                    contextId: invalidQuery.contextId,
                  },
                },
                validAccessToken
              )
          )
        );
        const errors = results.map(
          (result) => '0' in result.errors && result.errors[0]
        );

        // Assert
        errors.forEach((error, index) => {
          expect(error.message).toEqual(invalidQueries[index].expectedMsg);
          expect(error.code).toEqual(invalidQueries[index].expectedCode);
        });
      });
    });

    describe('else if the user is not authenticated', () => {
      const invalidAccessToken = '';

      it('should throw an error', async () => {
        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
            },
          },
          invalidAccessToken
        );
        const error = result.errors[0];

        // Assert
        expect(error.message).toEqual('Not authenticated');
        expect(error.code).toEqual('UNAUTHENTICATED');
      });
    });

    describe('else if the context does not exist', () => {
      beforeEach(async () => {
        await validContext.destroy();
      });

      it('should throw an error', async () => {
        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
            },
          },
          validAccessToken
        );
        const error = '0' in result.errors && result.errors[0];

        // Assert
        expect(error.message).toEqual('User not found in context');
        expect(error.code).toEqual('NOT_FOUND');
      });
    });

    describe('else if the user is not in the context', () => {
      beforeEach(async () => {
        await validContextUser.destroy();
      });

      it('should throw an error', async () => {
        // Define expected error
        const expectedMessage = 'User not found in context';
        const expectedCode = 'NOT_FOUND';

        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
            },
          },
          validAccessToken
        );
        const error = '0' in result.errors && result.errors[0];

        // Assert
        expect(error.message).toEqual(expectedMessage);
        expect(error.code).toEqual(expectedCode);
      });
    });

    describe('else if the user queries messages from the context', () => {
      it('should return the first 10 messages ordered by descending date', async () => {
        // Define expected query result
        const expectedMessageConnection = {
          edges: validMessages
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
            .map((message) => ({
              cursor: expect.any(String),
              node: {
                ...message.toJSON(),
                creator: { id: message.creator_id.toString() },
                creator_id: undefined,
              },
            }))
            .slice(0, 10),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: expect.any(String),
            endCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
            },
          },
          validAccessToken
        );
        const messageConnection = result.data.messages;

        // Assert
        expect(messageConnection).toEqual(expectedMessageConnection);
      });
    });

    describe('and if there are messages from a blocked user', () => {
      let blockedUser: User;
      let blockedUserUnblockedMessage: IMessage;
      let blockedUserBlockedMessage: IMessage;

      beforeEach(async () => {
        blockedUser = await User.create({ username: 'blocked' });
        await ChatUser.create({
          chat_id: validContext.id,
          user_id: blockedUser.id,
        });
        blockedUserUnblockedMessage = await Message.create({
          context_type: 'chat',
          context_id: validContext.id,
          creator_id: blockedUser.id,
          content: 'message not blocked yet',
        });
        await UserBlock.create({
          user_id: validUser.id,
          blocked_user_id: blockedUser.id,
        });
        blockedUserBlockedMessage = await Message.create({
          context_type: 'chat',
          context_id: validContext.id,
          creator_id: blockedUser.id,
          content: 'message now blocked',
        });
      });

      it('should not return messages made after the creator is blocked', async () => {
        // Define expected and unexpected messages
        const expectedEdges = [...validMessages, blockedUserUnblockedMessage]
          .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
          .map((message) => ({
            cursor: expect.any(String),
            node: {
              ...message.toJSON(),
              creator: { id: message.creator_id.toString() },
              creator_id: undefined,
            },
          }));
        const unexpectedEdge = {
          cursor: expect.any(String),
          node: {
            ...blockedUserBlockedMessage.toJSON(),
            creator: { id: blockedUserBlockedMessage.creator_id.toString() },
            creator_id: undefined,
          },
        };
        const expectedPageInfo = {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: expect.any(String),
          endCursor: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              first: 100,
            },
          },
          validAccessToken
        );
        const messageConnection = result.data.messages;

        // Assert
        expectedEdges.forEach((edge) => {
          expect(messageConnection.edges).toContainEqual(edge);
        });
        expect(messageConnection.edges).not.toContainEqual(unexpectedEdge);
        expect(messageConnection.pageInfo).toEqual(expectedPageInfo);
      });
    });

    describe('else if the user queries by ascending date', () => {
      it('should return the first 10 messages ordered by ascending date', async () => {
        // Define expected query result
        const expectedMessageConnection = {
          edges: validMessages
            .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
            .map((message) => ({
              cursor: expect.any(String),
              node: {
                ...message.toJSON(),
                creator: { id: message.creator_id.toString() },
                creator_id: undefined,
              },
            }))
            .slice(0, 10),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: expect.any(String),
            endCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              orderDirection: 'ASC',
            },
          },
          validAccessToken
        );
        const messageConnection = result.data.messages;

        // Assert
        expect(messageConnection).toEqual(expectedMessageConnection);
      });
    });

    describe('else if the user queries the first 5 messages by desc date', () => {
      it('should return the first 5 messages', async () => {
        // Define expected query result
        const expectedMessageConnection = {
          edges: validMessages
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
            .map((message) => ({
              cursor: expect.any(String),
              node: {
                ...message.toJSON(),
                creator: { id: message.creator_id.toString() },
                creator_id: undefined,
              },
            }))
            .slice(0, 5),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: expect.any(String),
            endCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              first: 5,
            },
          },
          validAccessToken
        );
        const messageConnection = result.data.messages;

        // Assert
        expect(messageConnection).toEqual(expectedMessageConnection);
      });
    });

    describe('else if the user queries the next 5 messages after the first 10 by desc date', () => {
      let cursor: string;

      beforeEach(async () => {
        const messageConnection = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              first: 10,
            },
          },
          validAccessToken
        );
        cursor = messageConnection.data.messages.pageInfo.endCursor;
      });

      it('should return the next 5 messages', async () => {
        // Define expected message connection
        const expectedMessageConnection = {
          edges: validMessages
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
            .slice(10, 15)
            .map((message) => ({
              cursor: expect.any(String),
              node: {
                ...message.toJSON(),
                creator: { id: message.creator_id.toString() },
                creator_id: undefined,
              },
            })),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: true,
            startCursor: expect.any(String),
            endCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              first: 5,
              after: cursor,
            },
          },
          validAccessToken
        );
        const messageConnection = result.data.messages;

        // Assert
        expect(messageConnection).toEqual(expectedMessageConnection);
      });
    });

    describe('else if the user queries the previous 5 messages before the first 10 by desc date', () => {
      let cursor: string;

      beforeEach(async () => {
        const messageConnection = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              first: 10,
            },
          },
          validAccessToken
        );
        cursor = messageConnection.data.messages.pageInfo.endCursor;
      });

      it('should return the previous 5 messages', async () => {
        // Define expected message connection
        const expectedMessageConnection = {
          edges: validMessages
            .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
            .slice(-9, -4)
            .map((message) => ({
              cursor: expect.any(String),
              node: {
                ...message.toJSON(),
                creator: { id: message.creator_id.toString() },
                creator_id: undefined,
              },
            })),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: true,
            startCursor: expect.any(String),
            endCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_MESSAGES,
          {
            query: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              orderDirection: 'ASC',
              first: 5,
              after: cursor,
            },
          },
          validAccessToken
        );
        const messageConnection = result.data.messages;

        // Assert
        expect(messageConnection).toEqual(expectedMessageConnection);
      });
    });
  });
});
