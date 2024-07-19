import gql from 'graphql-tag';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { merge } from 'lodash';

import dateTimeScalar from './scalars/DateTime';
import userSchema from '../resources/user/schema';
import userFriendRequestSchema from '../resources/user_friendship/schema';
import chatSchema from '../resources/chat/schema';

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
    dateTimeScalar.typeDefs,
    userSchema.typeDefs,
    userFriendRequestSchema.typeDefs,
    chatSchema.typeDefs,
  ],
  resolvers: merge(
    dateTimeScalar.resolvers,
    userSchema.resolvers,
    userFriendRequestSchema.resolvers,
    chatSchema.resolvers
  ),
});
