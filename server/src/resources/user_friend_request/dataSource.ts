import { type FindOptions, Op } from 'sequelize';

import { User, UserFriendRequest, UserFriendship } from '..';
import type UsersDataSource from '../user/dataSource';
import type AuthService from '../../services/authService';
import { GraphQLError } from 'graphql';
import sequelize from '../../config/sequelize';

class UserFriendRequestsDataSource {
  private readonly usersDB: UsersDataSource;
  private readonly authService: AuthService;

  constructor(usersDB: UsersDataSource, authService: AuthService) {
    this.usersDB = usersDB;
    this.authService = authService;
  }

  async getFriendRequests({
    type = 'received',
    orderBy = 'created_at',
    orderDirection = 'DESC',
    limit = 10,
    offset = 0,
  }: {
    type?: string;
    orderBy?: string;
    orderDirection?: string;
    limit?: number;
    offset?: number;
  }): Promise<UserFriendRequest[]> {
    // Initialize query for the next messages to paginate after the cursor
    const query: FindOptions<any> = {
      include: {},
      where: {},
      order: [[orderBy, orderDirection]],
      limit,
      offset,
    };

    if (type === 'received') {
      const { blockedUserIds } = await this.usersDB.getBlockedInfo();
      query.include = {
        model: User,
        as: 'sender',
        where: {
          id: { [Op.notIn]: blockedUserIds },
        },
      };
      query.where = {
        receiver_id: this.authService.getUserId(),
      };
    }

    if (type === 'sent') {
      query.include = {
        model: User,
        as: 'receiver',
      };
      query.where = {
        sender_id: this.authService.getUserId(),
      };
    }

    // Execute query
    const friendRequests = await UserFriendRequest.findAll(query);
    return friendRequests;
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
