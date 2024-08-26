import gql from 'graphql-tag';
import merge from 'lodash/merge';

import queries from './queries';
import mutations from './mutations';
import { type Context } from '../../config/apolloServer';

const types = gql`
  type UserBlock {
    user: UserInfo!
    blocked_user: UserInfo!
    created_at: DateTime!
  }

  type UserBlockEdge {
    cursor: String!
    node: UserBlock!
  }

  type UserBlockConnection {
    totalCount: Int!
    edges: [UserBlockEdge!]!
    pageInfo: PageInfo!
  }
`;

const resolvers = {
  UserBlock: {
    user: async (_: any, __: any, { authService }: Context) =>
      await authService.getUser(),
    blocked_user: (userBlock: any) => userBlock.blocked_user,
  },
};

export default {
  typeDefs: [types, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(resolvers, queries.resolvers, mutations.resolvers),
};
