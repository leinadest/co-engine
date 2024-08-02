import mongoose from 'mongoose';

import connectToMongo from '../../../src/config/mongo';
import sequelize from '../../../src/config/sequelize';
import { Chat, ChatUser, Message, User } from '../../../src/resources';
import { executeOperation } from '../helpers';
import AuthService from '../../../src/services/authService';
import { type IMessageJSON } from '../../../src/resources/message/model';

describe('Message Mutations Integration Tests', () => {
  const CREATE_MESSAGE = `
		mutation($message: CreateMessageInput!) {
			createMessage(message: $message) {
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
		}`;

  const EDIT_MESSAGE = `
		mutation($messageId: ID!, $content: String!) {
			editMessage(messageId: $messageId, content: $content) {
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
		}`;

  let validUser: User;
  let validContext: Chat;
  let validMessage: IMessageJSON;
  let validChatUser: ChatUser;
  let validAccessToken: string;

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

    let rawValidMessage;
    [validUser, rawValidMessage] = await Promise.all([
      User.create({
        username: 'test',
      }),
      Message.create({
        context_type: 'chat',
        context_id: 1,
        creator_id: 1,
        content: 'test content',
      }),
    ]);

    validContext = await Chat.create({ creator_id: validUser.id });
    validMessage = rawValidMessage.toJSON<IMessageJSON>();
    validChatUser = await ChatUser.create({
      chat_id: validContext.id,
      user_id: validUser.id,
    });
    validAccessToken = AuthService.createAccessToken(validUser.id).accessToken;
  });

  afterAll(async () => {
    await Promise.all([sequelize.close(), mongoose.disconnect()]);
  });

  describe('createMessage', () => {
    describe('if message arguments are invalid', () => {
      let invalidCases: any[];

      beforeEach(async () => {
        invalidCases = [
          {
            message: {
              contextType: 0,
            },
            expectedError: [
              'Variable "$message" got invalid value 0 at "message.contextType"; String cannot represent a non string value: 0',
              'BAD_USER_INPUT',
            ],
          },
          {
            message: {
              contextType: 'a',
              contextId: 0,
            },
            expectedError: [
              'Variable "$message" got invalid value 0 at "message.contextId"; String cannot represent a non string value: 0',
              'BAD_USER_INPUT',
            ],
          },
          {
            message: {
              contextType: 'a',
              contextId: validContext.id.toString(),
              content: 0,
            },
            expectedError: [
              'Variable "$message" got invalid value 0 at "message.content"; String cannot represent a non string value: 0',
              'BAD_USER_INPUT',
            ],
          },
          {
            message: {
              contextType: 'a',
              contextId: validContext.id.toString(),
              content: validMessage.content,
            },
            expectedError: [
              'Context must be either chat or channel',
              'BAD_USER_INPUT',
            ],
          },
          {
            message: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              content: '',
            },
            expectedError: ['Content is required', 'BAD_USER_INPUT'],
          },
          {
            message: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              content: 'a'.repeat(10001),
            },
            expectedError: [
              'Content must be at most 10000 characters long',
              'BAD_USER_INPUT',
            ],
          },
        ];
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const results = await Promise.all(
          invalidCases.map(
            async ({ message }) =>
              await executeOperation(CREATE_MESSAGE, { message })
          )
        );
        const errors = results.map(
          (result) => result.errors !== null && result.errors[0]
        );

        // Assert
        errors.forEach((error, index) => {
          expect(error).toBeTruthy();
          expect(error.message).toEqual(invalidCases[index].expectedError[0]);
          expect(error.code).toEqual(invalidCases[index].expectedError[1]);
        });
      });
    });

    describe('else if user is not authenticated', () => {
      const invalidAccessToken = '';

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          CREATE_MESSAGE,
          {
            message: {
              contextType: validMessage.context_type,
              contextId: validContext.id.toString(),
              content: validMessage.content,
            },
          },
          invalidAccessToken
        );
        const error = result.errors !== null && result.errors[0];

        // Assert
        expect(error).toBeTruthy();
        expect(error.message).toEqual('Not authenticated');
        expect(error.code).toEqual('UNAUTHENTICATED');
      });
    });

    describe('else if context does not exist', () => {
      beforeEach(async () => {
        await validContext.destroy();
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          CREATE_MESSAGE,
          {
            message: {
              contextType: validMessage.context_type,
              contextId: validContext.id.toString(),
              content: validMessage.content,
            },
          },
          validAccessToken
        );
        const error = result.errors !== null && result.errors[0];

        // Assert
        expect(error).toBeTruthy();
        expect(error.message).toEqual('User not found in context');
        expect(error.code).toEqual('NOT_FOUND');
      });
    });

    describe('else if user is not in context', () => {
      beforeEach(async () => {
        await validChatUser.destroy();
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          CREATE_MESSAGE,
          {
            message: {
              contextType: 'chat',
              contextId: validContext.id.toString(),
              content: validMessage.content,
            },
          },
          validAccessToken
        );
        const error = result.errors !== null && result.errors[0];

        // Assert
        expect(error).toBeTruthy();
        expect(error.message).toEqual('User not found in context');
        expect(error.code).toEqual('NOT_FOUND');
      });
    });

    describe('else', () => {
      it('should create a new message', async () => {
        // Define expected message
        const expectedMessage = {
          id: expect.any(String),
          context_type: validMessage.context_type,
          context_id: validContext.id.toString(),
          creator: { id: validUser.id.toString() },
          formatted_created_at: expect.any(String),
          formatted_edited_at: null,
          content: validMessage.content,
          reactions: [],
        };

        // Execute mutation and get results
        const result = await executeOperation(
          CREATE_MESSAGE,
          {
            message: {
              contextType: validMessage.context_type,
              contextId: validContext.id.toString(),
              content: validMessage.content,
            },
          },
          validAccessToken
        );
        const message = result.data.createMessage;

        // Assert
        expect(message).toEqual(expectedMessage);
      });
    });
  });

  describe('editMessage', () => {
    describe('if message arguments are invalid', () => {
      let invalidCases: any[];

      beforeEach(async () => {
        invalidCases = [
          // Cases where a variable is undefined
          {
            expectedError: [
              'Variable "$messageId" got invalid value undefined; Expected non-nullable type "ID!" not to be null.',
              'BAD_USER_INPUT',
            ],
          },
          {
            messageId: 0,
            expectedError: [
              'Variable "$content" got invalid value undefined; Expected non-nullable type "String!" not to be null.',
              'BAD_USER_INPUT',
            ],
          },
          // Cases where a variable is the wrong type
          {
            messageId: null,
            content: validMessage.content,
            expectedError: [
              'Variable "$messageId" of non-null type "ID!" must not be null.',
              'BAD_USER_INPUT',
            ],
          },
          {
            messageId: validMessage.id,
            content: null,
            expectedError: [
              'Variable "$content" of non-null type "String!" must not be null.',
              'BAD_USER_INPUT',
            ],
          },
          // Cases where a variable fails schema validation
          {
            messageId: validMessage.id,
            content: '',
            expectedError: ['Content is required', 'BAD_USER_INPUT'],
          },
          {
            messageId: validMessage.id,
            content: 'a'.repeat(10001),
            expectedError: [
              'Content must be at most 10000 characters long',
              'BAD_USER_INPUT',
            ],
          },
        ];
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const results = await Promise.all(
          invalidCases.map(
            async ({ messageId, content }) =>
              await executeOperation(EDIT_MESSAGE, { messageId, content })
          )
        );
        const errors = results.map(
          (result) => '0' in result.errors && result.errors[0]
        );

        // Assert
        errors.forEach((error, index) => {
          expect(error).toBeTruthy();
          expect(error.message).toEqual(invalidCases[index].expectedError[0]);
          expect(error.code).toEqual(invalidCases[index].expectedError[1]);
        });
      });
    });

    describe('else if user is not authenticated', () => {
      const invalidAccessToken = '';

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          EDIT_MESSAGE,
          {
            messageId: validMessage.id.toString(),
            content: validMessage.content,
          },
          invalidAccessToken
        );
        const error = '0' in result.errors && result.errors[0];

        // Assert
        expect(error).toBeTruthy();
        expect(error.message).toEqual('Not authenticated');
        expect(error.code).toEqual('UNAUTHENTICATED');
      });
    });

    describe('else if message does not exist', () => {
      beforeEach(async () => {
        await Message.findByIdAndDelete(validMessage.id);
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          EDIT_MESSAGE,
          {
            messageId: validMessage.id.toString(),
            content: validMessage.content,
          },
          validAccessToken
        );
        const error = '0' in result.errors && result.errors[0];

        // Assert
        expect(error).toBeTruthy();
        expect(error.message).toEqual('Message not found');
        expect(error.code).toEqual('NOT_FOUND');
      });
    });

    describe('else if user is not the creator of the message', () => {
      beforeEach(async () => {
        await Message.findByIdAndUpdate(validMessage.id, {
          creator_id: validUser.id + 1,
        });
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          EDIT_MESSAGE,
          {
            messageId: validMessage.id.toString(),
            content: validMessage.content,
          },
          validAccessToken
        );
        const error = '0' in result.errors && result.errors[0];

        // Assert
        expect(error.message).toEqual('Not authorized');
        expect(error.code).toEqual('FORBIDDEN');
      });
    });

    describe('else if context does not exist', () => {
      beforeEach(async () => {
        await validContext.destroy();
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          EDIT_MESSAGE,
          {
            messageId: validMessage.id.toString(),
            content: validMessage.content,
          },
          validAccessToken
        );
        const error = '0' in result.errors && result.errors[0];

        // Assert
        expect(error).toBeTruthy();
        expect(error.message).toEqual('User not found in context');
        expect(error.code).toEqual('NOT_FOUND');
      });
    });

    describe('else if user is not in context', () => {
      beforeEach(async () => {
        await validChatUser.destroy();
      });

      it('should throw an error', async () => {
        // Execute mutation and get results
        const result = await executeOperation(
          EDIT_MESSAGE,
          {
            messageId: validMessage.id.toString(),
            content: validMessage.content,
          },
          validAccessToken
        );
        const error = '0' in result.errors && result.errors[0];

        // Assert
        expect(error).toBeTruthy();
        expect(error.message).toEqual('User not found in context');
        expect(error.code).toEqual('NOT_FOUND');
      });
    });

    describe('else', () => {
      it('should edit message', async () => {
        // Define expected message
        const expectedMessage = {
          id: validMessage.id.toString(),
          context_type: validMessage.context_type,
          context_id: validMessage.context_id.toString(),
          creator: { id: validUser.id.toString() },
          formatted_created_at: validMessage.formatted_created_at,
          formatted_edited_at: expect.any(String),
          content: 'new content',
          reactions: validMessage.reactions,
        };

        // Execute mutation and get results
        const result = await executeOperation(
          EDIT_MESSAGE,
          {
            messageId: validMessage.id.toString(),
            content: 'new content',
          },
          validAccessToken
        );
        const message = result.data.editMessage;

        // Assert
        expect(message).toEqual(expectedMessage);
      });
    });
  });
});
