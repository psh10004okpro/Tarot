const Like = require('../models/Like');
const Reading = require('../models/Reading');
const User = require('../models/User');
const emailService = require('../services/emailService');

/**
 * Like Controller
 * Handles like/unlike operations on public readings
 */

/**
 * @desc    Like a public reading
 * @route   POST /api/v1/readings/:id/like
 * @access  Private
 */
const likeReading = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found',
      });
    }

    // Check if reading is public
    if (!reading.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Cannot like private reading',
      });
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      reading: req.params.id,
      user: req.user.id,
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        error: 'You have already liked this reading',
      });
    }

    // Create like
    const like = await Like.create({
      reading: req.params.id,
      user: req.user.id,
    });

    // Increment like count on reading
    reading.likesCount += 1;
    await reading.save();

    // Send email notification to reading owner (async, don't wait)
    // Only if liker is not the reading owner
    if (reading.user.toString() !== req.user.id) {
      User.findById(reading.user).then((readingOwner) => {
        if (readingOwner && readingOwner.preferences?.emailNotifications !== false) {
          emailService.sendLikeNotificationEmail(
            readingOwner,
            req.user,
            reading
          ).catch((error) => {
            console.error('Failed to send like notification email:', error);
          });
        }
      }).catch((error) => {
        console.error('Failed to fetch reading owner:', error);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Reading liked successfully',
      data: {
        likeId: like._id,
        likesCount: reading.likesCount,
      },
    });
  } catch (error) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already liked this reading',
      });
    }
    next(error);
  }
};

/**
 * @desc    Unlike a public reading
 * @route   DELETE /api/v1/readings/:id/like
 * @access  Private
 */
const unlikeReading = async (req, res, next) => {
  try {
    const like = await Like.findOneAndDelete({
      reading: req.params.id,
      user: req.user.id,
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        error: 'Like not found',
      });
    }

    // Decrement like count on reading
    const reading = await Reading.findById(req.params.id);
    if (reading) {
      reading.likesCount = Math.max(0, reading.likesCount - 1);
      await reading.save();
    }

    res.status(200).json({
      success: true,
      message: 'Reading unliked successfully',
      data: {
        likesCount: reading ? reading.likesCount : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get users who liked a reading
 * @route   GET /api/v1/readings/:id/likes
 * @access  Public
 */
const getReadingLikes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reading = await Reading.findById(req.params.id);
    if (!reading || !reading.isPublic) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found or not public',
      });
    }

    const likes = await Like.find({ reading: req.params.id })
      .populate('user', 'username profile.displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Like.countDocuments({ reading: req.params.id });

    res.status(200).json({
      success: true,
      count: likes.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: likes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if user liked a reading
 * @route   GET /api/v1/readings/:id/like/status
 * @access  Private
 */
const checkLikeStatus = async (req, res, next) => {
  try {
    const like = await Like.findOne({
      reading: req.params.id,
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: {
        liked: !!like,
        likeId: like ? like._id : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  likeReading,
  unlikeReading,
  getReadingLikes,
  checkLikeStatus,
};
