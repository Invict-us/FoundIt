import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Notification from '../models/Notification.js';

// ═══════════════════════════════════════════════════════════════════════════
// SMART MATCHING ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract the building / main location keyword from a location string.
 * e.g. "Library Building, 2nd Floor" → "library building"
 */
const extractBuilding = (location) => {
  if (!location) return '';
  // Take everything before the first comma, or the whole string
  return location.split(',')[0].trim().toLowerCase();
};

/**
 * Tokenise text into meaningful lowercase words, stripping stop-words.
 */
const tokenize = (text) => {
  if (!text) return [];
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'it', 'its', 'i', 'my',
    'me', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'this', 'that',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and', 'or', 'but', 'not',
    'from', 'by', 'has', 'have', 'had', 'be', 'been', 'do', 'does', 'did',
    'will', 'would', 'can', 'could', 'should', 'may', 'might', 'very',
    'just', 'about', 'also', 'so', 'if', 'than', 'too', 'some', 'any',
    'each', 'every', 'no', 'all', 'both', 'few', 'more', 'most', 'other',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w));
};

/**
 * Compute keyword similarity (Jaccard-like) between two texts.
 * Returns a value between 0 and 1.
 */
const keywordSimilarity = (textA, textB) => {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
};

/**
 * Calculate a match score between a lost item and a found item.
 *
 * Scoring breakdown:
 *   - Category match:         40 pts
 *   - Keyword similarity:     up to 30 pts
 *   - Same building/location: 20 pts
 *   - Date within 3 days:     10 pts
 *
 * @returns {{ score: number, breakdown: object }}
 */
const calculateMatchScore = (lostItem, foundItem) => {
  let score = 0;
  const breakdown = { category: 0, keywords: 0, location: 0, date: 0 };

  // 1. Category match (40 pts)
  if (
    lostItem.category &&
    foundItem.category &&
    lostItem.category.toLowerCase() === foundItem.category.toLowerCase()
  ) {
    score += 40;
    breakdown.category = 40;
  }

  // 2. Keyword similarity in description + name (30 pts)
  const lostText = `${lostItem.name} ${lostItem.description}`;
  const foundText = `${foundItem.name} ${foundItem.description}`;
  const similarity = keywordSimilarity(lostText, foundText);
  const keywordScore = Math.round(similarity * 30);
  score += keywordScore;
  breakdown.keywords = keywordScore;

  // 3. Same building / location (20 pts)
  const lostBuilding = extractBuilding(lostItem.location);
  const foundBuilding = extractBuilding(foundItem.location);
  if (lostBuilding && foundBuilding && lostBuilding === foundBuilding) {
    score += 20;
    breakdown.location = 20;
  }

  // 4. Date within 3 days (10 pts)
  const lostDate = new Date(lostItem.dateLost);
  const foundDate = new Date(foundItem.dateFound);
  const diffMs = Math.abs(lostDate.getTime() - foundDate.getTime());
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 3) {
    score += 10;
    breakdown.date = 10;
  }

  return { score, breakdown };
};

/**
 * Run smart matching for a newly created item.
 * - If a LOST item is created  → compare against all active FOUND items.
 * - If a FOUND item is created → compare against all active LOST items.
 * Creates notifications for both users when score >= 50.
 *
 * @param {object} newItem     The newly created item document.
 * @param {'lost'|'found'} type  Whether the new item is lost or found.
 * @returns {Array} Array of match objects
 */
