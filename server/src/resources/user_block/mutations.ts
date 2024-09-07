import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';

import type AuthService from '../../services/authService';
import { User, UserBlock, UserFriendship } from '..';
import sequelize from '../../config/sequelize';
import { Op } from 'sequelize';

const typeDefs = gql`
  extend type Mutation {
    """
    Blocks the specified user.
    """
    blockUser(userId: ID!): UserBlock

    """
    Unblocks the specified user.
    """
    unblockUser(userId: ID!): UserBlock
  }
`;

const resolvers = {
  Mutation: {
    blockUser: async (
      _: any,
      { userId }: { userId: string },
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

      try {
        return await sequelize.transaction(async (transaction) => {
          const [createdUserBlock] = await Promise.all([
            UserBlock.create(
              { user_id: authService.getUserId(), blocked_user_id: userId },
              { transaction }
            ),
            UserFriendship.destroy({
              where: {
                [Op.or]: [
                  { user_id: authService.getUserId(), friend_id: userId },
                  { friend_id: userId, user_id: authService.getUserId() },
                ],
              },
              transaction,
            }),
          ]);
          return createdUserBlock;
        });
      } catch (e: any) {
        const err = new GraphQLError('User could not be blocked');
        if (e.name === 'SequelizeUniqueConstraintError') {
          err.message = 'User already blocked';
          err.extensions.code = 'BAD_USER_INPUT';
        }
        throw err;
      }
    },
    unblockUser: async (
      _: any,
      { userId }: { userId: string },
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });
      }

      const userBlock = await UserBlock.findOne({
        include: {
          model: User,
          as: 'blockedUsers',
          attributes: { exclude: ['email, password_hash'] },
        },
        where: {
          user_id: authService.getUserId(),
          blocked_user_id: userId,
        },
      });
      if (userBlock === null) {
        throw new GraphQLError('User not blocked', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }

      await userBlock.destroy();

      return { ...userBlock, blocked_user: userBlock.blockedUsers };
    },
  },
};

export default { typeDefs, resolvers };
