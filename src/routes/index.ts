import { Router } from 'express';

import productRoutes from '@/routes/product.route';
import userRoutes from '@/routes/user.route';
import authRoutes from '@/routes/auth.route';

const router = Router();
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/products', productRoutes);

export default router;
