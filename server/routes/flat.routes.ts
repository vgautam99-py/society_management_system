import express from 'express';
import {
  createFlat,
  deleteFlat,
  getAvailableFlats,
  getFlatById,
  getFlats,
  updateFlat,
} from '../controllers/flat.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.post('/', verifyToken, checkRole(['Admin']), createFlat);
router.get('/', verifyToken, checkRole(['Admin', 'Resident', 'Staff']), getFlats);
router.get('/available', verifyToken, getAvailableFlats);
router.get('/:id', verifyToken, getFlatById);
router.patch('/:id', verifyToken, checkRole(['Admin']), updateFlat);
router.delete('/:id', verifyToken, checkRole(['Admin']), deleteFlat);

export default router;
