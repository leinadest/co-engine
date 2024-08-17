import gql from 'graphql-tag';
import { GraphQLError } from 'graphql';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';
import { type Context } from '../../config/apolloServer';

const typeDefs = gql`
  type UserFriendRequest {
    sender: User!
    receiver: User!
    created_at: DateTime!
  }

  type UserFriendRequests {
    data: [UserFriendRequest!]!
    meta: Meta!
  }
`;

const resolvers = {
  UserFriendRequest: {
    sender: async (
      { sender_id }: { sender_id: number },
      _: any,
      { dataSources }: Context
    ) => {
      const user = await dataSources.usersDB.getUserById(sender_id);

      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return user;
    },
    receiver: async (
      { receiver_id }: { receiver_id: number },
      _: any,
      { dataSources }: Context
    ) => {
      const user = await dataSources.usersDB.getUserById(receiver_id);

      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return user;
    },
  },
};

export default {
  typeDefs: [typeDefs, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(resolvers, queries.resolvers, mutations.resolvers),
};
