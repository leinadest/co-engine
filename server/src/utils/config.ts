import dotenv from 'dotenv';

if ('error' in dotenv.config()) {
  console.log(dotenv.config().error);
}

export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const PORT = process.env.PORT ?? '3000';
export const POSTGRES_URL = process.env.POSTGRES_URL as string;
export const MONGO_URL = process.env.MONGO_URL as string;
