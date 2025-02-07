import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typeorm-typedi-extensions';
import { verifyToken, isVerified } from '@/middlewares/auth';

import OrderService from '@/services/order.service';
import validate from '@/middlewares/validate';
import orderValidation from '@/validations/order.validation';

const router = Router();
/**
 * Get User's Order
 */
router.get(
  '/',
  [verifyToken, isVerified],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderServiceInstance = Container.get(OrderService);
      const response = await orderServiceInstance.getOrdersByUser(req.user);

      return res.status(StatusCodes.OK).json({
        message: 'Order got successfully.',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  },
);
/**
 * Create Order
 */
router.post(
  '/create',
  [verifyToken, isVerified],
  validate(orderValidation.create),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const orderServiceInstance = Container.get(OrderService);
      const order = await orderServiceInstance.createOrder(req.user, data);
      return res.status(StatusCodes.CREATED).json({
        message: 'Order created successfully.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Update Order Payment Status
 */
router.put(
  '/update-payment/:orderId',
  [verifyToken, isVerified],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { paymentId } = req.body;

      const orderServiceInstance = Container.get(OrderService);
      const updatedOrder = await orderServiceInstance.updatePaymentStatus(
        orderId,
        paymentId,
      );

      return res.status(StatusCodes.OK).json({
        message: 'Order payment status updated.',
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
