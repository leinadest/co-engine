import { Chat, ChatUser, User, UserBlock } from '../../../src/resources';
import sequelize from '../../../src/config/sequelize';
import AuthService from '../../../src/services/authService';
import { executeOperation } from '../helpers';
import { encodeCursor } from '../../../src/utils/pagination';

describe('Chat Queries Integration Tests', () => {
  const GET_CHATS = `
    query ($query: ChatsInput) {
      chats(query: $query) {
        edges {
          cursor
          node {
            id
            name
            picture
            last_message_at
            last_message
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
      }
    }
    `;

  const GET_CHAT = `
    query ($id: ID!) {
      chat(id: $id) {
        id
        creator_id
        created_at
        name
        picture
        last_message_at
        last_message
        users {
          id
          username
          discriminator
          profile_pic
        }
      }
    } 
  `;

  // Load users with user #1 as the authenticated user
  let users: User[];
  let userAccessToken: string;
  const loadUsers = async (): Promise<void> => {
    users = await User.bulkCreate(
      Array.from({ length: 20 }, () => ({ username: 'test' }))
    );
    userAccessToken = AuthService.createAccessToken(users[0].id).accessToken;
  };

  // Load 40 chats, half differing in name, with user #1 as the creator
  let chats: Chat[];
  let chatUsers: ChatUser[];
  const loadChats = async (): Promise<void> => {
    chats = await Chat.bulkCreate([
      ...Array.from({ length: 20 }, () => ({
        creator_id: users[0].id,
        name: `test${Math.random() * 1000}`,
        picture: 'test',
        last_message_at: new Date(Math.random() * 1000000),
        last_message: 'test',
      })),
      ...Array.from({ length: 20 }, () => ({
        creator_id: users[0].id,
        name: `testdifferent${Math.random() * 1000}`,
        picture: 'test',
        last_message_at: new Date(Math.random() * 1000000),
        last_message: 'test',
      })),
    ]);
    chatUsers = await ChatUser.bulkCreate(
      chats.map((chat) => ({ chat_id: chat.id, user_id: users[0].id }))
    );
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

  describe('chats', () => {
    describe('if argument "query" is not of type "ChatsInput!"', () => {
      const invalidCases: Array<{ query: any; expectedError: any }> = [
        // Check types
        {
          query: { search: 0 },
          expectedError: {
            message:
              'Variable "$query" got invalid value 0 at "query.search"; String cannot represent a non string value: 0',
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
          query: { after: 0 },
          expectedError: {
            message:
              'Variable "$query" got invalid value 0 at "query.after"; String cannot represent a non string value: 0',
          },
        },
        {
          query: { first: 'a' },
          expectedError: {
            message:
              'Variable "$query" got invalid value "a" at "query.first"; Int cannot represent non-integer value: "a"',
          },
        },
        // Check schema validation
        {
          query: { orderBy: 'a' },
          expectedError: {
            message: 'orderBy must be last_message_at, name, or created_at',
          },
        },
        {
          query: { orderDirection: 'a' },
          expectedError: { message: 'orderDirection must be ASC or DESC' },
        },
        {
          query: { first: 0 },
          expectedError: {
            message: 'first must be greater than or equal to 1',
          },
        },
      ];
      invalidCases.forEach(({ expectedError }) => {
        expectedError.code = 'BAD_USER_INPUT';
        expectedError.stack = expect.any(String);
      });

      it('should throw an error', async () => {
        // Execute query and get results
        const results = await Promise.all(
          invalidCases.map(
            async (invalidCase) =>
              await executeOperation(
                GET_CHATS,
                { query: invalidCase.query },
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
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_CHATS, {});
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User queries for first 10 chats ordered by descending last_message_at', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadChats();
      });

      it('should return chats', async () => {
        // Define expected chat connection
        const expectedChatConnection = {
          edges: chats
            .sort(
              (a, b) =>
                b.last_message_at?.getTime() - a.last_message_at?.getTime()
            )
            .slice(0, 10)
            .map((chat) => ({
              cursor: encodeCursor(chat.last_message_at),
              node: {
                ...chat.toJSON(),
                id: chat.id.toString(),
                last_message_at: chat.last_message_at?.toISOString() ?? null,
                creator_id: undefined,
                created_at: undefined,
              },
            })),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            endCursor: expect.any(String),
            startCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(GET_CHATS, {}, userAccessToken);
        const chatConnection = result.data.chats;

        // Assert
        expect(chatConnection).toEqual(expectedChatConnection);
      });
    });

    describe('else if User queries 100 chats and there are chats from a blocked user', () => {
      let blockedUser: User;
      let blockedUserUnblockedChat: Chat;
      let blockedUserBlockedChat: Chat;

      beforeEach(async () => {
        await loadUsers();
        await loadChats();

        blockedUser = users[1];

        blockedUserUnblockedChat = await Chat.create({
          name: 'unblocked chat',
          creator_id: blockedUser.id,
          last_message_at: new Date(),
        });

        await UserBlock.create({
          user_id: users[0].id,
          blocked_user_id: blockedUser.id,
        });

        blockedUserBlockedChat = await Chat.create({
          name: 'blocked chat',
          creator_id: blockedUser.id,
          last_message_at: new Date(),
        });

        await ChatUser.bulkCreate([
          {
            chat_id: blockedUserUnblockedChat.id,
            user_id: users[0].id,
          },
          {
            chat_id: blockedUserBlockedChat.id,
            user_id: users[0].id,
          },
        ]);
      });

      it('should not return chats made after the creator is blocked', async () => {
        // Define expected chat connection
        const expectedChatConnection = {
          edges: [...chats, blockedUserUnblockedChat]
            .sort(
              (a, b) =>
                b.last_message_at?.getTime() - a.last_message_at?.getTime()
            )
            .map((chat) => ({
              cursor: encodeCursor(chat.last_message_at),
              node: {
                ...chat.toJSON(),
                id: chat.id.toString(),
                last_message_at: chat.last_message_at?.toISOString() ?? null,
                creator_id: undefined,
                created_at: undefined,
              },
            })),
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            endCursor: expect.any(String),
            startCursor: expect.any(String),
          },
        };
        const unexpectedChatNode = {
          ...blockedUserBlockedChat.toJSON(),
          id: blockedUserBlockedChat.id.toString(),
          last_message_at:
            blockedUserBlockedChat.last_message_at?.toISOString() ?? null,
          creator_id: undefined,
          created_at: undefined,
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_CHATS,
          { query: { first: 100 } },
          userAccessToken
        );
        const chatConnection = result.data.chats;

        // Assert
        expect(chatConnection).toEqual(expectedChatConnection);
        expect(chatConnection.edges).not.toContainEqual(unexpectedChatNode);
      });
    });

    describe('else if User queries for first 4 chats ordered by ascending name and searches "different"', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadChats();
      });

      it('should return chats', async () => {
        // Define expected chat connection
        const expectedChatConnection = {
          edges: chats
            .filter((chat) => chat.name.includes('different'))
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, 4)
            .map((chat) => ({
              cursor: encodeCursor(chat.name),
              node: {
                ...chat.toJSON(),
                id: chat.id.toString(),
                last_message_at: chat.last_message_at?.toISOString() ?? null,
                creator_id: undefined,
                created_at: undefined,
              },
            })),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            endCursor: expect.any(String),
            startCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_CHATS,
          {
            query: {
              search: 'different',
              orderBy: 'name',
              orderDirection: 'ASC',
              first: 4,
            },
          },
          userAccessToken
        );
        const chatConnection = result.data.chats;

        // Assert
        expect(chatConnection).toEqual(expectedChatConnection);
      });
    });

    describe('else if User queries for next 4 chats ordered by ascending name and searches "different"', () => {
      let cursor: string;

      beforeEach(async () => {
        await loadUsers();
        await loadChats();

        const fourthChat = chats
          .filter((chat) => chat.name.includes('different'))
          .sort((a, b) => a.name.localeCompare(b.name))[3];
        cursor = encodeCursor(fourthChat.name);
      });

      it('should return chats', async () => {
        // Define expected chat connection
        const expectedChatConnection = {
          edges: chats
            .filter((chat) => chat.name.includes('different'))
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(4, 8)
            .map((chat) => ({
              cursor: encodeCursor(chat.name),
              node: {
                ...chat.toJSON(),
                id: chat.id.toString(),
                last_message_at: chat.last_message_at?.toISOString() ?? null,
                creator_id: undefined,
                created_at: undefined,
              },
            })),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: true,
            endCursor: expect.any(String),
            startCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_CHATS,
          {
            query: {
              search: 'different',
              orderBy: 'name',
              orderDirection: 'ASC',
              after: cursor,
              first: 4,
            },
          },
          userAccessToken
        );
        const chatConnection = result.data.chats;

        // Assert
        expect(chatConnection).toEqual(expectedChatConnection);
      });
    });
  });

  describe('chat', () => {
    describe('if User is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_CHAT, { id: chats[0].id });
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User queries for chat with id 1', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadChats();
      });

      it('should return chat', async () => {
        // Initialize test data
        const chatOne = chats[0];
        const chatOneUsers = chatUsers.filter(
          (chatUser) => chatUser.chat_id === chatOne.id
        );
        const usersOfChatOne = chatOneUsers.map((chatUser) => {
          const user = users[chatUser.user_id - 1];
          return {
            id: user.id.toString(),
            username: user.username,
            discriminator: user.discriminator,
            profile_pic: user.profile_pic,
          };
        });

        // Define expected chat
        const expectedChat = {
          ...chatOne.toJSON(),
          id: chatOne.id.toString(),
          creator_id: chatOne.creator_id.toString(),
          created_at: chatOne.created_at.toISOString(),
          last_message_at: chatOne.last_message_at?.toISOString() ?? null,
          users: usersOfChatOne,
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_CHAT,
          { id: chatOne.id },
          userAccessToken
        );
        const chat = result.data.chat;

        // Assert
        expect(chat).toEqual(expectedChat);
      });
    });
  });
});
