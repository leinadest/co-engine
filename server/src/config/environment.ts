import dotenv from 'dotenv';

if ('error' in dotenv.config()) {
  console.log(dotenv.config().error);
}

export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const PORT = process.env.PORT ?? '3000';

export const POSTGRES_URL = process.env.POSTGRES_URL as string;
export const MONGO_URL = process.env.MONGO_URL as string;

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 7; // 7 days

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;
export const DISCORD_CLIENT_SECRET = process.env
  .DISCORD_CLIENT_SECRET as string;
export const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI as string;

export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL as string;

if (NODE_ENV !== 'production') {
  console.log(module.exports);
}
