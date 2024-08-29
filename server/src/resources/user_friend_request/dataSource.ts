import { type Includeable, Op, type WhereOptions } from 'sequelize';

import { User, UserFriendRequest, UserFriendship } from '..';
import type UsersDataSource from '../user/dataSource';
import type AuthService from '../../services/authService';
import { GraphQLError } from 'graphql';
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
    type = 'received',
    after,
    first = 20,
    orderBy = 'created_at',
    orderDirection = 'DESC',
  }: {
    type?: string;
    after?: string;
    first?: number;
    orderBy?: string;
    orderDirection?: string;
  }): Promise<RelayConnection<UserFriendRequest>> {
    let include: Includeable = {};
    let where: WhereOptions<any> = {};

    if (type === 'received') {
      const { blockedUserIds } = await this.usersDB.getBlockedInfo();
      include = {
        model: User,
        as: 'sender',
        where: { id: { [Op.notIn]: blockedUserIds } },
        attributes: ['id', 'username', 'discriminator', 'profile_pic_url'],
      };
      where = { receiver_id: this.authService.getUserId() };
    }

    if (type === 'sent') {
      include = {
        model: User,
        as: 'receiver',
        attributes: ['id', 'username', 'discriminator', 'profile_pic_url'],
      };
      where = { sender_id: this.authService.getUserId() };
    }

    let paginationWhere: WhereOptions<any> = {};

    if (after !== undefined) {
      const op = orderDirection === 'DESC' ? Op.lt : Op.gt;
      const cursor = decodeCursor(after);
      paginationWhere = {
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
        where: { [Op.and]: [where, paginationWhere] },
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
