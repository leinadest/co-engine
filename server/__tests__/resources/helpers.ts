// import { type GraphQLFormattedError } from 'graphql';
import { ApolloServer } from '@apollo/server';

import AuthService from '../../src/services/authService';
import {
  apolloErrorFormatter,
  type Context,
} from '../../src/config/apolloServer';
import schema from '../../src/schema';
import sequelize from '../../src/config/sequelize';
import { type SingleGraphQLResponse } from './types';
import { type DocumentNode } from 'graphql';
import UsersDataSource from '../../src/resources/user/dataSource';
import MessagesDataSource from '../../src/resources/message/dataSource';
import UserFriendRequestsDataSource from '../../src/resources/user_friend_request/dataSource';

export const executeOperation = async <ResponseData>(
  query: string | DocumentNode,
  variables?: any,
  accessToken?: string
): Promise<any> => {
  const server = new ApolloServer<Context>({
    schema,
    formatError: apolloErrorFormatter,
  });

  const authService = new AuthService(accessToken ?? '');
  const usersDB = new UsersDataSource(authService);
  const messagesDB = new MessagesDataSource(usersDB);
  const friendRequestsDB = new UserFriendRequestsDataSource(
    usersDB,
    authService
  );

  const contextValue = {
    sequelize,
    authService,
    dataSources: {
      usersDB,
      messagesDB,
      friendRequestsDB,
    },
  };

  const response = (await server.executeOperation<ResponseData>(
    { query, variables },
    { contextValue }
  )) as SingleGraphQLResponse<ResponseData>;

  return response.body.singleResult;
};
