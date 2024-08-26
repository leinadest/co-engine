import { type Includeable, Op, type WhereOptions } from 'sequelize';

import type AuthService from '../../services/authService';
import { decodeCursor, encodeCursor } from '../../utils/pagination';
import { User, UserBlock } from '..';
import { type RelayConnection } from '../../utils/types';

export default class UserBlocksDataSource {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async getUserBlocks({
    after,
    first = 10,
    orderBy = 'created_at',
    orderDirection = 'DESC',
    search,
  }: {
    after?: string;
    first?: number;
    orderBy?: string;
    orderDirection?: string;
    search?: string;
  }): Promise<RelayConnection<any>> {
    // Set include
    const include: Includeable = {
      model: User,
      as: 'blockedUsers',
      attributes: ['id', 'username', 'discriminator', 'profile_pic_url'],
    };

    if (search !== undefined) {
      include.where = { username: { [Op.iLike]: `%${search}%` } };
    }

    // Set where
    const where: WhereOptions<any> = { user_id: this.authService.getUserId() };

    // Set paginationWhere
    let paginationWhere: WhereOptions<any> = {};

    if (after !== undefined) {
      const cursor = decodeCursor(after);
      const op = orderDirection === 'DESC' ? Op.lt : Op.gt;
      paginationWhere = {
        [Op.and]: [
          {
            [Op.or]: [
              { [orderBy]: { [op]: cursor[orderBy] } },
              {
                [orderBy]: cursor[orderBy],
                blocked_user_id: { [op]: cursor.blocked_user_id },
              },
            ],
          },
        ],
      };
    }

    // Execute queries
    const [totalCount, userBlocks] = await Promise.all([
      UserBlock.count({ include, where }),
      UserBlock.findAll({
        include,
        where: { ...where, ...paginationWhere },
        order: [
          [orderBy, orderDirection],
          ['blocked_user_id', orderDirection],
        ],
        limit: first,
      }),
    ]);

    const edges = userBlocks.map((userBlock) => ({
      cursor: encodeCursor({
        [orderBy]: userBlock[orderBy],
        blocked_user_id: userBlock.blocked_user_id,
      }),
      node: {
        user_id: userBlock.user_id,
        blocked_user: userBlock.blockedUsers,
        created_at: userBlock.created_at,
      },
    }));

    const pageInfo = {
      startCursor: edges[0]?.cursor,
      endCursor: edges[edges.length - 1]?.cursor,
      hasNextPage: edges.length === first,
      hasPreviousPage: Boolean(after),
    };

    return { totalCount, edges, pageInfo };
  }
}
