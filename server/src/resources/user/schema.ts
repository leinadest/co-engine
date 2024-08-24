import gql from 'graphql-tag';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';
import { type Context } from '../../config/apolloServer';
import { type ChatsInput } from '../chat/queries';
import type User from './model';

const typeDefs = gql`
  type PublicUser {
    id: ID!
    username: String!
    discriminator: String!
    created_at: DateTime!
    last_login_at: DateTime
    is_online: Boolean!
    profile_pic: String
    profile_pic_url: String
    bio: String
  }

  type PublicUserEdge {
    cursor: String!
    node: PublicUser!
  }

  type PublicUserConnection {
    edges: [PublicUserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int
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
    profile_pic_url: String
    bio: String
    chats(query: ChatsInput): ChatConnection!
  }

  type UserEdge {
    cursor: String!
    node: User!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
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
    profile_pic_url
    bio
  }
`;

export const PublicUserConnectionFields = gql`
  fragment PublicUserConnectionFields on PublicUserConnection {
    edges {
      cursor
      node {
        id
        username
        discriminator
        created_at
        last_login_at
        is_online
        profile_pic
        profile_pic_url
        bio
      }
    }
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
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
    profile_pic_url
    bio
  }
`;

const resolvers = {
  User: {
    chats: async (_: User, args: ChatsInput, { dataSources }: Context) => {
      return await dataSources.chatsDB.getChats(args);
    },
  },
};

export default {
  typeDefs: [typeDefs, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(resolvers, queries.resolvers, mutations.resolvers),
};
