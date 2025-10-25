const Card = require('../models/Card');

/**
 * Card Controller
 * Handles tarot card operations
 */

/**
 * @desc    Get all cards
 * @route   GET /api/cards
 * @access  Public
 */
const getAllCards = async (req, res, next) => {
  try {
    const { suit, arcana, isActive } = req.query;

    const filter = {};
    if (suit) filter.suit = suit;
    if (arcana) filter.arcana = arcana;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const cards = await Card.find(filter).sort({ number: 1 });

    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single card
 * @route   GET /api/cards/:id
 * @access  Public
 */
const getCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found',
      });
    }

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new card
 * @route   POST /api/cards
 * @access  Private/Admin
 */
const createCard = async (req, res, next) => {
  try {
    const card = await Card.create(req.body);

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update card
 * @route   PUT /api/cards/:id
 * @access  Private/Admin
 */
const updateCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found',
      });
    }

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete card
 * @route   DELETE /api/cards/:id
 * @access  Private/Admin
 */
const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found',
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

/**
 * @desc    Get random cards
 * @route   GET /api/cards/random/:count
 * @access  Public
 */
const getRandomCards = async (req, res, next) => {
  try {
    const count = parseInt(req.params.count) || 1;

    if (count < 1 || count > 10) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 10',
      });
    }

    const cards = await Card.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: count } },
    ]);

    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  getRandomCards,
};
