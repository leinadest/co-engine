import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';

import type AuthService from '../../services/authService';
import { Chat, User } from '../';
import { Op } from 'sequelize';

const typeDefs = gql`
  extend type Query {
    """
    Returns all chats that the authenticated user is in.
    """
    chats: [Chat]!
  }
`;

const resolvers = {
  Query: {
    chats: async (
      _: any,
      __: any,
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        const blockedUsers = (await User.findAll({
          include: [
            {
              model: User,
              as: 'blockers',
              where: { id: authService.getUserId() },
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

        const unblockedChats = await Chat.findAll({
          // Requires chat to have the authenticated user as a member
          include: {
            model: User,
            where: { id: authService.getUserId() },
            attributes: [],
          },
          // Requires the chat's creator to either not be blocked or blocked
          // after the chat's creation
          where:
            blockedUsers.length === 0
              ? {}
              : {
                  [Op.or]: [
                    { creator_id: { [Op.notIn]: blockedUserIds } },
                    ...blockedUserIds.map((userId) => ({
                      creator_id: userId,
                      created_at: { [Op.lt]: blockedUserDates[userId] },
                    })),
                  ],
                },
        });
        return unblockedChats;
      } catch (e) {
        console.log(e);
      }
    },
  },
};

export default { typeDefs, resolvers };
