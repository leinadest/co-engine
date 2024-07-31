import { GraphQLError } from 'graphql';
import { Op } from 'sequelize';

import type AuthService from '../../services/authService';
import { User } from '..';
import { type RelayConnection } from '../../utils/types';
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
      where = { username: { [op]: search } };
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

  async getFriends({
    status = 'accepted',
    search,
    orderBy = 'username',
    orderDirection = 'ASC',
    after,
    first = 10,
  }: {
    status?: 'pending' | 'accepted';
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
      where = { username: { [op]: search } };
    }
    if (after !== undefined) {
      where = { ...where, [orderBy]: { [op]: decodeCursor(after) } };
    }

    // Execute query
    const userWithFriends = await User.findByPk(
      this.authService.getUserId() as string,
      {
        include: {
          model: User,
          as: 'friends',
          where,
          through: { where: { status } },
          attributes: { exclude: ['password_hash', 'email'] },
          order: [[orderBy, orderDirection]],
          limit: first,
        },
      }
    );
    const friends: User[] =
      userWithFriends === null ? [] : userWithFriends.friends;

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
    orderBy = 'created_at',
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
    const op = orderDirection === 'DESC' ? Op.lt : Op.gt;

    let where = {};
    if (search !== undefined) {
      where = { username: { [op]: search } };
    }
    if (after !== undefined) {
      where = { ...where, [orderBy]: { [op]: decodeCursor(after) } };
    }

    // Execute query
    const users = await User.findAll({
      include: {
        model: User,
        as: 'blockers',
        where: { id: this.authService.getUserId() },
        attributes: [],
      },
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
}

export default UsersDataSource;
