import gql from 'graphql-tag';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { merge } from 'lodash';

import dateTime from './scalars/DateTime';
import UserType from './types/User';
import AuthenticatePayloadType from './types/AuthenticatePayload';
import userQueries from '../resources/user/queries';
import userMutations from '../resources/user/mutations';

const rootTypeDefs = gql`
  type Query {
    root: String
  }

  type Mutation {
    root: String
  }
`;

export default makeExecutableSchema({
  typeDefs: [
    rootTypeDefs,
    UserType,
    AuthenticatePayloadType,
    dateTime.typeDefs,
    userQueries.typeDefs,
    userMutations.typeDefs,
  ],
  resolvers: merge(
    dateTime.resolvers,
    userQueries.resolvers,
    userMutations.resolvers
  ),
});
