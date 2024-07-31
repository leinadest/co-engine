import gql from 'graphql-tag';
import { GraphQLError } from 'graphql';
import { merge } from 'lodash';

import queries from './queries';
import mutations from './mutations';
import { User } from '..';

const typeDefs = gql`
  type UserFriendRequest {
    sender: User!
    receiver: User!
    created_at: DateTime!
  }
`;

const resolvers = {
  UserFriendRequest: {
    sender: async ({ sender_id }: { sender_id: number }, _: any) => {
      const user = await User.findByPk(sender_id);

      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const resolvedUser = user.toJSON();
      delete resolvedUser.email;
      delete resolvedUser.password_hash;
      return resolvedUser;
    },
    receiver: async ({ receiver_id }: { receiver_id: number }, _: any) => {
      const user = await User.findByPk(receiver_id);

      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const resolvedUser = user.toJSON();
      delete resolvedUser.email;
      delete resolvedUser.password_hash;
      return resolvedUser;
    },
  },
};

export default {
  typeDefs: [typeDefs, queries.typeDefs, mutations.typeDefs],
  resolvers: merge(resolvers, queries.resolvers, mutations.resolvers),
};
