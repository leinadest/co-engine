// import { type GraphQLFormattedError } from 'graphql';
import { ApolloServer } from '@apollo/server';

import AuthService from '../../src/services/authService';
import { type Context } from '../../src/config/apolloServer';
import schema from '../../src/schema';
import { sequelize } from '../../src/config/sequelize';
import { type SingleGraphQLResponse } from './types';

// const apolloErrorFormatter = (
//   formattedError: GraphQLFormattedError,
//   originalError: unknown
// ): any => {
//   return {
//     formattedError,
//     originalError,
//   };
// };

export const executeOperation = async <ResponseData>(
  query: string,
  variables?: any,
  accessToken?: string
): Promise<any> => {
  const authService = new AuthService(accessToken ?? '');

  const server = new ApolloServer<Context>({
    schema,
    // formatError: apolloErrorFormatter,
  });
  const response = (await server.executeOperation<ResponseData>(
    { query, variables },
    { contextValue: { authService, sequelize } }
  )) as SingleGraphQLResponse<ResponseData>;

  return response.body.singleResult;
};
