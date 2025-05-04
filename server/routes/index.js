import express from 'express';
import authRouter from './auth.js';
import employeeRouter from './employeeRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import documentRoutes from './documentRoutes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/employees', employeeRouter);
router.use('/notifications', notificationRoutes);
router.use('/leaves', leaveRoutes);
router.use('/documents', documentRoutes);

export default router; 