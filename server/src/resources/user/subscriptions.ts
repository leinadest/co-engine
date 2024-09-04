import gql from 'graphql-tag';
import { withFilter } from 'graphql-subscriptions';

import { pubsub } from '../../config/apolloServer';

const typeDefs = gql`
  extend type Subscription {
    userUpdated(userIds: [ID!]!): PublicUser!
  }
`;

const resolvers = {
  Subscription: {
    userUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('userUpdated'),
        ({ userUpdated }, { userIds }) =>
          userIds.includes(userUpdated.id.toString())
      ),
    },
  },
};

export default { typeDefs, resolvers };
