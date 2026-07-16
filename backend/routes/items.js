import express from 'express';
import {
  createLostItem,
  createFoundItem,
  getLostItems,
  getFoundItems,
  searchItems,
  getItemById,
  updateItemStatus,
} from '../controllers/itemController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/lost', protect, createLostItem);
router.post('/found', protect, createFoundItem);
router.get('/lost', getLostItems);
router.get('/found', getFoundItems);
router.get('/search', searchItems);
router.get('/:id', getItemById);
router.put('/:id/status', protect, authorize('admin', 'security'), updateItemStatus);

export default router;
