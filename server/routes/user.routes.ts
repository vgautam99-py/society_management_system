import express from 'express';
import {
  deactivateUser,
  getAllUser,
  getSingleUser,
  updateUser,
  updateProfilePhoto,
  updateSelfProfile,
  changeSelfPassword,
  createUser,
  getSocietyStats,
  getStaffStats,
  getStaffAssignmentStatus,
} from '../controllers/user.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/society-stats', verifyToken, checkRole(['Admin']), getSocietyStats);
router.get('/staff-stats', verifyToken, checkRole(['Staff']), getStaffStats);
router.get('/users/staff-assignment', verifyToken, checkRole(['Admin']), getStaffAssignmentStatus);
router.post('/users', verifyToken, checkRole(['Admin']), createUser);
router.get('/users', verifyToken, checkRole(['Admin', 'Staff', 'Resident']), getAllUser);
router.get('/users/:id', verifyToken, checkRole(['Admin', 'Staff', 'Resident']), getSingleUser);
router.patch('/users/:id/deactivate', verifyToken, checkRole(['Admin', 'Staff']), deactivateUser);
router.patch('/users/:id', verifyToken, checkRole(['Admin', 'Staff']), updateUser);
router.patch('/users/:id/profile-photo', verifyToken, upload.single('profilePhoto'), updateProfilePhoto);
router.patch('/profile', verifyToken, updateSelfProfile);
router.patch('/profile/change-password', verifyToken, changeSelfPassword);

export default router;
