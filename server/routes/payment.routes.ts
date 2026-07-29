import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

// Admins and Residents can create payment orders and verify payments
router.post('/create-order', verifyToken, checkRole(['Admin', 'Resident']), createOrder);
router.post('/verify-payment', verifyToken, checkRole(['Admin', 'Resident']), verifyPayment);

export default router;
