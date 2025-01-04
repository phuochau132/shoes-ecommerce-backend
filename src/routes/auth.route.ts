import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typeorm-typedi-extensions';

import config from '@/config';
import ApiError from '@/errors/ApiError';
import { isVerified, verifyToken } from '@/middlewares/auth';
import validate from '@/middlewares/validate';
import AuthService from '@/services/auth.service';
import authValidation from '@/validations/auth.validation';
import userValidation from '@/validations/user.validation';

const router = Router();

router
  .route('/login')
  .post(validate(authValidation.login), async (req, res, next) => {
    try {
      const authServiceInstance = Container.get(AuthService);
      const { token, refreshToken } = await authServiceInstance.login(req.body);
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        maxAge: config.refreshTokenExpire * 1000,
      });

      return res
        .status(StatusCodes.OK)
        .json({ message: 'Success.', data: { token, refreshToken } });
    } catch (error) {
      return next(error);
    }
  });

router
  .route('/register')
  .post(validate(authValidation.register), async (req, res, next) => {
    try {
      const authServiceInstance = Container.get(AuthService);
      const data = await authServiceInstance.register(req.body);

      return res.status(StatusCodes.OK).json({
        message: 'Success.',
        data,
      });
    } catch (error) {
      return next(error);
    }
  });

router.route('/refresh-token').post(async (req, res, next) => {
  try {
    const authServiceInstance = Container.get(AuthService);
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new ApiError({
        status: StatusCodes.FORBIDDEN,
        message: 'The refresh token was not provided!',
      });
    }

    const token = await authServiceInstance.verifyRefreshToken(refreshToken);

    return res.status(StatusCodes.OK).json({
      message: 'Success.',
      data: {
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
});
router.route('/verify-email').get(verifyToken, async (req, res, next) => {
  try {
    const authServiceInstance = Container.get(AuthService);
    const data = await authServiceInstance.verifyEmail(req.user.id);

    return res.status(StatusCodes.OK).json({
      message: `Email verification is successful for user ID: ${data.email}`,
    });
  } catch (error) {
    return next(error);
  }
});

router
  .route('/forgot-password')
  .post(
    validate(authValidation.forgotPassword),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authServiceInstance = Container.get(AuthService);
        await authServiceInstance.forgotPassword(req.body.email);
        return res.status(StatusCodes.OK).json({
          message: 'Success.',
        });
      } catch (error) {
        return next(error);
      }
    },
  );

router
  .route('/reset-password/')
  .get(
    [verifyToken],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        return res.render('reset-password', {
          token: req.query.token,
        });
      } catch (error) {
        return next(error);
      }
    },
  )
  .post(
    [verifyToken],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authServiceInstance = Container.get(AuthService);
        const newPassword = req.body.password;
        await authServiceInstance.resetPassword(req.user, newPassword);
        return res.status(StatusCodes.OK).json({
          message: 'Password has been successfully reset.',
        });
      } catch (error) {
        return next(error);
      }
    },
  );

export default router;
