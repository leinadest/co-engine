#!/usr/bin/env node

import http from 'http';
import express from 'express';
import passport from 'passport';
import cors from 'cors';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

import { connectToPostgres } from './config/sequelize';
import connectToMongo from './config/mongo';
import discordStrategy from './config/passport';
import {
  createApolloServer,
  createExpressMiddleware,
} from './config/apolloServer';
import { auth, redirectAuth } from './middleware/auth';
import startHttpServer from './config/httpServer';
import createWsServer from './config/wsServer';

// App setup
const app = express();

// Servers setup
const httpServer = http.createServer(app);
const wsServerCleanup = createWsServer(httpServer);
const apolloServer = createApolloServer(httpServer, wsServerCleanup);

// Auth setup
passport.use(discordStrategy);

// Routes setup
app.use(
  cors<cors.CorsRequest>({
    origin: ['http://localhost:3000', 'https://co-engine.vercel.app'],
  }),
  express.json()
);
app.use('/api/auth/discord', auth('discord'));
app.use('/api/auth/discord/redirect', redirectAuth);

// Start the servers, database connections, and graphql route
Promise.all([
  connectToPostgres(),
  connectToMongo(),
  startHttpServer(httpServer),
  apolloServer.start(),
])
  .then(() => {
    app.use(
      '/api/graphql',
      graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
      createExpressMiddleware(apolloServer)
    );
  })
  .catch((error: Error) => {
    console.log(error);
  });
