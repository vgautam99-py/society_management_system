import express from 'express';
import {
  createBill,
  getBills,
  payBill,
  getBillStats,
  getPublicBill,
  completePayment,
} from '../controllers/bill.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.post('/', verifyToken, checkRole(['Admin']), createBill);
router.get('/', verifyToken, checkRole(['Admin', 'Resident']), getBills);
router.post('/:id/pay', verifyToken, checkRole(['Resident']), payBill);
router.get('/stats', verifyToken, checkRole(['Admin']), getBillStats);
router.get('/public/:id', getPublicBill);
router.post('/:id/complete-payment', completePayment);

export default router;
