import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';

const types = gql`
  type User {
    id: ID!
    email: String!
    username: String!
    discriminator: String!
    password_hash: String!
    created_at: DateTime!
    last_login_at: DateTime
    profile_pic: String
    bio: String
  }

  type AllUsers {
    id: ID!
    username: String!
    discriminator: String!
  }
`;

export default {
  typeDefs: [types, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(queries.resolvers, mutations.resolvers),
};
