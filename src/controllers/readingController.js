const Reading = require('../models/Reading');
const Spread = require('../models/Spread');
const Card = require('../models/Card');
const { performTarotReading } = require('../services/tarotService');

/**
 * Reading Controller
 * Handles tarot reading operations
 */

/**
 * @desc    Create new reading with AI interpretation
 * @route   POST /api/v1/readings
 * @access  Private
 */
const createReading = async (req, res, next) => {
  try {
    const { spread, question, category, isPublic, notes, tags } = req.body;

    // Get spread details
    const spreadDoc = await Spread.findById(spread);
    if (!spreadDoc) {
      return res.status(404).json({
        success: false,
        error: 'Spread not found',
      });
    }

    // Get random cards for the reading
    const selectedCards = await Card.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: spreadDoc.cardCount } },
    ]);

    // Randomly assign reversed status to some cards (30% chance)
    const cardsWithOrientation = selectedCards.map((card, index) => {
      const isReversed = Math.random() > 0.7;
      return {
        card: card._id,
        position: index + 1,
        orientation: isReversed ? 'reversed' : 'upright',
        isReversed, // For performTarotReading compatibility
      };
    });

    // Get user profile for personalized interpretation
    const userProfile = {
      expertiseLevel: req.user.profile?.expertiseLevel || 'beginner',
      preferences: req.user.preferences,
    };

    // Perform AI interpretation using Claude API
    const aiInterpretation = await performTarotReading(
      spreadDoc,
      selectedCards,
      cardsWithOrientation,
      question,
      category || 'general',
      userProfile
    );

    // Prepare cardsDrawn for database (without isReversed field)
    const cardsDrawn = cardsWithOrientation.map((card) => ({
      card: card.card,
      position: card.position,
      orientation: card.orientation,
    }));

    // Create reading document
    const reading = await Reading.create({
      user: req.user.id,
      spread,
      question,
      questionCategory: category || 'general',
      cardsDrawn,
      aiInterpretation,
      isPublic: isPublic || false,
      notes,
      tags,
    });

    // Update user statistics
    if (req.user.stats) {
      req.user.stats.totalReadings = (req.user.stats.totalReadings || 0) + 1;
    }
    await req.user.save();

    // Update spread popularity
    spreadDoc.popularity = (spreadDoc.popularity || 0) + 1;
    await spreadDoc.save();

    // Populate the reading
    const populatedReading = await Reading.findById(reading._id)
      .populate('spread')
      .populate('cardsDrawn.card');

    res.status(201).json({
      success: true,
      data: populatedReading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all readings for current user
 * @route   GET /api/readings
 * @access  Private
 */
const getMyReadings = async (req, res, next) => {
  try {
    const { category, isFavorite, limit = 20, page = 1 } = req.query;

    const filter = { user: req.user.id };
    if (category) filter.category = category;
    if (isFavorite !== undefined) filter.isFavorite = isFavorite === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const readings = await Reading.find(filter)
      .populate('spread')
      .populate('cards.card')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Reading.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: readings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single reading
 * @route   GET /api/readings/:id
 * @access  Private
 */
const getReading = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id)
      .populate('spread')
      .populate('cards.card')
      .populate('user', 'username displayName');

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found',
      });
    }

    // Check if user owns the reading or if it's public
    if (reading.user._id.toString() !== req.user.id && !reading.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this reading',
      });
    }

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update reading
 * @route   PUT /api/readings/:id
 * @access  Private
 */
const updateReading = async (req, res, next) => {
  try {
    let reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found',
      });
    }

    // Check ownership
    if (reading.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this reading',
      });
    }

    const { notes, tags, isFavorite, isPublic, rating } = req.body;

    const updateFields = {};
    if (notes !== undefined) updateFields.notes = notes;
    if (tags !== undefined) updateFields.tags = tags;
    if (isFavorite !== undefined) updateFields.isFavorite = isFavorite;
    if (isPublic !== undefined) updateFields.isPublic = isPublic;
    if (rating !== undefined) updateFields.rating = rating;

    reading = await Reading.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('spread')
      .populate('cards.card');

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete reading
 * @route   DELETE /api/readings/:id
 * @access  Private
 */
