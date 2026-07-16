import mongoose from 'mongoose';

const NOTIFICATION_TYPES = [
  'match_found',       // Smart matching found a potential match
  'claim_submitted',   // Someone submitted a claim on your item
  'claim_approved',    // Your claim was approved
  'claim_rejected',    // Your claim was rejected
  'item_status',       // Item status changed
  'system',            // General system notification
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: {
        values: NOTIFICATION_TYPES,
        message: 'Invalid notification type',
      },
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt serves as the notification timestamp
  }
);

// Index: quickly fetch a user's unread notifications, newest first
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
