import { type RelayConnection } from '../../utils/types';
import { Message } from '..';
import { type IMessage } from './model';
import type UsersDataSource from '../user/dataSource';
import { decodeCursor, encodeCursor } from '../../utils/pagination';

class MessagesDataSource {
  private readonly usersDB: UsersDataSource;

  constructor(usersDB: UsersDataSource) {
    this.usersDB = usersDB;
  }

  async getUnblockedMessagesQuery(): Promise<Record<string, any>> {
    const { blockedUserIds, blockedUserDates } =
      await this.usersDB.getBlockedInfo();

    return {
      $or: [
        { creator_id: { $nin: blockedUserIds } },
        ...blockedUserIds.map((userId: number) => ({
          creator_id: userId,
          created_at: { $lt: blockedUserDates[userId] },
        })),
      ],
    };
  }

  async getMessages({
    contextId,
    contextType,
    orderDirection = 'DESC',
    orderBy = 'created_at',
    after,
    first = 20,
  }: {
    contextId: string | number;
    contextType: string;
    orderDirection?: 'ASC' | 'DESC';
    orderBy?: '_id' | 'created_at';
    after?: string;
    first?: number;
  }): Promise<RelayConnection<IMessage>> {
    // Initialize query for messages following after
    const op = orderDirection === 'DESC' ? '$lt' : '$gt';
    const cursor = after !== undefined ? decodeCursor(after) : undefined;
    const query =
      cursor !== undefined
        ? {
            $or: [
              { [orderBy]: { [op]: cursor[orderBy] } },
              {
                [orderBy]: cursor[orderBy],
                _id: { [op]: cursor._id },
              },
            ],
          }
        : {};

    // Initialize query for filtering messages from blocked users
    const unblockedMessagesQuery = await this.getUnblockedMessagesQuery();

    // Execute query
    const direction = orderDirection === 'ASC' ? 1 : -1;
    const messages = await Message.find({
      context_id: contextId,
      context_type: contextType,
      $and: [query, unblockedMessagesQuery],
    })
      .sort({ [orderBy]: direction, _id: direction })
      .limit(first);

    const edges = messages.map((message) => ({
      cursor: encodeCursor({ _id: message._id, [orderBy]: message[orderBy] }),
      node: message.toJSON(),
    }));

    const pageInfo = {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasNextPage: messages.length === first,
      hasPreviousPage: Boolean(after),
    };

    return { edges, pageInfo };
  }
}

export default MessagesDataSource;
