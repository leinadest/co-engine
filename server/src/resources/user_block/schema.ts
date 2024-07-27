import gql from 'graphql-tag';

import mutations from './mutations';

const types = gql`
  type UserBlock {
    user_id: ID!
    blocked_user_id: ID!
    created_at: DateTime!
  }
`;

export default {
  typeDefs: [types, mutations.typeDefs],
  resolvers: mutations.resolvers,
};
