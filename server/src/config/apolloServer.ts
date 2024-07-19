import { type Server } from 'http';
import { type RequestHandler } from 'express';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { expressMiddleware } from '@apollo/server/express4';

import schema from '../schema';
import { sequelize } from './sequelize';
import AuthService from '../services/authService';
import { type Sequelize } from 'sequelize';

/**
 * Error formatter
 * @param error
 * @returns
 */

// const apolloErrorFormatter = (
//   formattedError: GraphQLFormattedError,
//   originalError: unknown
// ): any => {
//   return {
//     formattedError,
//     originalError,
//   };
// };

const createApolloServer = (httpServer: Server): ApolloServer => {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  });

  return new ApolloServer({
    schema,
    // formatError: apolloErrorFormatter,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        serverWillStart: async () => ({
          drainServer: async () => {
            const serverCleanup = useServer({ schema }, wsServer);
            await serverCleanup.dispose();
          },
        }),
      },
    ],
  });
};

interface Context {
  authService: AuthService;
  sequelize: Sequelize;
}

const createExpressMiddleware = (apolloServer: ApolloServer): RequestHandler =>
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      const authorization = req.headers.authorization;
      const accessToken = authorization?.replace('Bearer ', '');

      const context: Context = {
        sequelize,
        authService: new AuthService(accessToken ?? ''),
      };

      return context;
    },
  });

export { createApolloServer, createExpressMiddleware, type Context };
