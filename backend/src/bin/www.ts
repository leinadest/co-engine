#!/usr/bin/env node

/**
 * Module dependencies.
 */

import express from 'express';
import debug from 'debug';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { httpServer, app, apolloServer } from '../app';

import config from '../config';

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val: string): string | number | false => {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

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
  debug('backend:server')(`Listening on ${bind}`);
};

/**
 * Start app
 */

const start = async (): Promise<void> => {
  // Get port from environment and store in Express.
  const port = normalizePort(config.port);
  app.set('port', port);

  await apolloServer.start();

  app.use('/', cors(), express.json(), expressMiddleware(apolloServer));

  // Listen on provided port, on all network interfaces.
  httpServer.listen(port);
  httpServer.on('error', onError(port));
  httpServer.on('listening', onListening);
};

start().catch((error: Error) => {
  console.log(error);
});
