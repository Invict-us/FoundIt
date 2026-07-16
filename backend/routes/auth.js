import express from 'express';
import { register, login, forgotPassword, resetPassword, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
