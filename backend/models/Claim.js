import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Item reference is required'],
      refPath: 'itemType', // dynamic ref based on itemType value
    },
    itemType: {
      type: String,
      required: [true, 'Item type is required'],
      enum: {
        values: ['lost', 'found'],
        message: 'Item type must be "lost" or "found"',
      },
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant reference is required'],
    },
    description: {
      type: String,
      required: [true, 'Please describe why you believe this item is yours'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    proof: {
      type: String,
      default: '',
      trim: true,
    },
    answers: {
      color: String,
      locationLost: String,
      uniqueMarks: String
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: 'Status must be Pending, Approved, or Rejected',
      },
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Map itemType values to actual model names for population
claimSchema.path('itemId').options.refPath = undefined; // clear refPath
claimSchema.virtual('itemModel').get(function () {
  return this.itemType === 'lost' ? 'LostItem' : 'FoundItem';
});

// Compound index – one user can only submit one pending claim per item
claimSchema.index({ itemId: 1, claimedBy: 1 }, { unique: true });

// Index for quick lookups by status
claimSchema.index({ status: 1 });

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
