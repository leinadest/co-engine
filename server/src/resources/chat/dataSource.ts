import { Op, type Transaction } from 'sequelize';

import type AuthService from '../../services/authService';
import { type RelayConnection } from '../../utils/types';
import type UsersDataSource from '../user/dataSource';
import { Chat, ChatUser, User } from '..';
import { decodeCursor, encodeCursor } from '../../utils/pagination';
import { GraphQLError } from 'graphql';
import { transaction } from '../../utils/api';

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
    first = 10,
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
      where = { ...where, [orderBy]: { [op]: decodeCursor(after) } };
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

    // Get chats
    const userId = this.authService.getUserId() as string;

    const chats = await Chat.findAll({
      include: {
        model: User,
        as: 'users',
        where: { id: userId },
      },
      where: {
        ...where,
        ...whereUnblocked,
      },
      order: [[orderBy, orderDirection]],
      limit: first,
      attributes: { exclude: ['creator_id', 'created_at'] },
    });

    // Create connection
    const edges = chats.map((chat) => ({
      cursor: encodeCursor(chat[orderBy]),
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
        attributes: ['id', 'username', 'discriminator', 'profile_pic'],
      },
    })) as unknown as (Chat & { users: User[] }) | null;

    if (chat === null) {
      throw new GraphQLError(`Chat with id ${chatId} does not exist`, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    return await chat.toJSON();
  }

  async getOrCreateDirectChat(user: User, otherUser: User): Promise<Chat> {
    const findOrCreateChat = async (transaction: Transaction): Promise<any> => {
      const [chat, created] = await Chat.findOrCreate({
        include: {
          model: User,
          as: 'users',
          where: { [Op.and]: [{ id: user.id }, { id: otherUser.id }] },
          attributes: ['id', 'username', 'discriminator', 'profile_pic'],
        },
        where: {
          [Op.or]: [
            { name: `${user.username} & ${otherUser.username}` },
            { name: `${otherUser.username} & ${user.username}` },
          ],
        },
        defaults: {
          name: `${user.username} & ${otherUser.username}`,
          creator_id: user.id,
        },
        transaction,
      });

      if (created) {
        await ChatUser.bulkCreate(
          [
            { user_id: user.id, chat_id: chat.id },
            { user_id: otherUser.id, chat_id: chat.id },
          ],
          { transaction }
        );
      }

      return chat.toJSON();
    };

    return await transaction({
      run: findOrCreateChat,
      errorMessage: 'getOrCreateDirectChat transaction failed',
    });
  }
}

export default ChatsDataSource;
