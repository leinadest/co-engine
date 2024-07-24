import { type GraphQLFormattedError } from 'graphql';
import { type Server } from 'http';
import { type ApolloServerOptions } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { type ExpressMiddlewareOptions } from '@apollo/server/express4';
import { type WithRequired } from '@apollo/utils.withrequired';
import { type Sequelize } from 'sequelize';

import schema from '../schema';
import sequelize from './sequelize';
import AuthService from '../services/authService';
import { NODE_ENV } from './environment';

export const apolloErrorFormatter = (
  formattedError: GraphQLFormattedError,
  originalError: any
): any => {
  const errorResponse: { message: string; code: string; stack?: any } = {
    message: formattedError.message,
    code:
      (formattedError.extensions?.code as string) ?? 'INTERNAL_SERVER_ERROR',
  };

  if (NODE_ENV !== 'production') {
    errorResponse.stack = originalError.stack;
  }

  return errorResponse;
};

export interface Context {
  authService: AuthService;
  sequelize: Sequelize;
}

export const createApolloServerConfig = (
  httpServer: Server
): ApolloServerOptions<Context> => {
  const wsServer = new WebSocketServer({ server: httpServer, path: '/' });

  const httpServerDrainPlugin = ApolloServerPluginDrainHttpServer({
    httpServer,
  });
  const apolloServerDrainPlugin = {
    serverWillStart: async () => ({
      drainServer: async () => {
        const serverCleanup = useServer({ schema }, wsServer);
        await serverCleanup.dispose();
      },
    }),
  };

  const createdConfig = {
    schema,
    formatError: apolloErrorFormatter,
    plugins: [httpServerDrainPlugin, apolloServerDrainPlugin],
  };

  return createdConfig;
};

export const expressMiddlewareOptions: WithRequired<
  ExpressMiddlewareOptions<Context>,
  'context'
> = {
  context: async ({ req }) => {
    const authorization = req.headers.authorization;
    const accessToken = authorization?.replace('Bearer ', '');

    const context: Context = {
      sequelize,
      authService: new AuthService(accessToken ?? ''),
    };

    return context;
  },
};
