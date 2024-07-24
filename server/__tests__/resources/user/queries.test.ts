import { ApolloServer } from '@apollo/server';
import jwt from 'jsonwebtoken';

import { type Context } from '../../../src/config/apolloServer';
import schema from '../../../src/schema';
import { User } from '../../../src/resources';
import AuthService from '../../../src/services/authService';
import sequelize from '../../../src/config/sequelize';
import {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRATION_TIME,
} from '../../../src/config/environment';
import { type SingleGraphQLResponse } from '../types';

describe('User Queries Integration Tests', () => {
  const GET_USERS = `query { users { id username discriminator } }`;

  const GET_USER = `
    query($id: ID!) {
      user(id: $id) {
        id
        username
        discriminator
        created_at
        is_online
        last_login_at
        profile_pic
        bio
      }
    }`;

  const GET_ME = `
    query {
      me {
        id
        email
        username
        discriminator
        created_at
        is_online
        last_login_at
        profile_pic
        bio
      }
    }`;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.truncate({ cascade: true, restartIdentity: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should return all users', async () => {
    // Set up users and server
    const users = await User.bulkCreate([
      {
        username: 'test1',
        email: 'test1',
        password: 'test1',
      },
      {
        username: 'test2',
        email: 'test2',
        password: 'test2',
      },
    ]);
    const server = new ApolloServer<Context>({ schema });

    // Define expectation
    const expectedResult = users.map((user) => ({
      id: user.id.toString(),
      username: user.username,
      discriminator: user.discriminator,
    }));

    // Execute query
    interface ResponseData {
      users: typeof expectedResult;
    }
    const response = (await server.executeOperation<ResponseData>({
      query: GET_USERS,
    })) as SingleGraphQLResponse<ResponseData>;

    // Get result
    const result = response.body.singleResult.data.users;

    // Assert
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual(expectedResult[0]);
    expect(result[1]).toEqual(expectedResult[1]);
  });

  it('should return the user with the specified id', async () => {
    // Set up user and server
    const user = await User.create({
      username: 'test',
      email: 'test',
      password: 'test',
    });
    const server = new ApolloServer<Context>({ schema });

    // Define expectation
    const expectedResult = {
      ...user.toJSON(),
      id: user.id.toString(),
      created_at: user.created_at.toISOString(),
    };
    delete expectedResult.email;
    delete expectedResult.password_hash;

    // Execute query
    interface ResponseData {
      user: typeof user;
    }
    const response = (await server.executeOperation<ResponseData>({
      query: GET_USER,
      variables: { id: user.id.toString() },
    })) as SingleGraphQLResponse<ResponseData>;

    // Get result
    const result = response.body.singleResult.data.user;

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should return the authenticated user', async () => {
    // Set up data and server
    const user = await User.create({
      username: 'test',
      discriminator: '1234',
      email: 'test',
      password: 'test',
    });
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
      subject: 'accessToken',
    });
    const authService = new AuthService(accessToken);
    const server = new ApolloServer<Omit<Context, 'sequelize'>>({ schema });

    // Define expectation
    const expectedResult = {
      ...user.toJSON(),
      id: user.id.toString(),
      created_at: user.created_at.toISOString(),
    };
    delete expectedResult.password_hash;

    // Execute query
    interface ResponseData {
      me: typeof expectedResult;
    }
    const response = (await server.executeOperation<ResponseData>(
      { query: GET_ME },
      { contextValue: { authService } }
    )) as SingleGraphQLResponse<ResponseData>;

    // Get result
    const result = response.body.singleResult.data.me;

    // Assert
    expect(result).toEqual(response.body.singleResult.data.me);
  });
});
