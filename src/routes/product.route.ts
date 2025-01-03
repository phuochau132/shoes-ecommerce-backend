import { isVerified, verifyToken } from '@/middlewares/auth';
import validate from '@/middlewares/validate';
import ProductService from '@/services/product.service';
import productValidation from '@/validations/product.validation';
import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typeorm-typedi-extensions';

const router = Router();
router.route('/').post(async (req, res, next) => {
  try {
    const productServiceInstance = Container.get(ProductService);
    console.log(12333);
    const products = await productServiceInstance.getProductsByIds({
      ids: req.body.ids,
    });

    return res.status(StatusCodes.OK).json({
      message: 'Success.',
      data: {
        products: products,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.route('/:handle').get(async (req, res, next) => {
  try {
    const productServiceInstance = Container.get(ProductService);
    const product = await productServiceInstance.getProductByHandle(
      req.params.handle,
    );
    return res.status(StatusCodes.OK).json({
      message: 'Success.',
      data: {
        product: product,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router
  .route('/:handle/review/add')
  .post(
    verifyToken,
    validate(productValidation.review.add),
    async (req, res, next) => {
      try {
        const productServiceInstance = Container.get(ProductService);

        const review = await productServiceInstance.addReview({
          ...req.body,
          user: req.user,
        });
        return res.status(StatusCodes.OK).json({
          message: 'Success.',
          data: {
            review: review,
          },
        });
      } catch (error) {
        return next(error);
      }
    },
  );
router
  .route('/:handle/review/remove')
  .post(
    [verifyToken, isVerified],
    validate(productValidation.review.remove),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const productServiceInstance = Container.get(ProductService);
        await productServiceInstance.removeReview({
          reviewID: req.body.id,
          user: req.user,
        });
        return res.status(StatusCodes.OK).json({
          message: 'Success.',
        });
      } catch (error) {
        return next(error);
      }
    },
  );
export default router;
