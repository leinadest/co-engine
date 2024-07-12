/**
 * Module dependencies
 */

import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import http from 'http';
import express from 'express';

// import config from './config'
import schema from './resources/schema';

/**
 * Database setup
 */

// TODO: implement database setup here

/**
 * Servers setup
 */

const app = express();
const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
});

const apolloServer = new ApolloServer({
  schema,
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

export { httpServer, app, apolloServer };
