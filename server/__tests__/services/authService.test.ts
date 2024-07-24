import jwt from 'jsonwebtoken';

import AuthService from '../../src/services/authService';
import {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRATION_TIME,
} from '../../src/config/environment';
import { User } from '../../src/resources';
import sequelize from '../../src/config/sequelize';

describe('AuthService Unit Tests', () => {
  describe('createAccessToken', () => {
    it('creates an access token for the given user ID', () => {
      const userId = '1';
      const expiresAt = new Date(
        Date.now() + ACCESS_TOKEN_EXPIRATION_TIME * 1000
      );

      const result = AuthService.createAccessToken(userId);
      const decodedAccessToken = jwt.verify(result.accessToken, JWT_SECRET, {
        subject: 'accessToken',
      }) as { userId: number };
      const deltaExpiresAt = result.expiresAt.getTime() - expiresAt.getTime();

      expect(result.accessToken).toBeDefined();
      expect(decodedAccessToken.userId).toEqual(userId);
      expect(result.expiresAt).toBeDefined();
      expect(deltaExpiresAt).toBeLessThan(1000);
    });
  });

  describe('getUserId', () => {
    it('returns the user ID from the token payload', () => {
      const userId = '1';
      const accessToken = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
        subject: 'accessToken',
      });

      const authService = new AuthService(accessToken);

      expect(authService.getUserId()).toEqual(userId);
    });

    it('returns null if the token is invalid', () => {
      const invalidAccessTokens = ['', 'invalidToken'];
      const userIds: any[] = [];

      invalidAccessTokens.forEach((accessToken) => {
        userIds.push(new AuthService(accessToken).getUserId());
      });

      expect(userIds).toEqual(invalidAccessTokens.map(() => null));
    });
  });
});

describe('AuthService Integration Tests', () => {
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

  it('should return a user when authenticated', async () => {
    // Set up test data
    const user = await User.create({
      username: 'test',
      email: 'test',
      password: 'test',
    });

    const { accessToken } = AuthService.createAccessToken(user.id);
    const authService = new AuthService(accessToken);

    // Define expected result
    const expectedResult = user.get({ plain: true });

    // Get result
    const userReturned = await authService.getUser();
    const result = userReturned?.get({ plain: true });

    // Assert
    expect(result).toEqual(expectedResult);
  });

  it('should return null when not authenticated', async () => {
    // Set up test data
    const invalidAccessToken = '';
    const authService = new AuthService(invalidAccessToken);

    // Define expected result
    const expectedResult = null;

    // Get result
    const result = await authService.getUser();

    // Assert
    expect(result).toBe(expectedResult);
  });
});
