const Comment = require('../models/Comment');
const Reading = require('../models/Reading');

/**
 * Comment Controller
 * Handles comment operations on public readings
 */

/**
 * @desc    Create comment on a public reading
 * @route   POST /api/v1/readings/:id/comments
 * @access  Private
 */
const createComment = async (req, res, next) => {
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
        error: 'Cannot comment on private reading',
      });
    }

    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required',
      });
    }

    // Create comment
    const comment = await Comment.create({
      reading: req.params.id,
      user: req.user.id,
      content: content.trim(),
    });

    // Increment comment count on reading
    reading.commentsCount += 1;
    await reading.save();

    // Populate user info
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username profile.displayName');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for a reading
 * @route   GET /api/v1/readings/:id/comments
 * @access  Public
 */
const getReadingComments = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'recent', // recent, popular
    } = req.query;

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

    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { likesCount: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const comments = await Comment.find({
      reading: req.params.id,
      isDeleted: false,
    })
      .populate('user', 'username profile.displayName')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Comment.countDocuments({
      reading: req.params.id,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update comment
 * @route   PUT /api/v1/comments/:id
 * @access  Private
 */
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Check ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment',
      });
    }

    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required',
      });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username profile.displayName');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/v1/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Check ownership
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment',
      });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    // Decrement comment count on reading
    const reading = await Reading.findById(comment.reading);
    if (reading) {
      reading.commentsCount = Math.max(0, reading.commentsCount - 1);
      await reading.save();
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Like a comment
 * @route   POST /api/v1/comments/:id/like
 * @access  Private
 */
const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Check if already liked
    if (comment.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'You have already liked this comment',
      });
    }

    comment.likes.push(req.user.id);
    comment.likesCount += 1;
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment liked successfully',
      data: {
        likesCount: comment.likesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unlike a comment
 * @route   DELETE /api/v1/comments/:id/like
 * @access  Private
 */
const unlikeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found',
      });
    }

    // Check if liked
    const likeIndex = comment.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'You have not liked this comment',
      });
    }

    comment.likes.splice(likeIndex, 1);
    comment.likesCount = Math.max(0, comment.likesCount - 1);
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment unliked successfully',
      data: {
        likesCount: comment.likesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getReadingComments,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
};
