import { parseExpirationTime } from '@/utils/time';
import { config } from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = config();

if (envFound.error) {
  throw new Error("Couldn't find .env file  ");
}

export default {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT + '', 10),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: parseExpirationTime(process.env.JWT_EXPIRES_IN),
  refreshTokenExpire: parseExpirationTime(
    process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  ),
};
