import { AuthenticationError } from 'apollo-server-errors';
import jwt from 'jsonwebtoken';

import { JWT_SECRET, ACCESS_TOKEN_EXPIRATION_TIME } from '../config';
import User from '../resources/user/model';
import OAuth2User from '../resources/oauth2_user/model';

const subject = 'accessToken';

class AuthService {
  accessToken;

  /**
   * Constructs a new instance of the class with the provided access token.
   *
   * @param {string} accessToken - The access token to be set.
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Creates an access token for the given user ID.
   *
   * @param {number} userId - The ID of the user for whom the access token is created
   * @return {{ accessToken: any; expiresAt: Date; }} The generated access token along with its expiration date
   */
  static createAccessToken(userId: number): {
    accessToken: any;
    expiresAt: Date;
  } {
    return {
      accessToken: jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION_TIME,
        subject,
      }),
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRATION_TIME * 1000),
    };
  }

  /**
   * Retrieves or creates a user based on the OAuth2 profile.
   *
   * @param {any} profile - The OAuth2 profile used to retrieve or create the user
   * @return {Promise<User>} The user retrieved or created based on the OAuth2 profile
   */
  static async getOAuth2User(profile: any): Promise<User | null> {
    const user = await User.findOne({
      include: [{ model: OAuth2User, where: { oauth2_user_id: profile.id } }],
    });
    return user;
  }

  /**
   * Retrieves the user ID from the token payload based on the access token.
   *
   * @return {number | null} The user ID extracted from the token payload, or null if the token is invalid.
   */
  getUserId(): number | null {
    if (this.accessToken === '') {
      return null;
    }

    let tokenPayload;
    try {
      tokenPayload = jwt.verify(this.accessToken, JWT_SECRET, {
        subject,
      }) as { userId: number };
    } catch (e) {
      return null;
    }

    return tokenPayload.userId;
  }

  /**
   * Retrieves a user based on the access token.
   *
   * @return {Promise<User | null>} A promise that resolves to the User object if found, or null if not found.
   */
  async getUser(): Promise<User | null> {
    const id = this.getUserId();

    if (id === null) {
      return null;
    }

    return await User.findByPk(id, { include: [{ model: OAuth2User }] });
  }

  /**
   * Retrieves a user based on the access token or throws an error if user is not found.
   *
   * @param {Error} error - The error object to be normalized
   * @return {Promise<User>} The user associated with the access token
   */
  async getUserOrFail(error: Error): Promise<User> {
    const normalizedError =
      error ?? new AuthenticationError('Authorization is required');

    const user = await this.getUser();

    if (user === null) {
      throw normalizedError;
    }

    return user;
  }
}

export default AuthService;
