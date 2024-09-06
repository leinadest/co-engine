import {
  type FindOptions,
  type Includeable,
  Op,
  type WhereOptions,
} from 'sequelize';

import type AuthService from '../../services/authService';
import { Chat, User, UserBlock } from '..';
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
    contextType,
    contextId,
    after,
    first = 20,
    orderBy = 'username',
    orderDirection = 'ASC',
  }: {
    search?: string;
    contextType?: 'chat' | 'channel';
    contextId?: string;
    after?: string;
    first?: number;
    orderBy?: string;
    orderDirection?: string;
  }): Promise<RelayConnection<User>> {
    // Initialize filter by association
    let include: Includeable | undefined;

    if (contextType === 'chat' && contextId !== undefined) {
      include = {
        model: Chat,
        as: 'chats',
        where: { id: contextId },
        attributes: [],
      };
    }

    // Initialize filter
    const where: any = {};

    if (search !== undefined) {
      where.username = { [Op.substring]: search };
    }

    // Initialize filter for rows after the cursor
    let whereAfter: any = {};

    if (after !== undefined) {
      const op = orderDirection === 'DESC' ? Op.lt : Op.gt;
      const cursor = decodeCursor(after) as Record<string, any>;
      whereAfter = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                [orderBy]: { [op]: cursor[orderBy] },
              },
              {
                [orderBy]: cursor[orderBy],
                id: { [op]: cursor.id },
              },
            ],
          },
        ],
      };
    }

    // Execute query
    const users = await User.findAll({
      include,
      where: { ...where, ...whereAfter },
      attributes: { exclude: ['password_hash', 'email'] },
      order: [
        [orderBy, orderDirection],
        ['id', orderDirection],
      ],
      limit: first,
    });

    // Generate edges and page info
    const edges = users.map((user) => ({
      cursor: encodeCursor({ [orderBy]: user[orderBy], id: user.id }),
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

  async getUsersByChat(chatId: number): Promise<User[]> {
    const usersOfChat = await User.findAll({
      include: {
        model: Chat,
        as: 'chats',
        where: { id: chatId },
      },
      attributes: { exclude: ['email'] },
    });
    return usersOfChat;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await User.findByPk(id);

    const publicUser = user?.toJSON();
    delete publicUser.email;
    delete publicUser.password_hash;
    return publicUser;
  }

  async getFriends({
    status,
    search,
    orderBy = 'username',
    orderDirection = 'ASC',
    after,
    first = 20,
  }: {
    status?: 'online' | 'offline';
    search?: string;
    orderBy?: string;
    orderDirection?: string;
    after?: string;
    first?: number;
  }): Promise<RelayConnection<User>> {
    // Initialize query for filtering down to the target dataset
    let filterWhere: WhereOptions<User> = {};
    if (status !== undefined) {
      filterWhere.is_online = status === 'online';
    }
    if (search !== undefined) {
      filterWhere = { username: { [Op.substring]: search } };
    }

    // Initialize query for the next messages to paginate after the cursor
    let paginationWhere: WhereOptions<User> = {};
    if (after !== undefined) {
      const op = orderDirection === 'DESC' ? Op.lt : Op.gt;
      const cursor = decodeCursor(after);
      paginationWhere = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                [orderBy]: { [op]: cursor[orderBy] },
              },
              {
                [orderBy]: cursor[orderBy],
                id: { [op]: cursor.id },
              },
            ],
          },
        ],
      };
    }

    // Execute total-count query
    const totalCount = await User.count({
      include: {
        model: User,
        as: 'usersOfFriend',
        where: { id: this.authService.getUserId() },
      },
      where: filterWhere,
    });

    // Execute pagination query
    const friends = await User.findAll({
      include: {
        model: User,
        as: 'usersOfFriend',
        where: { id: this.authService.getUserId() },
        attributes: [],
      },
      where: {
        ...filterWhere,
        ...paginationWhere,
      },
      attributes: { exclude: ['password_hash', 'email'] },
      order: [
        [orderBy, orderDirection],
        ['id', orderDirection],
      ],
      limit: first,
      subQuery: false,
    });

    // Generate edges and page info
    const edges = friends.map((friend) => ({
      cursor: encodeCursor({ id: friend.id, [orderBy]: friend[orderBy] }),
      node: friend.toJSON(),
    }));

    const pageInfo = {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasNextPage: friends.length === first,
      hasPreviousPage: Boolean(after),
    };

    return { edges, pageInfo, totalCount };
  }

  async getBlocked({
    after,
    first = 20,
    orderBy = 'blocked_at',
    orderDirection = 'DESC',
    search,
  }: {
    after?: string;
    first?: number;
    orderBy?: string;
    orderDirection?: string;
    search?: string;
  }): Promise<RelayConnection<User>> {
    // Initialize query for the next messages to paginate after the cursor
    const queryByBlocks = orderBy === 'blocked_at';
    const trueOrderBy = queryByBlocks ? 'created_at' : orderBy;
    const op = orderDirection === 'DESC' ? Op.lt : Op.gt;

    let totalCount: number | undefined;
    let edges: Array<Edge<User>> = [];
    let blockedUsers: User[] = [];

    if (!queryByBlocks) {
      const totalCountQuery: FindOptions<User> = {
        include: {
          model: User,
          as: 'blockers',
          where: { id: this.authService.getUserId() },
        },
        where:
          search !== undefined ? { username: { [Op.substring]: search } } : {},
      };
      const blockedUsersQuery: FindOptions<User> = {
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

      [totalCount, blockedUsers] = await Promise.all([
        User.count(totalCountQuery),
        User.findAll(blockedUsersQuery),
      ]);

      edges = blockedUsers.map((user) => ({
        cursor: encodeCursor(user[trueOrderBy]),
        node: user.toJSON(),
      }));
    }

    if (queryByBlocks) {
      const totalCountQuery: FindOptions<UserBlock> = {
        where: { user_id: this.authService.getUserId() as string },
      };
      const blocksQuery: FindOptions<UserBlock> = {
        include: {
          model: User,
          as: 'blocked',
          attributes: { exclude: ['password_hash', 'email'] },
        },
        where: {
          user_id: this.authService.getUserId() as string,
          ...(after !== undefined && {
            created_at: { [op]: decodeCursor(after) },
          }),
        },
        order: [['created_at', orderDirection]],
        limit: first,
        subQuery: false,
      };

      const queryResult = await Promise.all([
        UserBlock.count(totalCountQuery),
        UserBlock.findAll(blocksQuery),
      ]);

      totalCount = queryResult[0];
      const blocksWithBlockedUser = queryResult[1] as unknown as Array<
        UserBlock & { blocked: User }
      >;

      blockedUsers = blocksWithBlockedUser.map((block) => {
        const blockedUser = block.blocked;
        return blockedUser;
      });

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

    return { edges, pageInfo, totalCount };
  }
}

export default UsersDataSource;
