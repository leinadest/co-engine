import dotenv from 'dotenv';

if (dotenv.config().error !== undefined) {
  throw dotenv.config().error as Error;
}

const variables = {
  NODE_ENV: process.env.NODE_EN ?? 'development',
  PORT: process.env.PORT ?? '3000',

  POSTGRES_URL: process.env.POSTGRES_URL as string,
  MONGO_URL: process.env.MONGO_URL as string,
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL as string,

  JWT_SECRET: process.env.JWT_SECRET as string,
  ACCESS_TOKEN_EXPIRATION_TIME: 60 * 60 * 24 * 7,

  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID as string,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET as string,
  DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI as string,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
};

Object.entries(variables).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

if (variables.NODE_ENV !== 'production') {
  console.log(variables);
}

export const {
  NODE_ENV,
  PORT,
  POSTGRES_URL,
  MONGO_URL,
  FRONTEND_BASE_URL,
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRATION_TIME,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
}: typeof variables = variables;
