import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getRepository } from 'typeorm';

import ApiError from '@/errors/ApiError';
import User from '@/models/user.model';
import { decodedToken } from '@/utils/jwt';

export const verifyToken: RequestHandler = async (req, res, next) => {
  try {
    let token = req.headers?.authorization?.split(' ')?.[1];
    if (req.query.token) {
      token = req.query.token as string;
    }

    if (!token || token == 'undefined') {
      throw new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'Token not provided!!',
      });
    }

    const decoded = decodedToken(token);

    const userRepository = getRepository(User);
    const user = await userRepository.findOne(decoded.id);

    if (!user) {
      throw new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'Please log in to continue.!',
      });
    }
    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};
export const isVerified: RequestHandler = (req, res, next) => {
  try {
    if (!req.user.is_verified) {
      throw new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'The account has not been verified yet!',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export const isAdmin: RequestHandler = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'Do not have access!',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
