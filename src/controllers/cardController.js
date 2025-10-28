const cardDataService = require('../services/cardDataService');

/**
 * Card Controller
 * Handles tarot card operations using JSON-based data service
 */

/**
 * @desc    Get all cards
 * @route   GET /api/v1/cards
 * @access  Public
 */
const getAllCards = async (req, res, next) => {
  try {
    const { suit, arcana, page = 1, limit = 78 } = req.query;

    const filter = {};
    if (suit) filter.suit = suit;
    if (arcana) filter.arcana = arcana;

    // Get filtered cards
    let cards = cardDataService.getAllCards(filter);

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = cards.length;
    const skip = (pageNum - 1) * limitNum;

    cards = cards.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: cards.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search cards
 * @route   GET /api/v1/cards/search
 * @access  Public
 */
const searchCards = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    // Search cards
    let cards = cardDataService.searchCards(q);

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = cards.length;
    const skip = (pageNum - 1) * limitNum;

    cards = cards.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: cards.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single card
 * @route   GET /api/v1/cards/:id
 * @access  Public
 */
const getCard = async (req, res, next) => {
  try {
    const card = cardDataService.getCardById(req.params.id);

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
    // JSON-based service is read-only
    return res.status(501).json({
      success: false,
      error: 'Card creation is not supported in JSON-based mode. Please use database mode or edit JSON file directly.',
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
    // JSON-based service is read-only
    return res.status(501).json({
      success: false,
      error: 'Card updates are not supported in JSON-based mode. Please use database mode or edit JSON file directly.',
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
    // JSON-based service is read-only
    return res.status(501).json({
      success: false,
      error: 'Card deletion is not supported in JSON-based mode. Please use database mode or edit JSON file directly.',
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

    const cards = cardDataService.getRandomCards(count);

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
  searchCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  getRandomCards,
};
