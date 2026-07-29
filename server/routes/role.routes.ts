import express from 'express';
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole,
} from '../controllers/role.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';

const router = express.Router();

router.post('/', verifyToken, checkRole(['Admin']), createRole);
router.get('/', verifyToken, getRoles);
router.get('/:id', getRoleById);
router.patch('/:id', verifyToken, checkRole(['Admin']), updateRole);
router.delete('/:id', verifyToken, checkRole(['Admin']), deleteRole);

export default router;
