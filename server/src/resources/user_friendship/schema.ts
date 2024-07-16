import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';

const types = gql`
  type UserFriendship {
    sender_id: ID!
    receiver_id: ID!
    created_at: DateTime!
    accepted_at: DateTime
    status: String!
  }
`;

export default {
  typeDefs: [types, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(queries.resolvers, mutations.resolvers),
};
