import express from 'express';
import {
  register,
  login,
  verify,
  logout,
  verifyOtp,
  forgotPassword,
  sendOtp,
  sendRegistrationOtp,
} from '../controllers/auth.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';
import { validate, registerSchema, loginSchema, sendOtpSchema } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/send-otp', validate(sendOtpSchema), sendOtp);
router.post('/send-registration-otp', validate(sendOtpSchema), sendRegistrationOtp);
router.post('/verifyotp', verifyOtp);
router.post('/verify', verifyToken, checkRole(['Admin', 'Staff', 'Resident']), verify);
router.post('/logout', verifyToken, logout);
router.post('/forgot-password', forgotPassword);

export default router;
