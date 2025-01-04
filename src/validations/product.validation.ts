import { body } from 'express-validator';

const productValidation = {
  review: {
    add: [
      body('title')
        .isLength({ min: 1, max: 100 })
        .withMessage((_, { req }) =>
          req.body.title.length < 1
            ? 'Title must have at least 1 character'
            : 'Title must be at most 100 characters',
        ),
      body('content')
        .isLength({ min: 1, max: 500 })
        .withMessage((_, { req }) =>
          req.body.content.length < 10
            ? 'Content must have at least 10 characters'
            : 'Content must be at most 500 characters',
        ),
      body('rating')
        .isFloat({ min: 1, max: 5 })
        .withMessage((_, { req }) =>
          req.body.rating < 1
            ? 'Rating must be at least 1'
            : 'Rating must be at most 5',
        ),
    ],
    remove: [
      body('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a valid positive integer')
        .notEmpty()
        .withMessage('ID is required'),
    ],
  },
};

export default productValidation;
