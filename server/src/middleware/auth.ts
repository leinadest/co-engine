import { type RequestHandler } from 'express';
import passport from 'passport';

import AuthService from '../services/authService';
import { type OAuth2User } from '../resources';
import { FRONTEND_BASE_URL } from '../config/environment';

export const auth = (strategy: string): RequestHandler =>
  passport.authenticate(strategy, {
    session: false,
    failureRedirect: `${FRONTEND_BASE_URL}/login`,
  });

export const redirectAuth: RequestHandler = (req, res) => {
  const { accessToken, expiresAt } = AuthService.createAccessToken(
    (req.user as OAuth2User).user_id
  );
  res.redirect(
    `${FRONTEND_BASE_URL}/oauth2?accessToken=${accessToken}&expiresAt=${expiresAt.toISOString()}`
  );
};