const deleteReading = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found',
      });
    }

    // Check ownership
    if (reading.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this reading',
      });
    }

    await reading.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit feedback for reading
 * @route   POST /api/v1/readings/:id/feedback
 * @access  Private
 */
const submitFeedback = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found',
      });
    }

    // Check ownership
    if (reading.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to provide feedback for this reading',
      });
    }

    const {
      rating,
      accuracyRating,
      clarityRating,
      usefulnessRating,
      comment,
      resonated,
    } = req.body;

    // Update feedback fields
    const feedbackUpdate = {};
    if (rating !== undefined) feedbackUpdate['userFeedback.rating'] = rating;
    if (accuracyRating !== undefined) feedbackUpdate['userFeedback.accuracyRating'] = accuracyRating;
    if (clarityRating !== undefined) feedbackUpdate['userFeedback.clarityRating'] = clarityRating;
    if (usefulnessRating !== undefined) feedbackUpdate['userFeedback.usefulnessRating'] = usefulnessRating;
    if (comment !== undefined) feedbackUpdate['userFeedback.comment'] = comment;
    if (resonated !== undefined) feedbackUpdate['userFeedback.resonated'] = resonated;
    feedbackUpdate['userFeedback.feedbackDate'] = new Date();

    const updatedReading = await Reading.findByIdAndUpdate(
      req.params.id,
      feedbackUpdate,
      { new: true, runValidators: true }
    )
      .populate('spread')
      .populate('cards.card');

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: updatedReading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public readings (shared by users)
 * @route   GET /api/v1/readings/public
 * @access  Public
 */
const getPublicReadings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'recent', // recent, popular, liked
      category,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { isPublic: true };
    if (category) {
      query.questionCategory = category;
    }

    // Build sort
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { viewsCount: -1, createdAt: -1 };
        break;
      case 'liked':
        sortOptions = { likesCount: -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Execute query
    const readings = await Reading.find(query)
      .populate('user', 'username profile.displayName')
      .populate('spread', 'name nameKo nameShort difficulty')
      .populate('cardsDrawn.card', 'name nameKo nameShort number imageUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Reading.countDocuments(query);

    res.status(200).json({
      success: true,
      count: readings.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: readings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single public reading (with view count increment)
 * @route   GET /api/v1/readings/shared/:id
 * @access  Public
 */
const getSharedReading = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id)
      .populate('user', 'username profile.displayName profile.bio')
      .populate('spread', 'name nameKo nameShort description cardCount positions')
      .populate('cardsDrawn.card');

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
        error: 'This reading is not public',
      });
    }

    // Increment view count (async, don't wait)
    Reading.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: false }
    ).exec();

    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle reading visibility (public/private)
 * @route   PUT /api/v1/readings/:id/visibility
 * @access  Private
 */
const toggleReadingVisibility = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found',
      });
    }

    // Check ownership
    if (reading.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this reading',
      });
    }

    // Toggle visibility
    reading.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : !reading.isPublic;
    await reading.save();

    res.status(200).json({
      success: true,
      message: `Reading is now ${reading.isPublic ? 'public' : 'private'}`,
      data: {
        id: reading._id,
        isPublic: reading.isPublic,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Increment reading share count
 * @route   POST /api/v1/readings/:id/share
 * @access  Public
 */
const incrementReadingShare = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: 'Reading not found',
      });
    }

    if (!reading.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Cannot share private reading',
      });
    }

    // Increment share count
    reading.sharesCount += 1;
    await reading.save();

    res.status(200).json({
      success: true,
      message: 'Share count incremented',
      data: {
        sharesCount: reading.sharesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReading,
  getMyReadings,
  getReading,
  updateReading,
  deleteReading,
  submitFeedback,
  // Public sharing functions
  getPublicReadings,
  getSharedReading,
  toggleReadingVisibility,
  incrementReadingShare,
};
