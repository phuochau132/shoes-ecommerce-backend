import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typeorm-typedi-extensions';
import { isVerified, verifyToken } from '@/middlewares/auth';
import validate from '@/middlewares/validate';
import UserService from '@/services/user.service';
import userValidation from '@/validations/user.validation';

const router = Router();

router
  .route('/info')
  .get(
    [verifyToken],
    async (req: Request, res: Response, next: NextFunction) => {
      let image = req.user.image;
      if (!image) {
        image = `http://localhost:8080/static/images/${req.user.image}`;
      }
      try {
        return res.status(StatusCodes.OK).json({
          message: 'Success.',
          data: {
            id: req.user.id,
            role: req.user.role,
            full_name: req.user.full_name,
            email: req.user.email,
            telephone: req.user.telephone,
            address: req.user.address,
            image: image,
          },
        });
      } catch (error) {
        return next(error);
      }
    },
  );

router
  .route('/update-profile')
  .put(
    [verifyToken, isVerified],
    validate(userValidation.update),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userServiceInstance = Container.get(UserService);
        const updatedUser = await userServiceInstance.updateUser(
          req.user.id,
          req.body,
        );

        return res.status(StatusCodes.OK).json({
          message: 'Success.',
          data: updatedUser,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

export default router;
