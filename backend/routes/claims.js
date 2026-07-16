import express from 'express';
import { createClaim, getMyClaims, getAllClaims, approveClaim, rejectClaim } from '../controllers/claimController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createClaim);
router.get('/my', protect, getMyClaims);
router.get('/', protect, authorize('admin', 'security'), getAllClaims);
router.put('/:id/approve', protect, authorize('admin', 'security'), approveClaim);
router.put('/:id/reject', protect, authorize('admin', 'security'), rejectClaim);

export default router;
