import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';

const types = gql`
  type PublicUser {
    id: ID!
    username: String!
    discriminator: String!
    created_at: DateTime!
    last_login_at: DateTime
    is_online: Boolean!
    profile_pic: String
    bio: String
  }

  type User {
    id: ID!
    email: String
    username: String!
    discriminator: String!
    created_at: DateTime!
    last_login_at: DateTime
    is_online: Boolean!
    profile_pic: String
    bio: String
  }
`;

export const PublicUserFields = gql`
  fragment PublicUserFields on PublicUser {
    id
    username
    discriminator
    created_at
    last_login_at
    is_online
    profile_pic
    bio
  }
`;

export const UserFields = gql`
  fragment UserFields on User {
    id
    email
    username
    discriminator
    created_at
    last_login_at
    is_online
    profile_pic
    bio
  }
`;

export default {
  typeDefs: [types, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(queries.resolvers, mutations.resolvers),
};
