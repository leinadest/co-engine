import { Strategy as DiscordStrategy } from 'passport-discord';

import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
} from './index';
import OAuth2User from '../resources/oauth2_user/model';
import User from '../resources/user/model';

const discordStrategy = new DiscordStrategy(
  {
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: DISCORD_REDIRECT_URI,
    scope: ['identify'],
  },
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  async (accessToken, refreshToken, profile, done) => {
    let oauth2User;
    try {
      oauth2User = await OAuth2User.findByPk(profile.id);
    } catch (error) {
      done(error);
    }
    try {
      if (oauth2User === null) {
        const user = await User.create({
          username: profile.username,
        });
        oauth2User = await OAuth2User.create({
          oauth2_user_id: profile.id,
          user_id: user.id,
          access_token: accessToken,
          refresh_token: refreshToken,
          // discriminator: profile.discriminator,
          // avatar: profile.avatar,
        });
      }
      done(null, oauth2User);
    } catch (error) {
      done(error);
    }
  }
);

export default discordStrategy;
