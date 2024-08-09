import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';
import { type Context } from '../../config/apolloServer';
import type Chat from './model';

const types = gql`
  type UserInfo {
    id: ID!
    username: String
    discriminator: String
    profile_pic: String
  }

  type Chat {
    id: ID!
    creator_id: ID!
    created_at: DateTime!
    name: String
    picture: String
    last_message_at: DateTime
    last_message: String
    users: [UserInfo!]!
  }

  type ChatInfo {
    id: ID!
    name: String
    picture: String
    last_message_at: DateTime
    last_message: String
  }

  type ChatEdge {
    cursor: String!
    node: ChatInfo!
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

const resolvers = {
  Chat: {
    users: async (chat: Chat, _: any, { dataSources }: Context) => {
      return await dataSources.usersDB.getUsersByChat(chat.id);
    },
  },
};

export default {
  typeDefs: [types, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(resolvers, queries.resolvers, mutations.resolvers),
};
