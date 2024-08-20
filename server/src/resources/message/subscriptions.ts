import gql from 'graphql-tag';
import { withFilter } from 'graphql-subscriptions';

import { pubsub } from '../../config/apolloServer';

const typeDefs = gql`
  extend type Subscription {
    messageCreated(contextType: String!, contextId: String!): Message!
    messageEdited(contextType: String!, contextId: String!): Message!
  }
`;

const resolvers = {
  Subscription: {
    messageCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('messageCreated'),
        ({ messageCreated }, variables) =>
          variables.contextType === messageCreated.context_type &&
          variables.contextId === messageCreated.context_id
      ),
    },
    messageEdited: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('messageEdited'),
        ({ messageEdited }, variables) => {
          const match =
            variables.contextType === messageEdited.context_type &&
            variables.contextId === messageEdited.context_id;
          console.log(match);
          return match;
        }
      ),
    },
  },
};

export default { typeDefs, resolvers };