const runSmartMatching = async (newItem, type) => {
  const matches = [];

  try {
    if (type === 'lost') {
      // Compare new lost item against all active found items
      const foundItems = await FoundItem.find({ status: 'Active' }).populate('finderId', 'name');

      for (const foundItem of foundItems) {
        const { score, breakdown } = calculateMatchScore(newItem, foundItem);

        if (score >= 50) {
          matches.push({
            itemId: foundItem._id,
            itemType: 'found',
            itemName: foundItem.name,
            score,
            breakdown,
          });

          // Notify the owner of the lost item
          await Notification.create({
            userId: newItem.ownerId,
            type: 'match_found',
            message: `Potential match found! A found item "${foundItem.name}" (score: ${score}/100) may be your lost "${newItem.name}".`,
            relatedItem: foundItem._id,
          });

          // Notify the finder of the found item
          if (foundItem.finderId && foundItem.finderId._id) {
            await Notification.create({
              userId: foundItem.finderId._id,
              type: 'match_found',
              message: `Potential match! Someone lost "${newItem.name}" (score: ${score}/100) which may match the item you found "${foundItem.name}".`,
              relatedItem: newItem._id,
            });
          }
        }
      }
    } else {
      // Compare new found item against all active lost items
      const lostItems = await LostItem.find({ status: 'Active' }).populate('ownerId', 'name');

      for (const lostItem of lostItems) {
        const { score, breakdown } = calculateMatchScore(lostItem, newItem);

        if (score >= 50) {
          matches.push({
            itemId: lostItem._id,
            itemType: 'lost',
            itemName: lostItem.name,
            score,
            breakdown,
          });

          // Notify the finder of the found item
          await Notification.create({
            userId: newItem.finderId,
            type: 'match_found',
            message: `Potential match found! A lost item "${lostItem.name}" (score: ${score}/100) may match the item you found "${newItem.name}".`,
            relatedItem: lostItem._id,
          });

          // Notify the owner of the lost item
          if (lostItem.ownerId && lostItem.ownerId._id) {
            await Notification.create({
              userId: lostItem.ownerId._id,
              type: 'match_found',
              message: `Potential match! Someone found "${newItem.name}" (score: ${score}/100) which may be your lost "${lostItem.name}".`,
              relatedItem: newItem._id,
            });
          }
        }
      }
    }
  } catch (error) {
    // Matching errors should not block item creation
    console.error('Smart matching error:', error);
  }

  return matches;
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// @desc    Report a lost item
// @route   POST /api/items/lost
// @access  Private
// ---------------------------------------------------------------------------
export const createLostItem = async (req, res) => {
  try {
    const { name, category, description, location, dateLost, imagePath, contact } = req.body;

    const lostItem = await LostItem.create({
      name,
      category,
      description,
      location,
      dateLost,
      imagePath: imagePath || '',
      contact: contact || req.user.phone || '',
      ownerId: req.user._id,
    });

    // Run smart matching in the background (non-blocking response)
    const matches = await runSmartMatching(lostItem, 'lost');

    res.status(201).json({
      success: true,
      message: 'Lost item reported successfully',
      data: lostItem,
      matches: matches.length > 0 ? matches : undefined,
    });
  } catch (error) {
    console.error('Create lost item error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Report a found item
// @route   POST /api/items/found
// @access  Private
// ---------------------------------------------------------------------------
export const createFoundItem = async (req, res) => {
  try {
    const { name, category, description, location, dateFound, imagePath, finderContact } = req.body;

    const foundItem = await FoundItem.create({
      name,
      category,
      description,
      location,
      dateFound,
      imagePath: imagePath || '',
      finderContact: finderContact || {
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email,
      },
      finderId: req.user._id,
    });

    // Run smart matching
    const matches = await runSmartMatching(foundItem, 'found');

    res.status(201).json({
      success: true,
      message: 'Found item reported successfully',
      data: foundItem,
      matches: matches.length > 0 ? matches : undefined,
    });
  } catch (error) {
    console.error('Create found item error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get all lost items (with pagination & filters)
// @route   GET /api/items/lost
// @access  Public
// ---------------------------------------------------------------------------
export const getLostItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, sort = '-createdAt' } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      LostItem.find(filter)
        .populate('ownerId', 'name usn email phone profilePic')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      LostItem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: items.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: items,
    });
  } catch (error) {
    console.error('Get lost items error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get all found items (with pagination & filters)
// @route   GET /api/items/found
// @access  Public
// ---------------------------------------------------------------------------
export const getFoundItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, sort = '-createdAt' } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      FoundItem.find(filter)
        .populate('finderId', 'name usn email phone profilePic')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      FoundItem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: items.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: items,
    });
  } catch (error) {
    console.error('Get found items error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Search items (lost & found) with advanced filters
// @route   GET /api/items/search
// @access  Public
// ---------------------------------------------------------------------------
export const searchItems = async (req, res) => {
  try {
    const { q, category, status, building, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    // Build filter objects for both collections
    const lostFilter = {};
    const foundFilter = {};

    // Text search query
    if (q) {
      const regex = new RegExp(q, 'i');
      const textCondition = {
        $or: [{ name: regex }, { description: regex }, { location: regex }],
      };
      Object.assign(lostFilter, textCondition);
      Object.assign(foundFilter, textCondition);
    }

    // Category filter
    if (category) {
      lostFilter.category = category;
      foundFilter.category = category;
    }

    // Status filter
    if (status) {
      lostFilter.status = status;
      foundFilter.status = status;
    }

    // Building / location filter (partial match)
    if (building) {
      const buildingRegex = new RegExp(building, 'i');
      lostFilter.location = buildingRegex;
      foundFilter.location = buildingRegex;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const lostDateRange = {};
      const foundDateRange = {};
      if (dateFrom) {
        lostDateRange.$gte = new Date(dateFrom);
        foundDateRange.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        lostDateRange.$lte = new Date(dateTo);
        foundDateRange.$lte = new Date(dateTo);
      }
      if (Object.keys(lostDateRange).length > 0) {
        lostFilter.dateLost = lostDateRange;
        foundFilter.dateFound = foundDateRange;
      }
    }

    // Fetch both collections in parallel
    const [lostItems, foundItems] = await Promise.all([
      LostItem.find(lostFilter)
        .populate('ownerId', 'name usn email phone profilePic')
        .sort('-createdAt')
        .lean(),
      FoundItem.find(foundFilter)
        .populate('finderId', 'name usn email phone profilePic')
        .sort('-createdAt')
        .lean(),
    ]);

    // Tag each item with its type for the frontend
    const taggedLost = lostItems.map((item) => ({ ...item, itemType: 'lost' }));
    const taggedFound = foundItems.map((item) => ({ ...item, itemType: 'found' }));

    // Merge and sort by createdAt descending
    const allItems = [...taggedLost, ...taggedFound].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Paginate the merged results
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedItems = allItems.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      count: paginatedItems.length,
      total: allItems.length,
      page: parseInt(page),
      pages: Math.ceil(allItems.length / parseInt(limit)),
      data: paginatedItems,
    });
  } catch (error) {
    console.error('Search items error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get a single item by ID (tries both collections)
// @route   GET /api/items/:id
// @access  Public
// ---------------------------------------------------------------------------
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Try lost items first
    let item = await LostItem.findById(id).populate('ownerId', 'name usn email phone profilePic');
    let itemType = 'lost';

    // If not found in lost, try found items
    if (!item) {
      item = await FoundItem.findById(id).populate('finderId', 'name usn email phone profilePic');
      itemType = 'found';
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({
      success: true,
      data: { ...item.toObject(), itemType },
    });
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Update item status
// @route   PUT /api/items/:id/status
// @access  Private (owner, admin, or security)
// ---------------------------------------------------------------------------
export const updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    // Try lost items first
    let item = await LostItem.findById(id);
    let itemType = 'lost';

    if (!item) {
      item = await FoundItem.findById(id);
      itemType = 'found';
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Authorization: only the owner, admin, or security can update status
    const isOwner =
      itemType === 'lost'
        ? item.ownerId.toString() === req.user._id.toString()
        : item.finderId.toString() === req.user._id.toString();

    const isPrivileged = ['admin', 'security'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item',
      });
    }

    item.status = status;
    await item.save();

    // Notify the item owner/finder about the status change
    const notifyUserId = itemType === 'lost' ? item.ownerId : item.finderId;
    if (notifyUserId.toString() !== req.user._id.toString()) {
      await Notification.create({
        userId: notifyUserId,
        type: 'item_status',
        message: `Your ${itemType} item "${item.name}" status has been updated to "${status}".`,
        relatedItem: item._id,
      });
    }

    res.json({
      success: true,
      message: `Item status updated to "${status}"`,
      data: item,
    });
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// @desc    Get matches for the current user's items
// @route   GET /api/items/matches
// @access  Private
// ---------------------------------------------------------------------------
export const getUserMatches = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all active lost items by this user
    const userLostItems = await LostItem.find({ ownerId: userId, status: 'Active' });
    // Get all active found items by this user
    const userFoundItems = await FoundItem.find({ finderId: userId, status: 'Active' });

    const allMatches = [];

    // For each lost item, find matching found items
    for (const lostItem of userLostItems) {
      const activeFoundItems = await FoundItem.find({ status: 'Active' })
        .populate('finderId', 'name email phone')
        .lean();

      for (const foundItem of activeFoundItems) {
        const { score, breakdown } = calculateMatchScore(lostItem, foundItem);
        if (score >= 50) {
          allMatches.push({
            userItem: { _id: lostItem._id, name: lostItem.name, type: 'lost' },
            matchedItem: { ...foundItem, type: 'found' },
            score,
            breakdown,
          });
        }
      }
    }

    // For each found item, find matching lost items
    for (const foundItem of userFoundItems) {
      const activeLostItems = await LostItem.find({ status: 'Active' })
        .populate('ownerId', 'name email phone')
        .lean();

      for (const lostItem of activeLostItems) {
        const { score, breakdown } = calculateMatchScore(lostItem, foundItem);
        if (score >= 50) {
          allMatches.push({
            userItem: { _id: foundItem._id, name: foundItem.name, type: 'found' },
            matchedItem: { ...lostItem, type: 'lost' },
            score,
            breakdown,
          });
        }
      }
    }

    // Sort by score descending
    allMatches.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      count: allMatches.length,
      data: allMatches,
    });
  } catch (error) {
    console.error('Get user matches error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
