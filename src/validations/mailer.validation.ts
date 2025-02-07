import { body } from 'express-validator';

const contactValidation = {
  contactForm: [
    body('name').notEmpty().withMessage('Your name is required'),
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('message')
      .isLength({ min: 5 })
      .withMessage('Message must be at least 5 characters long'),
  ],
};

export default contactValidation;
