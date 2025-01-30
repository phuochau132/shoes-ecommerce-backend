import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Container } from 'typeorm-typedi-extensions';
import { verifyToken, isVerified } from '@/middlewares/auth';
import CartService from '@/services/cart.service';

const router = Router();

/**
 * Add item to cart
 */
router.post(
  '/add',
  [verifyToken, isVerified],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, variantId, quantity } = req.body;
      const cartServiceInstance = Container.get(CartService);
      const cart = await cartServiceInstance.addToCart({
        user: req.user,
        productId,
        variantId,
        quantity,
      });
      return res.status(StatusCodes.OK).json({
        message: 'Item added to cart successfully.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },
);
/**
 * Remove item from cart
 */
router.delete(
  '/remove/:itemId',
  [verifyToken, isVerified],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;

      const cartServiceInstance = Container.get(CartService);
      const cart = await cartServiceInstance.removeFromCart({
        user: req.user,
        itemId: parseInt(itemId),
      });

      return res.status(StatusCodes.OK).json({
        message: 'Item removed from cart successfully.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Update item in cart
 */
router.put(
  '/update/:itemId',
  [verifyToken, isVerified],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      const cartServiceInstance = Container.get(CartService);
      const cart = await cartServiceInstance.updateCartItem({
        user: req.user,
        itemId: parseInt(itemId),
        quantity: quantity,
      });

      return res.status(StatusCodes.OK).json({
        message: 'Cart item updated successfully.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Get cart details
 */
router.get(
  '/',
  [verifyToken, isVerified],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cartServiceInstance = Container.get(CartService);
      const cart = await cartServiceInstance.getCartDetails(req.user);
      return res.status(StatusCodes.OK).json({
        message: 'Cart retrieved successfully.',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
