import { gql } from 'graphql-tag';
import * as yup from 'yup';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { type Context } from '../../config/apolloServer';
import Chat from '../chat/model';
import { User } from '..';

export const typeDefs = gql`
  extend type Query {
    """
    Returns messages from the specified context
    """
    messages(
      contextType: String!
      contextId: String!
      orderDirection: String
      orderBy: String
      after: String
      first: Int
    ): MessageConnection!
  }
`;

interface MessagesInput {
  contextType: string;
  contextId: string;
  orderDirection?: 'ASC' | 'DESC';
  orderBy?: '_id' | 'created_at';
  after?: string;
  first?: number;
}

const messagesInputSchema = yup.object().shape({
  contextType: yup
    .string()
    .trim()
    .oneOf(['chat', 'channel'], 'Context must be either chat or channel')
    .required('Context type is required'),
  contextId: yup.string().trim().required('Context ID is required'),
  orderDirection: yup
    .string()
    .trim()
    .oneOf(['ASC', 'DESC'], 'orderDirection must be either ASC or DESC'),
  orderBy: yup
    .string()
    .trim()
    .oneOf(['_id', 'created_at'], 'orderBy must be either _id or created_at'),
});

export const resolvers = {
  Query: {
    // TODO: Implement channel context and permission checks
    messages: async (
      _parent: any,
      args: MessagesInput,
      { authService, dataSources }: Context
    ) => {
      await messagesInputSchema.validate(args);

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const context = args.contextType === 'chat' ? Chat : Chat;
      const contextAlias = args.contextType === 'chat' ? 'chats' : 'chats';

      const user = (await User.findOne({
        include: {
          model: context,
          as: contextAlias,
          where: { id: args.contextId },
        },
        where: { id: authService.getUserId() },
      })) as unknown as (User & Record<string, any>) | null;

      if (user === null) {
        throw new GraphQLError('User not found in context', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const messages = await dataSources.messagesDB.getMessages(args);
      return messages;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
