import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
} from '../controllers/complaint.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.post('/', verifyToken, checkRole(['Admin', 'Resident']), createComplaint);
router.get('/', verifyToken, checkRole(['Admin', 'Resident', 'Staff']), getComplaints);
router.get('/:id', verifyToken, checkRole(['Admin', 'Resident', 'Staff']), getComplaint);
router.patch('/:id', verifyToken, checkRole(['Admin', 'Staff']), updateComplaint);
router.delete('/:id', verifyToken, checkRole(['Admin', 'Resident']), deleteComplaint);

export default router;
