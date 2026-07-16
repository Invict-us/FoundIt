import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    usn: {
      type: String,
      required: [true, 'USN (University Serial Number) is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'USN cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\d{10,15}$/, 'Phone number must be 10-15 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password by default
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin', 'security'],
        message: 'Role must be student, admin, or security',
      },
      default: 'student',
    },
    profilePic: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// ---------------------------------------------------------------------------
// Pre-save hook – hash password before persisting
// ---------------------------------------------------------------------------
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---------------------------------------------------------------------------
// Instance method – compare candidate password with stored hash
// ---------------------------------------------------------------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
