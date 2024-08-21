import gql from 'graphql-tag';
import { withFilter } from 'graphql-subscriptions';

import { type Context, pubsub } from '../../config/apolloServer';

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
        ({ messageCreated }, variables, { authService }: Context) => {
          if (
            authService.getUserId() === null ||
            authService.getUserId() === messageCreated.creator_id
          ) {
            return false;
          }
          return (
            variables.contextType === messageCreated.context_type &&
            variables.contextId === messageCreated.context_id
          );
        }
      ),
    },
    messageEdited: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('messageEdited'),
        ({ messageEdited }, variables, { authService }: Context) => {
          if (
            authService.getUserId() === null ||
            authService.getUserId() === messageEdited.creator_id
          ) {
            return false;
          }
          return (
            variables.contextType === messageEdited.context_type &&
            variables.contextId === messageEdited.context_id
          );
        }
      ),
    },
  },
};

export default { typeDefs, resolvers };
