import mongoose from 'mongoose';

import sequelize from '../../../src/config/sequelize';
import connectToMongo from '../../../src/config/mongo';
import { Chat, ChatUser, Message, User } from '../../../src/resources/';
import { executeOperation } from '../helpers';
import AuthService from '../../../src/services/authService';

describe('Message Queries Integration Tests', () => {
  const GET_MESSAGES = `
    query($query: MessagesInput!) {
      messages(query: $query) {
        context_type
        context_id
        creator_id
        formatted_created_at
        formatted_edited_at
        content
        reactions {
          reactor_id
          reaction
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
    let validContextUser: ChatUser;
    let validAccessToken: string;

    beforeEach(async () => {
      [validUser, validContext] = await Promise.all([
        User.create({ username: 'test' }),
        Chat.create({ name: 'test' }),
        Message.create({
          context_type: 'chat',
          context_id: 1,
          creator_id: 1,
          content: 'test content',
        }),
      ]);

      validContextUser = await ChatUser.create({
        chat_id: 1,
        user_id: 1,
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

    describe('else', () => {
      it('should return a list of messages', async () => {
        // Define expected query result
        const expectedMessage = {
          context_type: 'chat',
          context_id: validContext.id.toString(),
          creator_id: validUser.id.toString(),
          formatted_created_at: expect.any(String),
          formatted_edited_at: null,
          content: 'test content',
          reactions: [],
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

        // Assert
        expect(result.data.messages).toContainEqual(expectedMessage);
      });
    });
  });
});
