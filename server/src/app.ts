#!/usr/bin/env node

import http from 'http';
import express from 'express';
import debug from 'debug';
import passport from 'passport';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import { PORT } from './config/environment';
import sequelize from './config/sequelize';
import connectToMongo from './config/mongo';
import discordStrategy from './config/passport';
import {
  createApolloServerConfig,
  expressMiddlewareOptions,
  type Context,
} from './config/apolloServer';
import { auth, redirectAuth } from './middleware/auth';

// App setup
const app = express();

// Servers setup
const httpServer = http.createServer(app);
const apolloServer = new ApolloServer(createApolloServerConfig(httpServer));

// Auth setup
passport.use(discordStrategy);

// Routes setup
app.use(cors(), express.json());
app.use('/api/auth/discord', auth('discord'));
app.use('/api/auth/discord/redirect', redirectAuth);

/**
 * Starts the HTTP server and handles any errors that occur during the process.
 *
 * @return {Promise<void>} A Promise that resolves when the server is successfully started.
 */
const startHttpServer = async (): Promise<void> => {
  const onError = (error: any): void => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind =
      typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT as string}`;

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

  const onListening = (): void => {
    const addr = httpServer.address();
    const bind =
      typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    debug('server:server')(`Listening on ${bind}`);
  };

  httpServer.listen(PORT);
  httpServer.on('error', onError);
  httpServer.on('listening', onListening);
};

// Start the servers, database connections, and graphql route
Promise.all([
  sequelize.authenticate(),
  connectToMongo(),
  startHttpServer(),
  apolloServer.start(),
])
  .then(() => {
    app.use(
      '/api/graphql',
      expressMiddleware<Context>(apolloServer, expressMiddlewareOptions)
    );
  })
  .catch((error: Error) => {
    console.log(error);
  });
