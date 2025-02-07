import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typeorm-typedi-extensions';
import CollectionService from '@/services/collection.service';
import qs from 'qs';
const router = Router();

router
  .route('/:handle')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query;
      const collectionServiceInstance = Container.get(CollectionService);
      const response = await collectionServiceInstance.getCollectionByHandle({
        collectionHandle: req.params.handle,
        filters: filters,
      });
      return res.status(StatusCodes.OK).json({
        message: 'Success.',
        data: {
          ...response,
        },
      });
    } catch (error) {
      return next(error);
    }
  });
router
  .route('/')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collectionServiceInstance = Container.get(CollectionService);
      const response = await collectionServiceInstance.getAllCollection();
      return res.status(StatusCodes.OK).json({
        message: 'Success.',
        data: {
          ...response,
        },
      });
    } catch (error) {
      return next(error);
    }
  });
export default router;
