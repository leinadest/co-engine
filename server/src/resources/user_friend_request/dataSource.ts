import { type Includeable, Op, type WhereOptions } from 'sequelize';
import { GraphQLError } from 'graphql';

import { User, UserFriendRequest, UserFriendship } from '..';
import type UsersDataSource from '../user/dataSource';
import type AuthService from '../../services/authService';
import sequelize from '../../config/sequelize';
import { type RelayConnection } from '../../utils/types';
import { decodeCursor, encodeCursor } from '../../utils/pagination';

class UserFriendRequestsDataSource {
  private readonly usersDB: UsersDataSource;
  private readonly authService: AuthService;

  constructor(usersDB: UsersDataSource, authService: AuthService) {
    this.usersDB = usersDB;
    this.authService = authService;
  }

  async getFriendRequests({
    search,
    type = 'received',
    after,
    first = 20,
    orderBy = 'created_at',
    orderDirection = 'DESC',
  }: {
    search?: string;
    type?: string;
    after?: string;
    first?: number;
    orderBy?: string;
    orderDirection?: string;
  }): Promise<RelayConnection<UserFriendRequest>> {
    // Include the other user in the friend request
    const include: Includeable = {
      model: User,
      as: 'receiver',
      attributes: { exclude: ['email', 'password_hash'] },
    };

    if (type === 'received') {
      const { blockedUserIds } = await this.usersDB.getBlockedInfo();
      include.as = 'sender';
      include.where = { id: { [Op.notIn]: blockedUserIds } };
    }

    // Filter based on search on the other user
    if (search !== undefined) {
      include.where = {
        ...include.where,
        display_name: { [Op.substring]: search },
      };
    }

    // Filter for the right type of friend request
    const where: WhereOptions<any> =
      type === 'received'
        ? { receiver_id: this.authService.getUserId() }
        : { sender_id: this.authService.getUserId() };

    // Filter for the rows after the cursor
    let whereAfter: WhereOptions<any> = {};

    if (after !== undefined) {
      const op = orderDirection === 'DESC' ? Op.lt : Op.gt;
      const cursor = decodeCursor(after);
      whereAfter = {
        [Op.and]: [
          {
            [Op.or]: [
              { [orderBy]: { [op]: cursor[orderBy] } },
              {
                [Op.and]: [
                  { [orderBy]: cursor[orderBy] },
                  { sender_id: { [op]: cursor.sender_id } },
                ],
              },
              {
                [Op.and]: [
                  { [orderBy]: cursor[orderBy] },
                  { receiver_id: { [op]: cursor.receiver_id } },
                ],
              },
            ],
          },
        ],
      };
    }

    const [totalCount, friendRequests] = await Promise.all([
      UserFriendRequest.count({ include, where }),
      UserFriendRequest.findAll({
        include,
        where: { [Op.and]: [where, whereAfter] },
        order: [
          [orderBy, orderDirection],
          ['sender_id', orderDirection],
          ['receiver_id', orderDirection],
        ],
        limit: first,
      }),
    ]);

    const edges = friendRequests.map((friendRequest) => ({
      cursor: encodeCursor({
        [orderBy]: friendRequest[orderBy],
        sender_id: friendRequest.sender_id,
        receiver_id: friendRequest.receiver_id,
      }),
      node: friendRequest.toJSON(),
    }));

    const pageInfo = {
      hasNextPage: edges.length > 0,
      endCursor: edges[edges.length - 1]?.cursor,
      hasPreviousPage: false,
      startCursor: edges[0]?.cursor,
    };

    return { totalCount, edges, pageInfo };
  }

  async acceptFriendRequest(userId: string | number): Promise<boolean> {
    try {
      return await sequelize.transaction(async (transaction) => {
        await Promise.all([
          UserFriendRequest.destroy({
            where: {
              [Op.or]: [
                {
                  sender_id: userId,
                  receiver_id: this.authService.getUserId(),
                },
                {
                  sender_id: this.authService.getUserId(),
                  receiver_id: userId,
                },
              ],
            },
            transaction,
          }),
          UserFriendship.bulkCreate(
            [
              { user_id: this.authService.getUserId(), friend_id: userId },
              { user_id: userId, friend_id: this.authService.getUserId() },
            ],
            { transaction }
          ),
        ]);
        return true;
      });
    } catch (e: any) {
      throw new GraphQLError(e.message as string);
    }
  }
}

export default UserFriendRequestsDataSource;
