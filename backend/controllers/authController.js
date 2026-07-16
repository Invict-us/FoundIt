import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ---------------------------------------------------------------------------
// Helper – generate a signed JWT for a given user id
// ---------------------------------------------------------------------------
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ---------------------------------------------------------------------------
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ---------------------------------------------------------------------------
export const register = async (req, res) => {
  try {
    const { name, usn, email, phone, password, role } = req.body;

    // Check if user already exists (by email or USN)
    const existingUser = await User.findOne({ $or: [{ email }, { usn: usn?.toUpperCase() }] });
    if (existingUser) {
      const field = existingUser.email === email?.toLowerCase() ? 'email' : 'USN';
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`,
      });
    }

    // Create user (password is hashed in the pre-save hook)
    const user = await User.create({
      name,
      usn,
      email,
      phone,
      password,
      role: role || 'student',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          usn: user.usn,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePic: user.profilePic,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Login user & return JWT
// @route   POST /api/auth/login
// @access  Public
// ---------------------------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Fetch user WITH password (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          usn: user.usn,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePic: user.profilePic,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Forgot password (dev mode – logs reset link to console)
// @route   POST /api/auth/forgot-password
// @access  Public
// ---------------------------------------------------------------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal whether the email exists – always return success
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      });
    }

    // Generate a short-lived token for password reset (15 min)
    const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    // In development we just log the email content to the console
    console.log('═══════════════════════════════════════════════════');
    console.log('📧 PASSWORD RESET EMAIL (dev mode)');
    console.log('───────────────────────────────────────────────────');
    console.log(`To:      ${user.email}`);
    console.log(`Subject: Campus Lost & Found – Password Reset`);
    console.log(`Body:`);
    console.log(`  Hi ${user.name},`);
    console.log(`  You requested a password reset. Click the link below:`);
    console.log(`  ${resetUrl}`);
    console.log(`  This link expires in 15 minutes.`);
    console.log('═══════════════════════════════════════════════════');

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      // Include token in dev for easy testing
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
// ---------------------------------------------------------------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
// ---------------------------------------------------------------------------
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePic } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (profilePic !== undefined) updateFields.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
// ---------------------------------------------------------------------------
export const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Verify the reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password; // will be hashed by pre-save hook
    await user.save();

    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Reset link has expired' });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
