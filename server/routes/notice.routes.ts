import express from 'express';
import {
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/notice.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.post('/', verifyToken, checkRole(['Admin', 'Staff']), createNotice);
router.get('/', verifyToken, checkRole(['Admin', 'Resident', 'Staff']), getNotices);
router.get('/:id', verifyToken, checkRole(['Admin', 'Resident', 'Staff']), getNotice);
router.patch('/:id', verifyToken, checkRole(['Admin', 'Staff']), updateNotice);
router.delete('/:id', verifyToken, checkRole(['Admin', 'Staff']), deleteNotice);

export default router;
