import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';

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

export default {
  typeDefs: [types, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(queries.resolvers, mutations.resolvers),
};
