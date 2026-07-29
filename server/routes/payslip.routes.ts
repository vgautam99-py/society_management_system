import express from 'express';
import { createPayslip, getPayslips } from '../controllers/payslip.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.post('/', verifyToken, checkRole(['Admin']), createPayslip);
router.get('/', verifyToken, checkRole(['Admin', 'Staff']), getPayslips);

export default router;
