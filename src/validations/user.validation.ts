import { body, param } from 'express-validator';

const userValidation = {
  update: [
    body('image').isLength({ max: 100 }),
    body('full_name').isLength({ max: 100 }),
    body('telephone')
      .isLength({ min: 10, max: 15 })
      .matches(/^\+84[1-9][0-9]{7,11}$/),
    body('address').isAlphanumeric(),
  ],
  wishlist: {
    add: [
      body('product_id')
        .isInt({ min: 1 })
        .withMessage('ID must be a valid positive integer')
        .notEmpty()
        .withMessage('ID is required'),
    ],
    remove: [
      param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a valid positive integer')
        .notEmpty()
        .withMessage('ID is required'),
    ],
  },
};

export default userValidation;
