#!/usr/bin/env node

/**
 * Module dependencies
 */

import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import http from 'http';
import express from 'express';
import debug from 'debug';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
// import { type RequestHandler } from 'express-serve-static-core';
// import { type ParsedQs } from 'qs';

import { PORT } from './utils/config';
import { connectToPostgres } from './utils/sequelize';
import { connectToMongo } from './utils/mongo';
import schema from './schema';
import User from './resources/user/model';
import AuthService from './services/authService';
// import { type GraphQLFormattedError } from 'graphql/error/GraphQLError';

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (port: any) => (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = (httpServer: http.Server) => () => {
  const addr = httpServer.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  debug('server:server')(`Listening on ${bind}`);
};

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

/**
 * App startup
 */

const start = async (): Promise<void> => {
  // Servers setup

  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  });

  const apolloServer = new ApolloServer({
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

  await Promise.all([
    connectToPostgres(),
    connectToMongo(),
    apolloServer.start(),
  ]);

  // Auth setup

  const localStrategy = new LocalStrategy(
    { usernameField: 'email' },
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (user === null) {
          done(null, false, { message: 'Incorrect email' });
          return;
        }

        const passwordIsValid = await bcrypt.compare(
          password,
          user.getDataValue('password_hash') as string
        );
        if (passwordIsValid) {
          done(null, false, { message: 'Incorrect password' });
        }

        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  );

  passport.use(localStrategy);

  // const authenticate = (
  //   strategy: string
  // ): RequestHandler<object, any, any, ParsedQs, Record<string, any>> =>
  //   passport.authenticate(strategy, { session: false });

  // Routes setup

  app.set('port', PORT);
  app.use(cors(), express.json());
  app.use(
    '/api/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const authorization = req.headers.authorization;
        const accessToken = authorization?.replace('Bearer ', '');

        const context: any = {
          user: req.user,
          authService: new AuthService(accessToken ?? ''),
        };

        return context;
      },
    })
  );

  // Start server

  httpServer.listen(PORT);
  httpServer.on('error', onError(PORT));
  httpServer.on('listening', onListening(httpServer));
};

/**
 * Start app
 */

start().catch((error: Error) => {
  console.log(error);
});
