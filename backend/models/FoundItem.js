import mongoose from 'mongoose';
import { ITEM_CATEGORIES, ITEM_STATUSES } from './LostItem.js';

const foundItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [150, 'Item name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ITEM_CATEGORIES,
        message: 'Invalid category. Must be one of: ' + ITEM_CATEGORIES.join(', '),
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location where item was found is required'],
      trim: true,
    },
    dateFound: {
      type: Date,
      required: [true, 'Date found is required'],
    },
    imagePath: {
      type: String,
      default: '',
    },
    finderContact: {
      name: { type: String, default: '', trim: true },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true, lowercase: true },
    },
    status: {
      type: String,
      enum: {
        values: ITEM_STATUSES,
        message: 'Status must be one of: ' + ITEM_STATUSES.join(', '),
      },
      default: 'Active',
    },
    finderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Finder reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for text search on name & description
foundItemSchema.index({ name: 'text', description: 'text' });

// Index for common query filters
foundItemSchema.index({ category: 1, status: 1, location: 1 });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);
export default FoundItem;
