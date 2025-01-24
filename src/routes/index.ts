import { Router } from 'express';

import productRoutes from '@/routes/product.route';
import collectionRoutes from '@/routes/collection.route';
import userRoutes from '@/routes/user.route';
import authRoutes from '@/routes/auth.route';
import searchRoutes from '@/routes/search.route';

const router = Router();
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/products', productRoutes);
router.use('/collections', collectionRoutes);
router.use('/search', searchRoutes);

export default router;
