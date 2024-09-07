import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';
import { type Context } from '../../config/apolloServer';
import type Chat from './model';

const types = gql`
  type Chat {
    id: ID!
    creator_id: ID!
    created_at: DateTime!
    name: String
    picture: String
    last_message_at: DateTime
    last_message: String
    users: [PublicUser!]!
    messages(
      search: String
      after: String
      first: Int
      orderDirection: String
      orderBy: String
    ): MessageConnection!
  }

  type ChatEdge {
    cursor: String!
    node: Chat!
  }

  type ChatConnection {
    edges: [ChatEdge!]!
    pageInfo: PageInfo!
  }

  type ChatUser {
    chat_id: ID!
    user_id: ID!
  }
`;

interface ChatMessagesInput {
  search?: string;
  after?: string;
  first?: number;
  orderDirection?: 'ASC' | 'DESC';
  orderBy?: '_id' | 'created_at';
}

const resolvers = {
  Chat: {
    users: async (chat: Chat, _: any, { dataSources }: Context) => {
      return await dataSources.usersDB.getUsersByChat(chat.id);
    },
    messages: async (
      chat: Chat,
      args: ChatMessagesInput,
      { dataSources }: Context
    ) => {
      return await dataSources.messagesDB.getMessages({
        ...args,
        contextId: chat.id,
        contextType: 'chat',
      });
    },
  },
};

export default {
  typeDefs: [types, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(resolvers, queries.resolvers, mutations.resolvers),
};
