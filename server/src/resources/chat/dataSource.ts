import { Op, Sequelize } from 'sequelize';
import { GraphQLError } from 'graphql';

import type AuthService from '../../services/authService';
import { type RelayConnection } from '../../utils/types';
import type UsersDataSource from '../user/dataSource';
import { Chat, ChatUser, User } from '..';
import { decodeCursor, encodeCursor } from '../../utils/pagination';
import sequelize from '../../config/sequelize';

class ChatsDataSource {
  private readonly authService: AuthService;
  private readonly usersDB: UsersDataSource;

  constructor(authService: AuthService, usersDB: UsersDataSource) {
    this.authService = authService;
    this.usersDB = usersDB;
  }

  async getChats({
    search,
    orderBy = 'last_message_at',
    orderDirection = 'DESC',
    after,
    first = 20,
  }: {
    search?: string;
    orderBy?: string;
    orderDirection?: string;
    after?: string;
    first?: number;
  }): Promise<RelayConnection<Chat>> {
    // Query for next paginated chats
    let where = {};

    const op = orderDirection === 'DESC' ? Op.lt : Op.gt;

    if (search !== undefined) {
      where = { name: { [Op.substring]: search } };
    }
    if (after !== undefined) {
      const cursor = decodeCursor(after) as Record<string, any>;
      where = {
        ...where,
        [Op.and]: [
          {
            [Op.or]: [
              { [orderBy]: { [op]: cursor[orderBy] } },
              { [orderBy]: cursor[orderBy], id: { [Op.lt]: cursor.id } },
            ],
          },
        ],
      };
    }

    // Query for chats that aren't from blocked users after being blocked
    let whereUnblocked = {};

    const { blockedUserIds, blockedUserDates } =
      await this.usersDB.getBlockedInfo();

    if (blockedUserIds.length > 0) {
      whereUnblocked = {
        [Op.or]: [
          { creator_id: { [Op.notIn]: blockedUserIds } },
          ...blockedUserIds.map((userId: number) => ({
            creator_id: userId,
            created_at: { [Op.lt]: blockedUserDates[userId] },
          })),
        ],
      };
    }

    const userId = this.authService.getUserId() as string;

    const chats = await Chat.findAll({
      include: {
        model: User,
        as: 'users',
        where: { id: userId },
        attributes: [],
      },
      where: {
        ...where,
        ...whereUnblocked,
      },
      order: [
        [orderBy, orderDirection],
        ['id', 'DESC'],
      ],
      limit: first,
      attributes: { exclude: ['creator_id', 'created_at'] },
    });

    const edges = chats.map((chat) => ({
      cursor: encodeCursor({
        id: chat.id,
        [orderBy]: chat[orderBy],
      }),
      node: chat.toJSON(),
    }));

    const pageInfo = {
      hasNextPage: edges.length === first,
      hasPreviousPage: after !== undefined,
      endCursor: edges[edges.length - 1]?.cursor,
      startCursor: edges[0]?.cursor,
    };

    return { edges, pageInfo };
  }

  async getChat(chatId: string): Promise<Chat & { users: User[] }> {
    const chat = (await Chat.findByPk(chatId, {
      include: {
        model: User,
        as: 'users',
        attributes: { exclude: ['email'] },
      },
    })) as unknown as (Chat & { users: User[] }) | null;

    if (chat === null) {
      throw new GraphQLError(`Chat with id ${chatId} does not exist`, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return await chat.toJSON();
  }

  async getOrCreateDirectChat(
    userId: string,
    otherUserId: string
  ): Promise<Chat> {
    const chats = await Chat.findAll<Chat & Record<string, any>>({
      include: {
        model: User,
        as: 'users',
        where: { id: { [Op.in]: [userId, otherUserId] } },
        through: { attributes: [] },
        attributes: [],
      },
      where: { creator_id: { [Op.in]: [userId, otherUserId] } },
      group: ['chat.id'],
      having: Sequelize.literal(
        'COUNT(DISTINCT "users"."id") = 2 AND COUNT(DISTINCT "users"."id") = (SELECT COUNT(*) FROM "chat_users" WHERE "chat_users"."chat_id" = "chat"."id")'
      ),
    });

    if (chats[0] !== null) {
      return await chats[0].toJSON();
    }

    let transaction;
    try {
      transaction = await sequelize.transaction();

      const newChat = await Chat.create(
        { creator_id: userId },
        { transaction }
      );
      await ChatUser.bulkCreate(
        [
          { user_id: userId, chat_id: newChat.id },
          { user_id: otherUserId, chat_id: newChat.id },
        ],
        { transaction }
      );

      await transaction.commit();
      return await newChat.toJSON();
    } catch (err: any) {
      await transaction?.rollback();
      throw new GraphQLError('getOrCreateDirectChat transaction failed', {
        originalError: err,
      });
    }
  }
}

export default ChatsDataSource;
