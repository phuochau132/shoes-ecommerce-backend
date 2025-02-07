import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken, isVerified } from '@/middlewares/auth';
import { sendContactEmail } from '@/utils/mailer';
import validate from '@/middlewares/validate';
import contactValidation from '@/validations/mailer.validation';

const router = Router();

router.post(
  '/send',
  [verifyToken, isVerified],
  validate(contactValidation.contactForm),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sendContactEmail(
        req.body.email,
        `Contact Form Submission from ${req.body.name}`,
        req.body.message,
      );
      return res.status(StatusCodes.OK).json({
        message: 'Mail sent successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
