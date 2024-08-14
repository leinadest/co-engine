import gql from 'graphql-tag';

import { executeOperation } from '../helpers';
import { User, UserBlock, UserFriendship } from '../../../src/resources';
import {
  PublicUserFields,
  PublicUserConnectionFields,
  UserFields,
} from '../../../src/resources/user/schema';
import AuthService from '../../../src/services/authService';
import { encodeCursor } from '../../../src/utils/pagination';
import sequelize from '../../../src/config/sequelize';

describe('User Queries Integration Tests', () => {
  const GET_USERS = gql`
    ${PublicUserConnectionFields}
    query ($query: UsersInput) {
      users(query: $query) {
        ...PublicUserConnectionFields
      }
    }
  `;

  const GET_USER = gql`
    ${PublicUserFields}
    query ($id: ID!) {
      user(id: $id) {
        ...PublicUserFields
      }
    }
  `;

  const GET_ME = gql`
    ${UserFields}
    query {
      me {
        ...UserFields
      }
    }
  `;

  const GET_FRIENDS = gql`
    ${PublicUserConnectionFields}
    query ($query: UsersInput) {
      friends(query: $query) {
        ...PublicUserConnectionFields
      }
    }
  `;

  const GET_BLOCKED_USERS = gql`
    ${PublicUserConnectionFields}
    query ($query: UsersInput) {
      blocked(query: $query) {
        ...PublicUserConnectionFields
      }
    }
  `;

  // Load users with user #1 as the authenticated user
  let users: User[];
  let userAccessToken: string;
  const loadUsers = async (): Promise<void> => {
    users = await User.bulkCreate([
      ...Array.from({ length: 20 }, () => ({
        username: `test${Math.floor(Math.random() * 100000)}`,
        created_at: Math.random() * 1000000,
      })),
      ...Array.from({ length: 20 }, () => ({
        username: `testdifferent${Math.floor(Math.random() * 100000)}`,
        created_at: Math.random() * 1000000,
      })),
    ]);
    userAccessToken = AuthService.createAccessToken(users[0].id).accessToken;
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

  describe('users', () => {
    beforeEach(loadUsers);

    describe('if User queries for first 10 users by ascending username', () => {
      it('should return users', async () => {
        // Define expected user
        const expectedUserConnection = {
          edges: users
            .sort((a, b) => a.username.localeCompare(b.username))
            .slice(0, 10)
            .map((user) => {
              const cursor = expect.any(String);
              const node = {
                ...user.get({ plain: true }),
                id: user.id.toString(),
                created_at: user.created_at.toISOString(),
              };
              delete node.email;
              delete node.password_hash;
              return { cursor, node };
            }),
          pageInfo: {
            startCursor: expect.any(String),
            endCursor: expect.any(String),
            hasNextPage: true,
            hasPreviousPage: false,
          },
        };

        // Execute query and get results
        const result = await executeOperation(GET_USERS);
        const userConnection = result.data.users;

        // Assert
        expect(userConnection).toEqual(expectedUserConnection);
      });
    });

    describe('else if User queries for first 5 users by descending created_at', () => {
      it('should return users', async () => {
        // Define expected user
        const expectedUserConnection = {
          edges: users
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
            .slice(0, 5)
            .map((user) => {
              const cursor = expect.any(String);
              const node = {
                ...user.get({ plain: true }),
                id: user.id.toString(),
                created_at: user.created_at.toISOString(),
              };
              delete node.email;
              delete node.password_hash;
              return { cursor, node };
            }),
          pageInfo: {
            startCursor: expect.any(String),
            endCursor: expect.any(String),
            hasNextPage: true,
            hasPreviousPage: false,
          },
        };

        // Execute query and get results
        const result = await executeOperation(GET_USERS, {
          query: { orderBy: 'created_at', orderDirection: 'DESC', first: 5 },
        });
        const userConnection = result.data.users;

        // Assert
        expect(userConnection).toEqual(expectedUserConnection);
      });
    });

    describe('else if User queries for the next 5 users by descending created_at', () => {
      let cursor: string;

      beforeEach(async () => {
        const fifthUser = users.sort(
          (a, b) => b.created_at.getTime() - a.created_at.getTime()
        )[4];
        cursor = encodeCursor(fifthUser.created_at);
      });

      it('should return users', async () => {
        // Define expected user
        const expectedUserConnection = {
          edges: users
            .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
            .slice(5, 10)
            .map((user) => {
              const cursor = expect.any(String);
              const node = {
                ...user.get({ plain: true }),
                id: user.id.toString(),
                created_at: user.created_at.toISOString(),
              };
              delete node.email;
              delete node.password_hash;
              return { cursor, node };
            }),
          pageInfo: {
            startCursor: expect.any(String),
            endCursor: expect.any(String),
            hasNextPage: true,
            hasPreviousPage: true,
          },
        };

        // Execute query and get results
        const result = await executeOperation(GET_USERS, {
          query: {
            orderBy: 'created_at',
            orderDirection: 'DESC',
            after: cursor,
            first: 5,
          },
        });
        const userConnection = result.data.users;

        // Assert
        expect(userConnection).toEqual(expectedUserConnection);
      });
    });
  });

  describe('user', () => {
    describe('if the specified user ID is not of type ID', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Variable "$id" of non-null type "ID!" must not be null.',
          code: 'BAD_USER_INPUT',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_USER, { id: null });
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User is not found', () => {
      const invalidUserId = 0;

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'User not found',
          code: 'NOT_FOUND',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_USER, { id: invalidUserId });
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else', () => {
      beforeEach(loadUsers);

      it('should return the specified user', async () => {
        // Define expected user
        const expectedUser = {
          ...users[0].get({ plain: true }),
          id: users[0].id.toString(),
          created_at: users[0].created_at.toISOString(),
          email: undefined,
          password_hash: undefined,
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_USER,
          { id: users[0].id },
          userAccessToken
        );
        const user = result.data.user;

        // Assert
        expect(user).toEqual(expectedUser);
      });
    });
  });

  describe('me', () => {
    describe('if User is not authenticated', () => {
      const invalidAccessToken = '';

      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_ME, {}, invalidAccessToken);
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else', () => {
      beforeEach(loadUsers);

      it('should return the authenticated user', async () => {
        // Define expected user
        const expectedUser = {
          ...users[0].get({ plain: true }),
          id: users[0].id.toString(),
          created_at: users[0].created_at.toISOString(),
          last_login_at: users[0].last_login_at?.toISOString() ?? null,
          password_hash: undefined,
        };

        // Execute query and get results
        const result = await executeOperation(GET_ME, {}, userAccessToken);
        const user = result.data.me;

        // Assert
        expect(user).toEqual(expectedUser);
      });
    });
  });

  describe('friends', () => {
    let userFriends: User[] = [];
    const loadFriendships = async (): Promise<void> => {
      userFriends = [];
      const data = [];
      for (let i = 1; i < users.length; i += 1) {
        if (i % 2 === 0) continue;
        data.push(
          { user_id: users[0].id, friend_id: users[i].id },
          { user_id: users[i].id, friend_id: users[0].id }
        );
        userFriends.push(users[i]);
      }

      await UserFriendship.bulkCreate(data);
    };

    describe('if User is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_FRIENDS);
        const error = result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User queries first 10 friends by ascending username', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadFriendships();
      });

      it('should return friends', async () => {
        // Define expected friend
        const expectedFriendConnection = {
          edges: userFriends
            .sort((a, b) =>
              a.username.localeCompare(b.username, 'en-US', {
                sensitivity: 'base',
                ignorePunctuation: false,
              })
            )
            .slice(0, 10)
            .map((friend) => ({
              cursor: expect.any(String),
              node: {
                ...friend.get({ plain: true }),
                id: friend.id.toString(),
                created_at: friend.created_at.toISOString(),
                last_login_at: friend.last_login_at?.toISOString() ?? null,
                email: undefined,
                password_hash: undefined,
              },
            })),
          pageInfo: {
            startCursor: expect.any(String),
            endCursor: expect.any(String),
            hasNextPage: true,
            hasPreviousPage: false,
          },
        };

        // Execute query and get results
        const result = await executeOperation(GET_FRIENDS, {}, userAccessToken);
        const friendConnection = result.data.friends;

        // Assert
        expect(friendConnection).toEqual(expectedFriendConnection);
      });
    });

    describe('else if User queries first 4 friends by descending username and searches "different"', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadFriendships();
      });

      it('should return friends', async () => {
        // Expected friend connection
        const expectedFriendConnection = {
          edges: userFriends
            .filter((friend) => friend.username.includes('different'))
            .sort((a, b) => b.username.localeCompare(a.username))
            .slice(0, 4)
            .map((friend) => ({
              cursor: expect.any(String),
              node: {
                ...friend.get({ plain: true }),
                id: friend.id.toString(),
                created_at: friend.created_at.toISOString(),
                last_login_at: friend.last_login_at?.toISOString() ?? null,
                email: undefined,
                password_hash: undefined,
              },
            })),
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: expect.any(String),
            endCursor: expect.any(String),
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_FRIENDS,
          { query: { search: 'different', orderDirection: 'DESC', first: 4 } },
          userAccessToken
        );
        const friendConnection = result.data.friends;

        // Assert
        expect(friendConnection).toEqual(expectedFriendConnection);
      });
    });

    describe('else if User queries next 4 friends by descending username and searches "different"', () => {
      let cursor: string;

      beforeEach(async () => {
        await loadUsers();
        await loadFriendships();

        const fourthUser = userFriends
          .filter((friend) => friend.username.includes('different'))
          .sort((a, b) => b.username.localeCompare(a.username))[3];
        cursor = encodeCursor(fourthUser.username);
      });

      it('should return friends', async () => {
        // Expected friend connection
        const expectedFriendConnection = {
          edges: userFriends
            .filter((friend) => friend.username.includes('different'))
            .sort((a, b) => b.username.localeCompare(a.username))
            .slice(4, 8)
            .map((friend) => ({
              cursor: expect.any(String),
              node: {
                ...friend.get({ plain: true }),
                id: friend.id.toString(),
                created_at: friend.created_at.toISOString(),
                last_login_at: friend.last_login_at?.toISOString() ?? null,
                email: undefined,
                password_hash: undefined,
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
          GET_FRIENDS,
          {
            query: {
              search: 'different',
              orderDirection: 'DESC',
              first: 4,
              after: cursor,
            },
          },
          userAccessToken
        );
        const friendConnection = result.data.friends;

        // Assert
        expect(friendConnection).toEqual(expectedFriendConnection);
      });
    });
  });

  describe('blockedUsers', () => {
    let blockedUsers: User[];
    const blockedDates: Record<number, number> = {};
    const loadBlocks = async (): Promise<void> => {
      blockedUsers = users.filter((user) => user.id % 2 !== 0);

      const data: Array<{
        user_id: number;
        blocked_user_id: number;
        created_at: Date;
      }> = [];

      blockedUsers.forEach((blockedUser) => {
        const blockedAt = new Date(Math.random() * 100000000);
        blockedDates[blockedUser.id] = blockedAt.getTime();
        data.push({
          user_id: users[0].id,
          blocked_user_id: blockedUser.id,
          created_at: blockedAt,
        });
      });

      await UserBlock.bulkCreate(data);
    };

    describe('if User is not authenticated', () => {
      it('should throw an error', async () => {
        // Define expected error
        const expectedError = {
          message: 'Not authenticated',
          code: 'UNAUTHENTICATED',
          stack: expect.any(String),
        };

        // Execute query and get results
        const result = await executeOperation(GET_BLOCKED_USERS, {});
        const error = result.errors !== undefined && result.errors[0];

        // Assert
        expect(error).toEqual(expectedError);
      });
    });

    describe('else if User queries first 10 blocked users by descending block date', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadBlocks();
      });

      it('should return blocked users', async () => {
        // Define expected blocked user
        const expectedBlockedConnection = {
          edges: blockedUsers
            .sort((a, b) => blockedDates[b.id] - blockedDates[a.id])
            .slice(0, 10)
            .map((blockedUser) => ({
              cursor: expect.any(String),
              node: {
                ...blockedUser.get({ plain: true }),
                id: blockedUser.id.toString(),
                created_at: blockedUser.created_at.toISOString(),
                last_login_at: blockedUser.last_login_at?.toISOString() ?? null,
                email: undefined,
                password_hash: undefined,
              },
            })),
          pageInfo: {
            startCursor: expect.any(String),
            endCursor: expect.any(String),
            hasNextPage: true,
            hasPreviousPage: false,
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_BLOCKED_USERS,
          {},
          userAccessToken
        );
        const blockedConnection = result.data.blocked;

        // Assert
        expect(blockedConnection).toEqual(expectedBlockedConnection);
      });
    });

    describe('else if User queries first 4 blocked users by ascending username and searches "different"', () => {
      beforeEach(async () => {
        await loadUsers();
        await loadBlocks();
      });

      it('should return blocked users', async () => {
        // Define expected blocked user
        const expectedBlockedConnection = {
          edges: blockedUsers
            .filter((blockedUser) => blockedUser.username.includes('different'))
            .sort((a, b) => a.username.localeCompare(b.username))
            .slice(0, 4)
            .map((blockedUser) => ({
              cursor: expect.any(String),
              node: {
                ...blockedUser.get({ plain: true }),
                id: blockedUser.id.toString(),
                created_at: blockedUser.created_at.toISOString(),
                last_login_at: blockedUser.last_login_at?.toISOString() ?? null,
                email: undefined,
                password_hash: undefined,
              },
            })),
          pageInfo: {
            startCursor: expect.any(String),
            endCursor: expect.any(String),
            hasNextPage: true,
            hasPreviousPage: false,
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_BLOCKED_USERS,
          {
            query: {
              search: 'different',
              orderBy: 'username',
              orderDirection: 'ASC',
              first: 4,
            },
          },
          userAccessToken
        );
        const blockedConnection = result.data.blocked;

        // Assert
        expect(blockedConnection).toEqual(expectedBlockedConnection);
      });
    });

    describe('else if User queries next 4 blocked users by ascending username and searches "different"', () => {
      let cursor: string;

      beforeEach(async () => {
        await loadUsers();
        await loadBlocks();

        const fourthUser = blockedUsers
          .filter((blockedUser) => blockedUser.username.includes('different'))
          .sort((a, b) => a.username.localeCompare(b.username))[3];
        cursor = encodeCursor(fourthUser.username);
      });

      it('should return blocked users', async () => {
        // Define expected blocked user
        const expectedBlockedConnection = {
          edges: blockedUsers
            .filter((blockedUser) => blockedUser.username.includes('different'))
            .sort((a, b) => a.username.localeCompare(b.username))
            .slice(4, 8)
            .map((blockedUser) => ({
              cursor: expect.any(String),
              node: {
                ...blockedUser.get({ plain: true }),
                id: blockedUser.id.toString(),
                created_at: blockedUser.created_at.toISOString(),
                last_login_at: blockedUser.last_login_at?.toISOString() ?? null,
                email: undefined,
                password_hash: undefined,
              },
            })),
          pageInfo: {
            startCursor: expect.any(String),
            endCursor: expect.any(String),
            hasNextPage: true,
            hasPreviousPage: true,
          },
        };

        // Execute query and get results
        const result = await executeOperation(
          GET_BLOCKED_USERS,
          {
            query: {
              search: 'different',
              orderBy: 'username',
              orderDirection: 'ASC',
              after: cursor,
              first: 4,
            },
          },
          userAccessToken
        );
        const blockedConnection = result.data.blocked;

        // Assert
        expect(blockedConnection).toEqual(expectedBlockedConnection);
      });
    });
  });
});
