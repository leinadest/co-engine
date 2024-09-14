import { type GraphQLFormattedError } from 'graphql';
import { type Server } from 'http';
import { ApolloServer } from '@apollo/server';
import { type Disposable } from 'graphql-ws';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import { type Sequelize } from 'sequelize';
import { PostgresPubSub } from 'graphql-pg-subscriptions';
import { Client } from 'pg';
import { type RequestHandler } from 'express';

import sequelize from './sequelize';
import AuthService from '../services/authService';
import { NODE_ENV, POSTGRES_URL } from './environment';
import schema from '../schema';
import UsersDataSource from '../resources/user/dataSource';
import MessagesDataSource from '../resources/message/dataSource';
import UserFriendRequestsDataSource from '../resources/user_friend_request/dataSource';
import ChatsDataSource from '../resources/chat/dataSource';
import UserBlocksDataSource from '../resources/user_block/dataSource';

export interface Context {
  sequelize: Sequelize;
  authService: AuthService;
  dataSources: {
    usersDB: UsersDataSource;
    messagesDB: MessagesDataSource;
    friendRequestsDB: UserFriendRequestsDataSource;
    chatsDB: ChatsDataSource;
    blocksDB: UserBlocksDataSource;
  };
}

export const createApolloServer = (
  httpServer: Server,
  serverCleanup: Disposable
): ApolloServer<Context> => {
  const formatError = (
    formattedError: GraphQLFormattedError,
    originalError: any
  ): any => {
    const errorResponse: { message: string; code: string; stack?: any } = {
      message: formattedError.message,
      code: formattedError.extensions?.code as string,
    };

    if ((originalError.stack as string)?.includes('ValidationError')) {
      errorResponse.code = 'BAD_USER_INPUT';
    }

    if (errorResponse.code === undefined) {
      errorResponse.code = 'INTERNAL_SERVER_ERROR';
    }

    if (NODE_ENV !== 'production') {
      errorResponse.stack = originalError.stack;
    }

    return errorResponse;
  };

  const httpServerDrainPlugin = ApolloServerPluginDrainHttpServer({
    httpServer,
  });
  const wsServerDrainPlugin = {
    serverWillStart: async () => ({
      drainServer: async () => {
        await serverCleanup.dispose();
      },
    }),
  };

  return new ApolloServer<Context>({
    schema,
    formatError,
    plugins: [httpServerDrainPlugin, wsServerDrainPlugin],
  });
};

export const createExpressMiddleware = (
  apolloServer: ApolloServer<Context>
): RequestHandler => {
  const context = async ({ req }: any): Promise<any> => {
    const authorization = req.headers.authorization as string;
    const accessToken = authorization?.replace('Bearer ', '');

    const authService = new AuthService(accessToken ?? '');
    const usersDB = new UsersDataSource(authService);
    const messagesDB = new MessagesDataSource(usersDB);
    const friendRequestsDB = new UserFriendRequestsDataSource(
      usersDB,
      authService
    );
    const chatsDB = new ChatsDataSource(authService, usersDB);
    const blocksDB = new UserBlocksDataSource(authService);

    return {
      sequelize,
      authService,
      dataSources: {
        usersDB,
        messagesDB,
        friendRequestsDB,
        chatsDB,
        blocksDB,
      },
    };
  };

  return expressMiddleware<Context>(apolloServer, { context });
};

const createPubSub = (): PostgresPubSub => {
  const client = new Client({ connectionString: POSTGRES_URL });
  client.connect();
  return new PostgresPubSub({ client });
};

export const pubsub = createPubSub();
