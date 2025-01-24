import ProductService from '@/services/product.service';
import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typeorm-typedi-extensions';

const router = Router();
router
  .route('/suggest')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q as string) || '';
      const productServiceInstance = Container.get(ProductService);
      const result = await productServiceInstance.filterProducts(query);
      return res
        .status(StatusCodes.OK)
        .json({ message: 'Success.', data: result });
    } catch (error) {
      return next(error);
    }
  });
export default router;
