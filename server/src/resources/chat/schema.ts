import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';

const types = gql`
  type Chat {
    id: ID!
    creator_id: ID!
    created_at: DateTime!
    name: String
    picture: String
    last_message_at: DateTime
    last_message: String
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
