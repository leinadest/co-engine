import gql from 'graphql-tag';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { merge } from 'lodash';

import dateTimeScalar from './scalars/DateTime';
import userSchema from '../resources/user/schema';
import userFriendRequestSchema from '../resources/user_friend_request/schema';
import userFriendshipSchema from '../resources/user_friendship/schema';
import chatSchema from '../resources/chat/schema';
import messageSchema from '../resources/message/schema';
import userBlockSchema from '../resources/user_block/schema';

const rootTypeDefs = gql`
  type Query {
    root: String
  }

  type Mutation {
    root: String
  }
`;

const rootPaginationTypeDefs = gql`
  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
    hasPreviousPage: Boolean
    startCursor: String
  }
`;

export default makeExecutableSchema({
  typeDefs: [
    rootTypeDefs,
    rootPaginationTypeDefs,
    dateTimeScalar.typeDefs,
    userSchema.typeDefs,
    userFriendRequestSchema.typeDefs,
    userFriendshipSchema.typeDefs,
    chatSchema.typeDefs,
    messageSchema.typeDefs,
    userBlockSchema.typeDefs,
  ],
  resolvers: merge(
    dateTimeScalar.resolvers,
    userSchema.resolvers,
    userFriendRequestSchema.resolvers,
    userFriendshipSchema.resolvers,
    chatSchema.resolvers,
    messageSchema.resolvers,
    userBlockSchema.resolvers
  ),
});
