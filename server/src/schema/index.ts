import gql from 'graphql-tag';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { merge } from 'lodash';

import dateTime from './scalars/DateTime';
import userSchema from '../resources/user/schema';
import userFriendRequestSchema from '../resources/user_friendship/schema';

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
    userSchema.typeDefs,
    userFriendRequestSchema.typeDefs,
    dateTime.typeDefs,
  ],
  resolvers: merge(
    userSchema.resolvers,
    userFriendRequestSchema.resolvers,
    dateTime.resolvers
  ),
});
