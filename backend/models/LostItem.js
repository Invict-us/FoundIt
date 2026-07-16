import mongoose from 'mongoose';

/**
 * Categories shared across Lost & Found items.
 * Keep this list in sync with FoundItem model.
 */
export const ITEM_CATEGORIES = [
  'Electronics',
  'Books',
  'Clothing',
  'Accessories',
  'ID Cards',
  'Keys',
  'Bags',
  'Water Bottles',
  'Stationery',
  'Sports Equipment',
  'Documents',
  'Other',
];

export const ITEM_STATUSES = ['Active', 'Verification Pending', 'Claimed', 'Archived'];

const lostItemSchema = new mongoose.Schema(
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
      required: [true, 'Location where item was lost is required'],
      trim: true,
    },
    dateLost: {
      type: Date,
      required: [true, 'Date lost is required'],
    },
    imagePath: {
      type: String,
      default: '',
    },
    contact: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ITEM_STATUSES,
        message: 'Status must be one of: ' + ITEM_STATUSES.join(', '),
      },
      default: 'Active',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for text search on name & description
lostItemSchema.index({ name: 'text', description: 'text' });

// Index for common query filters
lostItemSchema.index({ category: 1, status: 1, location: 1 });

const LostItem = mongoose.model('LostItem', lostItemSchema);
export default LostItem;
