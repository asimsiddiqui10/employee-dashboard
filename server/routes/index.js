import express from 'express';
import authRoutes from './auth.js';
import employeeRoutes from './employeeRoutes.js';
import documentRoutes from './documentRoutes.js';
import timeClockRoutes from './timeClockRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import payrollRoutes from './payrollRoutes.js';
import requestRoutes from './requestRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/documents', documentRoutes);
router.use('/time-clock', timeClockRoutes);
router.use('/leaves', leaveRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payroll', payrollRoutes);
router.use('/requests', requestRoutes);

export default router; 