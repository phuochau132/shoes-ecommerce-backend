import config from '@/config';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
export const comparePassword = async (password: string, dbPassword: string) =>
  compare(password, dbPassword);

const decodedToken = (token: string) => {
  return <{ id: string }>verify(token, config.jwtSecret as string);
};

const createToken = (id: string, time?: number) => {
  return sign({ id }, config.jwtSecret as string, {
    expiresIn: time ? time : config.jwtExpire,
  });
};

export { createToken, decodedToken };
