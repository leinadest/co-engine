import { gql } from 'graphql-tag';
import * as yup from 'yup';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { Chat, Message, User } from '../';
import type AuthService from '../../services/authService';

export const typeDefs = gql`
  input MessagesInput {
    contextType: String!
    contextId: String!
  }

  extend type Query {
    """
    Returns messages from the specified context
    """
    messages(query: MessagesInput!): [Message]!
  }
`;

const messagesInputSchema = yup.object().shape({
  contextType: yup
    .string()
    .trim()
    .oneOf(['chat', 'channel'], 'Context must be either chat or channel')
    .required('Context type is required'),
  contextId: yup.string().trim().required('Context ID is required'),
});

export const resolvers = {
  Query: {
    // TODO: Implement channel context and permission checks
    messages: async (
      _parent: any,
      { query }: { query: { contextType: string; contextId: string } },
      { authService }: { authService: AuthService }
    ) => {
      try {
        await messagesInputSchema.validate(query);
      } catch (error: any) {
        throw new GraphQLError(error.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const contextModel = query.contextType === 'chat' ? Chat : Chat;
      const contextUser = await User.findOne({
        include: {
          model: contextModel,
          where: { id: query.contextId },
        },
        where: { id: authService.getUserId() },
      });
      if (contextUser === null) {
        throw new GraphQLError('User not found in context', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const blockedContextUsers = (await User.findAll({
        include: [
          {
            model: User,
            as: 'blockers',
            where: { id: authService.getUserId() },
            attributes: ['id'],
            through: { attributes: ['created_at'] },
          },
          {
            model: contextModel,
            where: { id: query.contextId },
            attributes: [],
          },
        ],
        attributes: ['id'],
      })) as unknown as Array<{
        id: string;
        blockers: [{ user_block: { created_at: Date } }];
      }>;

      const blockedUserIds = blockedContextUsers.map((user) => user.id);
      const blockedUserDates = blockedContextUsers.reduce<Record<string, Date>>(
        (acc, user) => {
          acc[user.id] = user.blockers[0].user_block.created_at;
          return acc;
        },
        {}
      );

      const unblockedMessages = await Message.find({
        context_type: query.contextType,
        context_id: query.contextId,
        $or: [
          {
            creator_id: { $nin: blockedUserIds },
          },
          ...blockedUserIds.map((userId) => ({
            creator_id: userId,
            created_at: { $lt: blockedUserDates[userId] },
          })),
        ],
      });

      const jsonMessages = unblockedMessages.map((message) => message.toJSON());
      return jsonMessages;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
