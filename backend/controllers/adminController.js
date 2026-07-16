import User from '../models/User.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Claim from '../models/Claim.js';

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLost = await LostItem.countDocuments();
    const totalFound = await FoundItem.countDocuments();
    const activeClaims = await Claim.countDocuments({ status: 'Pending' });
    const totalClaims = await Claim.countDocuments();
    
    // Calculate recovery rate
    const recoveredItems = await LostItem.countDocuments({ status: 'Claimed' });
    const recoveryRate = totalLost > 0 ? ((recoveredItems / totalLost) * 100).toFixed(1) : 0;

    // Get recent items
    const recentLost = await LostItem.find().sort({ createdAt: -1 }).limit(5);
    const recentFound = await FoundItem.find().sort({ createdAt: -1 }).limit(5);

    // Aggregate by category for charts
    const lostByCategory = await LostItem.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const foundByCategory = await FoundItem.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Simple timeline mock for last 6 months based on current counts (since we don't have extensive historical data in DB for testing)
    // In production, you would group by createdAt month.
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const timelineData = [];
    for (let i = 5; i >= 0; i--) {
      let mIndex = currentMonthIndex - i;
      if (mIndex < 0) mIndex += 12;
      timelineData.push({
        name: months[mIndex],
        lost: Math.floor(Math.random() * (totalLost || 10)) + 2, // Mocked distributed trend
        found: Math.floor(Math.random() * (totalFound || 10)) + 1,
      });
    }

    res.json({
      totalUsers,
      totalLost,
      totalFound,
      activeClaims,
      totalClaims,
      recoveryRate,
      recentItems: {
        lost: recentLost,
        found: recentFound
      },
      chartData: {
        lostByCategory,
        foundByCategory,
        timelineData
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching stats' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error fetching users' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete an admin user' });
      }
      
      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error deleting user' });
  }
};

// @desc    Get all items for admin
// @route   GET /api/admin/items
// @access  Private/Admin/Security
export const getAdminItems = async (req, res) => {
  try {
    const lostItems = await LostItem.find()
      .populate('ownerId', 'name email usn')
      .sort({ createdAt: -1 })
      .limit(50);
      
    const foundItems = await FoundItem.find()
      .populate('finderId', 'name email usn')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ lostItems, foundItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching admin items' });
  }
};
