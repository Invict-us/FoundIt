import express from 'express';
import { getStats, getUsers, deleteUser, getAdminItems } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('admin'), getStats);
router.get('/users', authorize('admin'), getUsers);
router.delete('/users/:id', authorize('admin'), deleteUser);
router.get('/items', authorize('admin', 'security'), getAdminItems);

export default router;
