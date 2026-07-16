import Claim from '../models/Claim.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Notification from '../models/Notification.js';

// ---------------------------------------------------------------------------
// @desc    Submit a new claim on an item
// @route   POST /api/claims
// @access  Private
// ---------------------------------------------------------------------------
export const createClaim = async (req, res) => {
  try {
    const { itemId, itemType, description, proof, answers } = req.body;

    // Validate required fields
    if (!itemId || !itemType || !description) {
      return res.status(400).json({
        success: false,
        message: 'itemId, itemType, and description are required',
      });
    }

    // Verify the item exists
    let item;
    if (itemType === 'lost') {
      item = await LostItem.findById(itemId);
    } else if (itemType === 'found') {
      item = await FoundItem.findById(itemId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'itemType must be "lost" or "found"',
      });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Don't allow claiming your own item
    const itemOwnerId = itemType === 'lost' ? item.ownerId : item.finderId;
    if (itemOwnerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a claim on your own item',
      });
    }

    // Check for existing claim by this user on this item
    const existingClaim = await Claim.findOne({ itemId, claimedBy: req.user._id });
    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a claim for this item',
      });
    }

    // Create the claim
    const claim = await Claim.create({
      itemId,
      itemType,
      claimedBy: req.user._id,
      description,
      proof: proof || '',
      answers: typeof answers === 'string' ? JSON.parse(answers) : (answers || {})
    });

    // Update item status to "Verification Pending"
    item.status = 'Verification Pending';
    await item.save();

    // Notify the item owner/finder about the new claim
    await Notification.create({
      userId: itemOwnerId,
      type: 'claim_submitted',
      message: `A new claim has been submitted on your ${itemType} item "${item.name}" by ${req.user.name}.`,
      relatedItem: item._id,
    });

    // Populate the claim before returning
    const populatedClaim = await Claim.findById(claim._id).populate(
      'claimedBy',
      'name usn email phone profilePic'
    );

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      data: populatedClaim,
    });
  } catch (error) {
    // Handle duplicate key error (compound index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a claim for this item',
      });
    }
    console.error('Create claim error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get all claims (admin/security)
// @route   GET /api/claims
// @access  Private (admin, security)
// ---------------------------------------------------------------------------
export const getAllClaims = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [claims, total] = await Promise.all([
      Claim.find(filter)
        .populate('claimedBy', 'name usn email phone profilePic')
        .populate('approvedBy', 'name usn email')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Claim.countDocuments(filter),
    ]);

    // Manually populate itemId based on itemType
    const populatedClaims = await Promise.all(
      claims.map(async (claim) => {
        const claimObj = claim.toObject();
        if (claim.itemType === 'lost') {
          claimObj.item = await LostItem.findById(claim.itemId).lean();
        } else {
          claimObj.item = await FoundItem.findById(claim.itemId).lean();
        }
        return claimObj;
      })
    );

    res.json({
      success: true,
      count: populatedClaims.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: populatedClaims,
    });
  } catch (error) {
    console.error('Get all claims error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get claims submitted by the current user
// @route   GET /api/claims/my
// @access  Private
// ---------------------------------------------------------------------------
export const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user._id })
      .populate('approvedBy', 'name usn email')
      .sort('-createdAt');

    // Manually populate item details
    const populatedClaims = await Promise.all(
      claims.map(async (claim) => {
        const claimObj = claim.toObject();
        if (claim.itemType === 'lost') {
          claimObj.item = await LostItem.findById(claim.itemId)
            .populate('ownerId', 'name email phone')
            .lean();
        } else {
          claimObj.item = await FoundItem.findById(claim.itemId)
            .populate('finderId', 'name email phone')
            .lean();
        }
        return claimObj;
      })
    );

    res.json({
      success: true,
      count: populatedClaims.length,
      data: populatedClaims,
    });
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Approve a claim
// @route   PUT /api/claims/:id/approve
// @access  Private (admin, security, or item owner)
// ---------------------------------------------------------------------------
export const approveClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (claim.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Claim has already been ${claim.status.toLowerCase()}`,
      });
    }

    // Verify authorization: admin, security, or item owner
    let item;
    if (claim.itemType === 'lost') {
      item = await LostItem.findById(claim.itemId);
    } else {
      item = await FoundItem.findById(claim.itemId);
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Associated item not found' });
    }

    const itemOwnerId = claim.itemType === 'lost' ? item.ownerId : item.finderId;
    const isOwner = itemOwnerId.toString() === req.user._id.toString();
    const isPrivileged = ['admin', 'security'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this claim',
      });
    }

    // Approve the claim
    claim.status = 'Approved';
    claim.approvedBy = req.user._id;
    await claim.save();

    // Update item status to "Claimed"
    item.status = 'Claimed';
    await item.save();

    // Reject all other pending claims for this item
    await Claim.updateMany(
      { itemId: claim.itemId, _id: { $ne: claim._id }, status: 'Pending' },
      { status: 'Rejected', approvedBy: req.user._id }
    );

    // Notify the claimant
    await Notification.create({
      userId: claim.claimedBy,
      type: 'claim_approved',
      message: `Your claim on "${item.name}" has been approved! Please collect your item.`,
      relatedItem: item._id,
    });

    // Notify other claimants about rejection
    const rejectedClaims = await Claim.find({
      itemId: claim.itemId,
      _id: { $ne: claim._id },
      status: 'Rejected',
      claimedBy: { $ne: claim.claimedBy },
    });

    for (const rejectedClaim of rejectedClaims) {
      await Notification.create({
        userId: rejectedClaim.claimedBy,
        type: 'claim_rejected',
        message: `Your claim on "${item.name}" has been rejected. The item has been claimed by someone else.`,
        relatedItem: item._id,
      });
    }

    res.json({
      success: true,
      message: 'Claim approved successfully',
      data: claim,
    });
  } catch (error) {
    console.error('Approve claim error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Reject a claim
// @route   PUT /api/claims/:id/reject
// @access  Private (admin, security, or item owner)
// ---------------------------------------------------------------------------
export const rejectClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    if (claim.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Claim has already been ${claim.status.toLowerCase()}`,
      });
    }

    // Verify authorization
    let item;
    if (claim.itemType === 'lost') {
      item = await LostItem.findById(claim.itemId);
    } else {
      item = await FoundItem.findById(claim.itemId);
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Associated item not found' });
    }

    const itemOwnerId = claim.itemType === 'lost' ? item.ownerId : item.finderId;
    const isOwner = itemOwnerId.toString() === req.user._id.toString();
    const isPrivileged = ['admin', 'security'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this claim',
      });
    }

    // Reject the claim
    claim.status = 'Rejected';
    claim.approvedBy = req.user._id;
    await claim.save();

    // If no more pending claims exist, revert item status to Active
    const remainingPendingClaims = await Claim.countDocuments({
      itemId: claim.itemId,
      status: 'Pending',
    });

    if (remainingPendingClaims === 0) {
      item.status = 'Active';
      await item.save();
    }

    // Notify the claimant
    await Notification.create({
      userId: claim.claimedBy,
      type: 'claim_rejected',
      message: `Your claim on "${item.name}" has been rejected.`,
      relatedItem: item._id,
    });

    res.json({
      success: true,
      message: 'Claim rejected',
      data: claim,
    });
  } catch (error) {
    console.error('Reject claim error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
