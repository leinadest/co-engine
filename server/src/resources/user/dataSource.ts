import { GraphQLError } from 'graphql';
import { type FindOptions, Op } from 'sequelize';

import type AuthService from '../../services/authService';
import { User, UserBlock } from '..';
import { type Edge, type RelayConnection } from '../../utils/types';
import { decodeCursor, encodeCursor } from '../../utils/pagination';

class UsersDataSource {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async getBlockedInfo(): Promise<{
    blockedUserIds: number[];
    blockedUserDates: Record<string, Date>;
  }> {
    const blockedUsers = (await User.findAll({
      include: [
        {
          model: User,
          as: 'blockers',
          where: { id: this.authService.getUserId() },
          attributes: ['id'],
          through: { attributes: ['created_at'] },
        },
      ],
      attributes: ['id'],
    })) as unknown as Array<{
      id: number;
      blockers: [{ user_block: { created_at: Date } }];
    }>;

    const blockedUserIds = blockedUsers.map((user) => user.id);
    const blockedUserDates = blockedUsers.reduce<Record<string, Date>>(
      (acc, user) => {
        acc[user.id] = user.blockers[0].user_block.created_at;
        return acc;
      },
      {}
    );

    return { blockedUserIds, blockedUserDates };
  }

  async getUsers({
    search,
    orderBy = 'username',
    orderDirection = 'ASC',
    after,
    first = 10,
  }: {
    search?: string;
    orderBy?: string;
    orderDirection?: string;
    after?: string;
    first?: number;
  }): Promise<RelayConnection<User>> {
    // Initialize query for the next messages to paginate after the cursor
    const op = orderDirection === 'DESC' ? Op.lt : Op.gt;

    let where = {};
    if (search !== undefined) {
      where = { username: { [Op.substring]: search } };
    }
    if (after !== undefined) {
      where = { ...where, [orderBy]: { [op]: decodeCursor(after) } };
    }

    // Execute query
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash', 'email'] },
      order: [[orderBy, orderDirection]],
      limit: first,
    });

    // Generate edges and page info
    const edges = users.map((user) => ({
      cursor: encodeCursor(user[orderBy]),
      node: user.toJSON(),
    }));

    const pageInfo = {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasNextPage: users.length === first,
      hasPreviousPage: Boolean(after),
    };

    return { edges, pageInfo };
  }

  async getPublicUser(id: number): Promise<User | null> {
    const user = await User.findByPk(id);

    const publicUser = user?.toJSON();
    delete publicUser.email;
    delete publicUser.password_hash;
    return publicUser;
  }

  async getFriends({
    search,
    orderBy = 'username',
    orderDirection = 'ASC',
    after,
    first = 10,
  }: {
    search?: string;
    orderBy?: string;
    orderDirection?: string;
    after?: string;
    first?: number;
  }): Promise<RelayConnection<User>> {
    if (this.authService.getUserId() === undefined) {
      throw new GraphQLError('Not authenticated', {
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      });
    }

    // Initialize query for the next messages to paginate after the cursor
    const op = orderDirection === 'DESC' ? Op.lt : Op.gt;

    let where = {};
    if (search !== undefined) {
      where = { username: { [Op.substring]: search } };
    }
    if (after !== undefined) {
      where = { ...where, [orderBy]: { [op]: decodeCursor(after) } };
    }

    // Execute query
    const friends = await User.findAll({
      include: {
        model: User,
        as: 'usersOfFriend',
        where: { id: this.authService.getUserId() },
      },
      where,
      attributes: { exclude: ['password_hash', 'email'] },
      order: [[orderBy, orderDirection]],
      limit: first,
      subQuery: false,
    });

    // Generate edges and page info
    const edges = friends.map((friend) => ({
      cursor: encodeCursor(friend[orderBy]),
      node: friend.toJSON(),
    }));

    const pageInfo = {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasNextPage: friends.length === first,
      hasPreviousPage: Boolean(after),
    };

    return { edges, pageInfo };
  }

  async getBlocked({
    search,
    orderBy = 'blocked_at',
    orderDirection = 'DESC',
    after,
    first = 10,
  }: {
    search?: string;
    orderBy?: string;
    orderDirection?: string;
    after?: string;
    first?: number;
  }): Promise<RelayConnection<User>> {
    // Initialize query for the next messages to paginate after the cursor
    const queryByBlocks = orderBy === 'blocked_at';
    const trueOrderBy = queryByBlocks ? 'created_at' : orderBy;
    const op = orderDirection === 'DESC' ? Op.lt : Op.gt;

    let blocksWithBlockedUser: Array<UserBlock & { blocked: User }> = [];
    let blockedUsers: User[] = [];
    let edges: Array<Edge<User>> = [];

    if (!queryByBlocks) {
      const query: FindOptions<any> = {
        include: {
          model: User,
          as: 'blockers',
          where: { id: this.authService.getUserId() },
          attributes: [],
        },
        where: {
          ...(search !== undefined && { username: { [Op.substring]: search } }),
          ...(after !== undefined && {
            [orderBy]: { [op]: decodeCursor(after) },
          }),
        },
        attributes: { exclude: ['password_hash', 'email'] },
        order: [[orderBy, orderDirection]],
        limit: first,
        subQuery: false,
      };

      blockedUsers = (await User.findAll(query)) as unknown as User[];

      edges = blockedUsers.map((user) => ({
        cursor: encodeCursor(user[trueOrderBy]),
        node: user.toJSON(),
      }));
    }

    if (queryByBlocks) {
      const query: FindOptions<any> = {
        include: {
          model: User,
          as: 'blocked',
          attributes: { exclude: ['password_hash', 'email'] },
        },
        where:
          after !== undefined
            ? { created_at: { [op]: decodeCursor(after) } }
            : undefined,
        order: [['created_at', orderDirection]],
        limit: first,
        subQuery: false,
      };

      blocksWithBlockedUser = (await UserBlock.findAll(
        query
      )) as unknown as Array<UserBlock & { blocked: User }>;
      blockedUsers = blocksWithBlockedUser.map((block) => block.blocked);

      edges = blocksWithBlockedUser.map((block) => ({
        cursor: encodeCursor(block[trueOrderBy]),
        node: block.blocked.toJSON(),
      }));
    }

    // Generate page info
    const pageInfo = {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasNextPage: blockedUsers.length === first,
      hasPreviousPage: Boolean(after),
    };

    return { edges, pageInfo };
  }
}

export default UsersDataSource;
