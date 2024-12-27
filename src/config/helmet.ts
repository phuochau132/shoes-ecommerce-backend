import crypto from 'crypto';
import { Request, Response } from 'express';
import helmet from 'helmet';
const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};
export const helmetConfig = () => {
  return helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", `'nonce-${generateNonce()}'`],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  });
};
