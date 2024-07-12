#!/usr/bin/env node

/**
 * Module dependencies.
 */

import express from 'express';
import debug from 'debug';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { httpServer, app, apolloServer } from '../app';

import { PORT } from '../utils/config';
import { connectToDatabase } from '../utils/sequelize';

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

const onListening = (): void => {
  const addr = httpServer.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  debug('server:server')(`Listening on ${bind}`);
};

/**
 * Start app
 */

const start = async (): Promise<void> => {
  await connectToDatabase();
  await apolloServer.start();

  app.set('port', PORT);
  app.use('/', cors(), express.json(), expressMiddleware(apolloServer));

  httpServer.listen(PORT);
  httpServer.on('error', onError(PORT));
  httpServer.on('listening', onListening);
};

start().catch((error: Error) => {
  console.log(error);
});
