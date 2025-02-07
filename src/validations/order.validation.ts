import { body, param } from 'express-validator';

const orderValidation = {
  create: [
    body('country').notEmpty().withMessage('Country is required').isString(),
    body('city').notEmpty().withMessage('City is required').isString(),
    body('detailAddress')
      .notEmpty()
      .withMessage('Detail address is required')
      .isString(),
    body('paymentMethod')
      .notEmpty()
      .withMessage('Payment method is required')
      .isString(),
    body('postalCode')
      .optional()
      .matches(/^[A-Za-z0-9-\s]+$/)
      .withMessage('Invalid postal code format'),
  ],
};

export default orderValidation;
