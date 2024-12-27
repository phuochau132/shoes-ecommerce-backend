import { body } from 'express-validator';

const authValidation = {
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  register: [
    body('full_name').isLength({ max: 100 }),
    body('telephone')
      .isLength({ min: 10, max: 15 })
      .matches(/^\+84[1-9][0-9]{7,11}$/),
    body('address').isAlphanumeric(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  update: [
    body('image').isLength({ max: 100 }),
    body('full_name').isLength({ max: 100 }),
    body('telephone')
      .isLength({ min: 10, max: 15 })
      .matches(/^\+84[1-9][0-9]{7,11}$/),
    body('address').isAlphanumeric(),
  ],
  forgotPassword: [body('email').isEmail().normalizeEmail()],
  resetPassword: [body('password').isLength({ min: 8 })],
};

export default authValidation;
