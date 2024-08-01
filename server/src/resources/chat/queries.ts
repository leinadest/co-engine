import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import * as yup from 'yup';

import { type Context } from '../../config/apolloServer';
import { type Chat } from '..';

const typeDefs = gql`
  input ChatsInput {
    search: String
    orderBy: String
    orderDirection: String
    after: String
    first: Int
  }

  extend type Query {
    """
    Returns all chats that the authenticated user is in.
    """
    chats(query: ChatsInput): ChatConnection!

    """
    Returns a single chat.
    """
    chat(id: ID!): Chat
  }
`;

interface ChatsInput {
  search?: string;
  orderBy?: string;
  orderDirection?: string;
  after?: string;
  first?: number;
}

const chatsInputSchema = yup
  .object()
  .optional()
  .shape({
    search: yup.string().trim(),
    orderBy: yup
      .string()
      .trim()
      .oneOf(
        ['last_message_at', 'name', 'created_at'],
        'orderBy must be last_message_at, name, or created_at'
      ),
    orderDirection: yup
      .string()
      .oneOf(['ASC', 'DESC'], 'orderDirection must be ASC or DESC'),
    after: yup.string(),
    first: yup.number().min(1, 'first must be greater than or equal to 1'),
  });

const resolvers = {
  Query: {
    chats: async (
      _: any,
      { query }: { query: ChatsInput },
      { authService, dataSources }: Context
    ) => {
      await chatsInputSchema.validate(query);

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.chatsDB.getChats(query ?? {});
    },

    chat: async (
      _: any,
      { id }: { id: string },
      { authService, dataSources }: Context
    ): Promise<Chat | null> => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.chatsDB.getChat(id);
    },
  },
};

export default { typeDefs, resolvers };
