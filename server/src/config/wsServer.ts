import type http from 'http';
import { type Disposable } from 'graphql-ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';

import schema from '../schema';
import ChatsDataSource from '../resources/chat/dataSource';
import MessagesDataSource from '../resources/message/dataSource';
import UsersDataSource from '../resources/user/dataSource';
import UserFriendRequestsDataSource from '../resources/user_friend_request/dataSource';
import AuthService from '../services/authService';
import sequelize from './sequelize';

const createWsServer = (httpServer: http.Server): Disposable => {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/api/graphql',
  });

  return useServer(
    {
      schema,
      context: (ctx) => {
        const authorization = ctx.connectionParams?.authorization as string;
        const accessToken = authorization?.replace('Bearer ', '');

        const authService = new AuthService(accessToken ?? '');
        const usersDB = new UsersDataSource(authService);
        const messagesDB = new MessagesDataSource(usersDB);
        const friendRequestsDB = new UserFriendRequestsDataSource(
          usersDB,
          authService
        );
        const chatsDB = new ChatsDataSource(authService, usersDB);

        return {
          sequelize,
          authService,
          dataSources: {
            usersDB,
            messagesDB,
            friendRequestsDB,
            chatsDB,
          },
        };
      },
    },
    wsServer
  );
};

export default createWsServer;
