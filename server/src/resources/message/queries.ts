import { gql } from 'graphql-tag';
import * as yup from 'yup';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { type Context } from '../../config/apolloServer';
import Chat from '../chat/model';
import { User } from '..';

export const typeDefs = gql`
  input MessagesInput {
    contextType: String!
    contextId: String!
    orderDirection: String
    orderBy: String
    after: String
    first: Int
  }

  extend type Query {
    """
    Returns messages from the specified context
    """
    messages(query: MessagesInput!): MessageConnection
  }
`;

interface MessagesInput {
  contextType: string;
  contextId: string;
  by?: '_id' | 'created_at';
  after?: string;
  before?: string;
  first?: number;
  last?: number;
}

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
      { query }: { query: MessagesInput },
      { authService, dataSources }: Context
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

      const context = query.contextType === 'chat' ? Chat : Chat;
      const user = (await User.findOne({
        include: { model: context, where: { id: query.contextId } },
        where: { id: authService.getUserId() },
      })) as unknown as (User & Record<string, any>) | null;

      if (user === null) {
        throw new GraphQLError('User not found in context', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const messages = await dataSources.messagesDB.getMessages(query);
      return messages;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
