import { Router } from 'express';

import productRoutes from '@/routes/product.route';
import collectionRoutes from '@/routes/collection.route';
import userRoutes from '@/routes/user.route';
import authRoutes from '@/routes/auth.route';
import searchRoutes from '@/routes/search.route';
import cartRoutes from '@/routes/cart.route';
import paypalRoutes from '@/routes/paypal.route';
import orderRoutes from '@/routes/order.route';
import mailerRoutes from '@/routes/mailer.route';

const router = Router();
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/products', productRoutes);
router.use('/collections', collectionRoutes);
router.use('/search', searchRoutes);
router.use('/cart', cartRoutes);
router.use('/paypal', paypalRoutes);
router.use('/order', orderRoutes);
router.use('/mail', mailerRoutes);
export default router;
