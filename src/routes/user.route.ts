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
      try {
        const userServiceInstance = Container.get(UserService);
        const result = await userServiceInstance.getProfile(req.user);
        return res.status(StatusCodes.OK).json({
          message: 'Success.',
          data: {
            ...result,
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
router
  .route('/wishlist/')
  .get(
    [verifyToken, isVerified],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userServiceInstance = Container.get(UserService);
        const result = await userServiceInstance.getWishlistByUserId(req.user);
        return res.status(StatusCodes.OK).json({
          message: 'Success.',
          data: result,
        });
      } catch (error) {}
    },
  );

router
  .route('/wishlist/add')
  .post(
    [verifyToken, isVerified],
    validate(userValidation.wishlist.add),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userServiceInstance = Container.get(UserService);
        const result = await userServiceInstance.addWishList({
          userParam: req.user,
          productId: req.body.product_id,
        });

        return res.status(StatusCodes.OK).json({
          message: result.message,
          data: result,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

router
  .route('/wishlist/remove/:id')
  .delete(
    [verifyToken, isVerified],
    validate(userValidation.wishlist.remove),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userServiceInstance = Container.get(UserService);

        const result = await userServiceInstance.removeWishList({
          userParam: req.user,
          id: parseInt(req.params.id),
        });

        return res.status(StatusCodes.OK).json({
          message: result.message,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

export default router;
