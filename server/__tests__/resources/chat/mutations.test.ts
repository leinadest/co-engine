/* eslint-disable @typescript-eslint/naming-convention */
import { Chat, ChatUser, User } from '../../../src/resources';
import { sequelize } from '../../../src/config/sequelize';
import AuthService from '../../../src/services/authService';
import { executeOperation } from '../helpers';

describe('Chat Mutations Integration Tests', () => {
  const CREATE_CHAT = `
		mutation($name: String!, $picture: String) {
			createChat(name: $name, picture: $picture) {
				id
				created_at
				name
				picture
				last_message_at
				last_message
			}
		}`;

  const DELETE_CHAT = `
		mutation($chatId: ID!) {
			deleteChat(chatId: $chatId) {
				id
				created_at
				name
				picture
				last_message_at
				last_message
			}
		}`;

  const ADD_USER_TO_CHAT = `
    mutation($chatId: ID!, $userId: ID!) {
			addUserToChat(chatId: $chatId, userId: $userId) {
				chat_id
				user_id
				is_creator
			}
    }`;

  const REMOVE_USER_FROM_CHAT = `
		mutation($chatId: ID!, $userId: ID!) {
			removeUserFromChat(chatId: $chatId, userId: $userId) {
				chat_id
				user_id
				is_creator
			}
		}`;

  const chatData = {
    name: 'test_name',
    picture: 'test_picture',
  };

  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: true });
    } catch (e) {
      console.log(e);
    }
  });

  beforeEach(async () => {
    try {
      await sequelize.truncate({ cascade: true, restartIdentity: true });
    } catch (e) {
      console.log(e);
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('createChat', () => {
    describe('given the name argument is invalid', () => {
      describe('and it is less than 1 character long', () => {
        it('should throw an error', async () => {
          // Define expectations
          const expectedMessage = 'Chat name must be at least 1 character long';
          const expectedCode = 'BAD_USER_INPUT';

          // Execute mutation and get result
          const result = await executeOperation(CREATE_CHAT, {
            name: '',
            picture: chatData.picture,
          });
          const error = result.errors[0];

          // Assert
          expect(error.message).toEqual(expectedMessage);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });

      describe('and it is more than 30 characters long', () => {
        it('should throw an error', async () => {
          // Define expectations
          const expectedMessage =
            'Chat name must be at most 30 characters long';
          const expectedCode = 'BAD_USER_INPUT';

          // Execute mutation and get result
          const result = await executeOperation(CREATE_CHAT, {
            name: 'a'.repeat(31),
            picture: chatData.picture,
          });
          const error = result.errors[0];

          // Assert
          expect(error.message).toEqual(expectedMessage);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });
    });

    describe('given the name argument is valid', () => {
      describe('and the user is not authenticated', () => {
        it('should throw an error', async () => {
          // Define expectations
          const expectedMessage = 'Not authenticated';
          const expectedCode = 'UNAUTHENTICATED';

          // Execute mutation and get result
          const result = await executeOperation(CREATE_CHAT, chatData);
          const error = result.errors[0];

          // Assert
          expect(error.message).toEqual(expectedMessage);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });

      describe('and the user is authenticated', () => {
        let user: User, accessToken: string;

        beforeEach(async () => {
          user = await User.create({ username: 'test_username' });
          accessToken = AuthService.createAccessToken(user.id).accessToken;
        });

        describe('and the transaction fails', () => {
          it('should throw an error', async () => {
            // Set up mock
            jest.spyOn(sequelize, 'transaction').mockImplementationOnce(() => {
              throw new Error('Test error');
            });

            // Define expected error
            const expectedMessage = 'Test error';
            const expectedCode = 'BAD_USER_INPUT';

            // Execute mutation and get results
            const result = await executeOperation(
              CREATE_CHAT,
              chatData,
              accessToken
            );
            const error = result.errors[0];

            // Assert
            expect(error.message).toEqual(expectedMessage);
            expect(error.extensions.code).toEqual(expectedCode);
          });
        });

        describe('and the transaction succeeds', () => {
          it('should create a chat and a chat user with user as creator', async () => {
            // Define expected mutation result
            const expectedResult = {
              ...chatData,
              id: '1',
              created_at: expect.any(String),
              last_message_at: null,
              last_message: null,
            };

            // Execute mutation and get results
            const result = await executeOperation(
              CREATE_CHAT,
              chatData,
              accessToken
            );
            const chatUser = await ChatUser.findOne({
              where: { chat_id: 1, user_id: user.id },
            });

            // Assert
            expect(result.data.createChat).toEqual(expectedResult);
            expect(chatUser?.is_creator).toBe(true);
          });
        });
      });
    });
  });

  describe('deleteChat', () => {
    describe('given the user is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedMessage = 'Not authenticated';
        const expectedCode = 'UNAUTHENTICATED';

        // Execute mutation and get results
        const result = await executeOperation(DELETE_CHAT, { chatId: '1' });
        const error = result.errors[0];

        // Assert
        expect(error.message).toEqual(expectedMessage);
        expect(error.extensions.code).toEqual(expectedCode);
      });
    });

    describe('given the user is authenticated', () => {
      let user: User, accessToken: string;

      beforeEach(async () => {
        user = await User.create({ username: 'test_username' });
        accessToken = AuthService.createAccessToken(user.id).accessToken;
      });

      describe('and the chat does not exist', () => {
        it('should throw an error', async () => {
          // Define expected error
          const expectedMessage = 'Chat not found';
          const expectedCode = 'NOT_FOUND';

          // Execute mutation and get results
          const result = await executeOperation(
            DELETE_CHAT,
            { chatId: '1' },
            accessToken
          );
          const error = result.errors[0];

          // Assert
          expect(error.message).toEqual(expectedMessage);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });

      describe('and the chat does exist', () => {
        let chat: Chat;

        beforeEach(async () => {
          chat = await Chat.create(chatData);
        });

        describe('and the user is not the creator', () => {
          it('should throw an error', async () => {
            // Define expected error
            const expectedMessage = 'Only the creator can delete the chat';
            const expectedCode = 'BAD_USER_INPUT';

            // Execute mutation and get results
            const result = await executeOperation(
              DELETE_CHAT,
              { chatId: chat.id },
              accessToken
            );
            const error = result.errors[0];

            // Assert
            expect(error.message).toEqual(expectedMessage);
            expect(error.extensions.code).toEqual(expectedCode);
          });
        });

        describe('and the user is the creator', () => {
          beforeEach(async () => {
            await ChatUser.create({
              chat_id: chat.id,
              user_id: user.id,
              is_creator: true,
            });
          });

          describe('and the transaction fails', () => {
            it('should throw an error', async () => {
              // Set up mock
              jest
                .spyOn(sequelize, 'transaction')
                .mockImplementationOnce(() => {
                  throw new Error('Test error');
                });

              // Define expected error
              const expectedMessage = 'Test error';
              const expectedCode = 'BAD_USER_INPUT';

              // Execute mutation and get results
              const result = await executeOperation(
                DELETE_CHAT,
                { chatId: chat.id },
                accessToken
              );
              const error = result.errors[0];

              // Assert
              expect(error.message).toEqual(expectedMessage);
              expect(error.extensions.code).toEqual(expectedCode);
            });
          });

          describe('and the transaction succeeds', () => {
            it('should delete the chat and the chat user', async () => {
              // Define expected mutation result
              const expectedResult = {
                ...chat.get({ plain: true }),
                id: chat.id.toString(),
                created_at: chat.created_at.toISOString(),
                last_message_at: null,
                last_message: null,
              };

              // Execute mutation and get results
              const result = await executeOperation(
                DELETE_CHAT,
                { chatId: chat.id },
                accessToken
              );
              const chatUser = await ChatUser.findOne({
                where: { chat_id: chat.id, user_id: user.id },
              });

              // Assert
              expect(result.data.deleteChat).toEqual(expectedResult);
              expect(chatUser).toBeNull();
            });
          });
        });
      });
    });
  });

  describe('addUserToChat', () => {
    describe('given the user is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedMessage = 'Not authenticated';
        const expectedCode = 'UNAUTHENTICATED';

        // Execute mutation and get results
        const result = await executeOperation(ADD_USER_TO_CHAT, {
          chatId: '1',
          userId: '1',
        });
        const error = result.errors[0];

        // Assert
        expect(error.message).toEqual(expectedMessage);
        expect(error.extensions.code).toEqual(expectedCode);
      });
    });

    describe('given the user is authenticated', () => {
      let user: User, accessToken: string;

      beforeEach(async () => {
        user = await User.create({ username: 'test_username' });
        accessToken = AuthService.createAccessToken(user.id).accessToken;
      });

      describe('and the other user does not exist', () => {
        it('should throw an error', async () => {
          // Define expected error
          const expectedMessage = 'User not found';
          const expectedCode = 'NOT_FOUND';

          // Execute mutation and get results
          const result = await executeOperation(
            ADD_USER_TO_CHAT,
            { chatId: '1', userId: '2' },
            accessToken
          );
          const error = result.errors[0];

          // Assert
          expect(error.message).toEqual(expectedMessage);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });

      describe('and the other user exists', () => {
        let otherUser: User;

        beforeEach(async () => {
          otherUser = await User.create({ username: 'test_username2' });
        });

        describe('and the chat does not exist', () => {
          it('should throw an error', async () => {
            // Define expected error
            const expectedMessage = 'Chat not found';
            const expectedCode = 'NOT_FOUND';

            // Execute mutation and get results
            const result = await executeOperation(
              ADD_USER_TO_CHAT,
              { chatId: '1', userId: '2' },
              accessToken
            );
            const error = result.errors[0];

            // Assert
            expect(error.message).toEqual(expectedMessage);
            expect(error.extensions.code).toEqual(expectedCode);
          });
        });

        describe('and the chat exists', () => {
          let chat: Chat;

          beforeEach(async () => {
            chat = await Chat.create(chatData);
          });

          describe('and the other user is already in the chat', () => {
            beforeEach(async () => {
              await ChatUser.create({
                chat_id: chat.id,
                user_id: otherUser.id,
                is_creator: false,
              });
            });

            it('should throw an error', async () => {
              // Define expected error
              const expectedMessage = 'User already in chat';
              const expectedCode = 'BAD_USER_INPUT';

              // Execute mutation and get results
              const result = await executeOperation(
                ADD_USER_TO_CHAT,
                { chatId: chat.id, userId: otherUser.id },
                accessToken
              );
              const error = result.errors[0];

              // Assert
              expect(error.message).toEqual(expectedMessage);
              expect(error.extensions.code).toEqual(expectedCode);
            });
          });

          describe('and the other user is not already in the chat', () => {
            it('should add a user to a chat', async () => {
              // Define expected mutation result
              const expectedResult = {
                chat_id: chat.id.toString(),
                user_id: otherUser.id.toString(),
                is_creator: false,
              };

              // Execute mutation and get results
              const result = await executeOperation(
                ADD_USER_TO_CHAT,
                { chatId: chat.id, userId: otherUser.id },
                accessToken
              );

              // Assert
              expect(result.data.addUserToChat).toEqual(expectedResult);
            });
          });
        });
      });
    });
  });

  describe('removeUserFromChat', () => {
    describe('given the user is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedMessage = 'Not authenticated';
        const expectedCode = 'UNAUTHENTICATED';

        // Execute mutation and get results
        const result = await executeOperation(REMOVE_USER_FROM_CHAT, {
          chatId: '1',
          userId: '1',
        });
        const error = result.errors[0];

        // Assert
        expect(error.message).toEqual(expectedMessage);
        expect(error.extensions.code).toEqual(expectedCode);
      });
    });

    describe('given the user is authenticated', () => {
      let user: User, accessToken: string;

      beforeEach(async () => {
        user = await User.create({ username: 'test_username' });
        accessToken = AuthService.createAccessToken(user.id).accessToken;
      });

      describe('and the chat does not exist', () => {
        it('should throw an error', async () => {
          // Define expected error
          const expectedMessage = 'Chat not found';
          const expectedCode = 'NOT_FOUND';

          // Execute mutation and get results
          const result = await executeOperation(
            REMOVE_USER_FROM_CHAT,
            { chatId: '1', userId: '2' },
            accessToken
          );
          const error = result.errors[0];

          // Assert
          expect(error.message).toEqual(expectedMessage);
          expect(error.extensions.code).toEqual(expectedCode);
        });
      });

      describe('and the chat exists', () => {
        let chat: Chat;

        beforeEach(async () => {
          chat = await Chat.create(chatData);
        });

        describe('and the user is not the creator', () => {
          it('should throw an error', async () => {
            // Define expected error
            const expectedMessage =
              'Only the creator can remove users from the chat';
            const expectedCode = 'BAD_USER_INPUT';

            // Execute mutation and get results
            const result = await executeOperation(
              REMOVE_USER_FROM_CHAT,
              { chatId: '1', userId: '2' },
              accessToken
            );
            const error = result.errors[0];

            // Assert
            expect(error.message).toEqual(expectedMessage);
            expect(error.extensions.code).toEqual(expectedCode);
          });
        });

        describe('and the user is the creator', () => {
          beforeEach(async () => {
            await ChatUser.create({
              chat_id: chat.id,
              user_id: user.id,
              is_creator: true,
            });
          });

          describe('and the other user does not exist in chat', () => {
            it('should throw an error', async () => {
              // Define expected error
              const expectedMessage = 'User not found in chat';
              const expectedCode = 'NOT_FOUND';

              // Execute mutation and get results
              const result = await executeOperation(
                REMOVE_USER_FROM_CHAT,
                { chatId: '1', userId: '2' },
                accessToken
              );
              const error = result.errors[0];

              // Assert
              expect(error.message).toEqual(expectedMessage);
              expect(error.extensions.code).toEqual(expectedCode);
            });
          });

          describe('and the other user exists in chat', () => {
            let otherUser: User;

            beforeEach(async () => {
              otherUser = await User.create({ username: 'test_username2' });
              await ChatUser.create({
                chat_id: chat.id,
                user_id: otherUser.id,
              });
            });

            it('should remove a user from a chat', async () => {
              // Define expected mutation result
              const expectedResult = {
                chat_id: chat.id.toString(),
                user_id: otherUser.id.toString(),
                is_creator: false,
              };

              // Execute mutation and get results
              const result = await executeOperation(
                REMOVE_USER_FROM_CHAT,
                { chatId: chat.id, userId: otherUser.id },
                accessToken
              );

              // Assert
              expect(result.data.removeUserFromChat).toEqual(expectedResult);
            });
          });
        });
      });
    });
  });
});
