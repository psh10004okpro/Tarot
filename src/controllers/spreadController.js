const Spread = require('../models/Spread');

/**
 * Spread Controller
 * Handles tarot spread operations
 */

/**
 * @desc    Get all spreads
 * @route   GET /api/spreads
 * @access  Public
 */
const getAllSpreads = async (req, res, next) => {
  try {
    const { category, difficulty, isActive } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const spreads = await Spread.find(filter).sort({ popularity: -1 });

    res.status(200).json({
      success: true,
      count: spreads.length,
      data: spreads,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single spread
 * @route   GET /api/spreads/:id
 * @access  Public
 */
const getSpread = async (req, res, next) => {
  try {
    const spread = await Spread.findById(req.params.id);

    if (!spread) {
      return res.status(404).json({
        success: false,
        error: 'Spread not found',
      });
    }

    res.status(200).json({
      success: true,
      data: spread,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new spread
 * @route   POST /api/spreads
 * @access  Private/Admin
 */
const createSpread = async (req, res, next) => {
  try {
    const spread = await Spread.create(req.body);

    res.status(201).json({
      success: true,
      data: spread,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update spread
 * @route   PUT /api/spreads/:id
 * @access  Private/Admin
 */
const updateSpread = async (req, res, next) => {
  try {
    const spread = await Spread.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!spread) {
      return res.status(404).json({
        success: false,
        error: 'Spread not found',
      });
    }

    res.status(200).json({
      success: true,
      data: spread,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete spread
 * @route   DELETE /api/spreads/:id
 * @access  Private/Admin
 */
const deleteSpread = async (req, res, next) => {
  try {
    const spread = await Spread.findByIdAndDelete(req.params.id);

    if (!spread) {
      return res.status(404).json({
        success: false,
        error: 'Spread not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSpreads,
  getSpread,
  createSpread,
  updateSpread,
  deleteSpread,
};
