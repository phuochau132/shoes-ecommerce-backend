import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typeorm-typedi-extensions';

import PaypalService from '@/services/paypal.service';

const router = Router();

router.route('/create-order').post(async (req, res, next) => {
  try {
    const paypalServiceInstance = Container.get(PaypalService);
    const response = await paypalServiceInstance.createOrder(
      req.body.total_price,
    );
    return res
      .status(StatusCodes.OK)
      .json({ message: 'Success.', data: response });
  } catch (error) {
    return next(error);
  }
});
router.route('/capture-payment/:paymentId').get(async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const paypalServiceInstance = Container.get(PaypalService);
    const response = await paypalServiceInstance.capturePayment(paymentId);
    return res
      .status(StatusCodes.OK)
      .json({ message: 'Success.', data: response });
  } catch (error) {
    return next(error);
  }
});

export default router;
