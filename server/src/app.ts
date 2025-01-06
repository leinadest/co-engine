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
  connectPubSub,
  createApolloServer,
  createExpressMiddleware,
} from './config/apolloServer';
import { auth, redirectAuth } from './middleware/auth';
import startHttpServer from './config/httpServer';
import createWsServer from './config/wsServer';

// App setup
const app = express();
app.use(
  cors<cors.CorsRequest>({
    origin: ['http://localhost:3000', 'https://co-engine.vercel.app'],
  }),
  express.json()
);

// Oauth2 routes setup
app.use('/api/auth/discord', auth('discord'));
app.use('/api/auth/discord/redirect', redirectAuth);

// Auth setup
passport.use(discordStrategy);

// Handle requests during startup
let isServerReady = false;
app.use((_, res, next) => {
  if (isServerReady) {
    next();
  } else {
    res
      .status(503)
      .send('Server starting up, please try again in a few seconds.');
  }
});

// HTTP server setup
const httpServer = http.createServer(app);
startHttpServer(httpServer);

// Apollo server setup
const wsServerCleanup = createWsServer(httpServer);
const apolloServer = createApolloServer(httpServer, wsServerCleanup);

// Connect to databases and start Apollo server
Promise.all([
  connectToPostgres(),
  connectPubSub(),
  connectToMongo(),
  apolloServer.start(),
])
  .then(() => {
    app.use(
      '/api/graphql',
      graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
      createExpressMiddleware(apolloServer)
    );
    isServerReady = true;
  })
  .catch(console.log);
