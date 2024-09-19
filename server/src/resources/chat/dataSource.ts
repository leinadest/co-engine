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
    search = '',
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

    const userWithChatIds = (await User.findByPk(userId, {
      include: {
        model: Chat,
        as: 'chats',
        attributes: ['id'],
      },
    })) as User & { chats: Chat[] };

    const chatIds = userWithChatIds.chats.map((chat: any) => chat.id) ?? [];

    let chats = (await Chat.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'display_name'],
        },
      ],
      where: {
        id: { [Op.in]: chatIds },
        ...where,
        ...whereUnblocked,
      },
      order: [
        [orderBy, orderDirection],
        ['id', 'DESC'],
      ],
      limit: search === '' ? first : undefined,
      attributes: { exclude: ['creator_id', 'created_at'] },
    })) as unknown as Array<Chat & { users: User[] }>;

    if (search !== '') {
      chats = chats.filter((chat) => {
        const otherUsers = chat.users.filter(
          (user) => user.id.toString() !== userId
        );
        if (
          typeof chat.name === 'string' &&
          chat.name.toLowerCase().includes(search.toLowerCase())
        ) {
          return true;
        }
        if (
          otherUsers.length === 0 &&
          'empty chat'.includes(search.toLowerCase())
        ) {
          return true;
        }
        if (otherUsers.length === 0) {
          return false;
        }
        const match = otherUsers.find((user) =>
          user.display_name.toLowerCase().includes(search.toLowerCase())
        );
        return match !== undefined;
      });
    }

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
        attributes: { exclude: ['email', 'password_hash'] },
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
    const chats = await Chat.findAll({
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

    if (chats.length !== 0) {
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
