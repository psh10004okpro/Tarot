const mongoose = require('mongoose');
const Reading = require('../models/Reading');
const Card = require('../models/Card');

/**
 * Dashboard Controller
 * Provides user analytics and statistics
 */

/**
 * @desc    Get user dashboard statistics
 * @route   GET /api/v1/users/dashboard
 * @access  Private
 */
const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Total readings count
    const totalReadings = await Reading.countDocuments({ user: userId });

    // Readings by category
    const categoryStats = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$questionCategory',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Most frequent cards
    const topCards = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $unwind: '$cardsDrawn' },
      {
        $group: {
          _id: '$cardsDrawn.card',
          count: { $sum: 1 },
          upright: {
            $sum: { $cond: [{ $eq: ['$cardsDrawn.orientation', 'upright'] }, 1, 0] },
          },
          reversed: {
            $sum: { $cond: [{ $eq: ['$cardsDrawn.orientation', 'reversed'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: '_id',
          as: 'cardInfo',
        },
      },
      { $unwind: '$cardInfo' },
      {
        $project: {
          count: 1,
          upright: 1,
          reversed: 1,
          name: '$cardInfo.name',
          nameKo: '$cardInfo.nameKo',
          number: '$cardInfo.number',
        },
      },
    ]);

    // Monthly reading trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrend = await Reading.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
        },
      },
    ]);

    // Recent readings
    const recentReadings = await Reading.find({ user: userId })
      .populate('spread', 'name nameKo')
      .select('question questionCategory createdAt userFeedback.rating')
      .sort({ createdAt: -1 })
      .limit(5);

    // Favorite count
    const favoriteCount = await Reading.countDocuments({
      user: userId,
      isFavorite: true,
    });

    // Public readings stats
    const publicReadingsCount = await Reading.countDocuments({
      user: userId,
      isPublic: true,
    });

    const totalViews = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), isPublic: true } },
      { $group: { _id: null, total: { $sum: '$viewsCount' } } },
    ]);

    const totalLikes = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), isPublic: true } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } },
    ]);

    const totalComments = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), isPublic: true } },
      { $group: { _id: null, total: { $sum: '$commentsCount' } } },
    ]);

    // Average rating
    const avgRating = await Reading.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          'userFeedback.rating': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$userFeedback.rating' },
          totalRated: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalReadings,
          favoriteCount,
          publicReadingsCount,
          totalViews: totalViews[0]?.total || 0,
          totalLikes: totalLikes[0]?.total || 0,
          totalComments: totalComments[0]?.total || 0,
          avgRating: avgRating[0]?.avgRating || null,
          totalRated: avgRating[0]?.totalRated || 0,
        },
        categoryStats,
        topCards,
        monthlyTrend,
        recentReadings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed category statistics
 * @route   GET /api/v1/users/dashboard/categories
 * @access  Private
 */
const getCategoryStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$questionCategory',
          count: { $sum: 1 },
          avgRating: { $avg: '$userFeedback.rating' },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          category: '$_id',
          count: 1,
          avgRating: { $round: ['$avgRating', 2] },
          totalLikes: 1,
          totalComments: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get card frequency analysis
 * @route   GET /api/v1/users/dashboard/cards
 * @access  Private
 */
const getCardFrequency = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const cardStats = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $unwind: '$cardsDrawn' },
      {
        $group: {
          _id: {
            card: '$cardsDrawn.card',
            orientation: '$cardsDrawn.orientation',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.card',
          totalCount: { $sum: '$count' },
          upright: {
            $sum: { $cond: [{ $eq: ['$_id.orientation', 'upright'] }, '$count', 0] },
          },
          reversed: {
            $sum: { $cond: [{ $eq: ['$_id.orientation', 'reversed'] }, '$count', 0] },
          },
        },
      },
      { $sort: { totalCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: '_id',
          as: 'cardInfo',
        },
      },
      { $unwind: '$cardInfo' },
      {
        $project: {
          _id: 0,
          cardId: '$_id',
          name: '$cardInfo.name',
          nameKo: '$cardInfo.nameKo',
          number: '$cardInfo.number',
          arcana: '$cardInfo.arcana',
          totalCount: 1,
          upright: 1,
          reversed: 1,
          uprightPercentage: {
            $round: [{ $multiply: [{ $divide: ['$upright', '$totalCount'] }, 100] }, 1],
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: cardStats.length,
      data: cardStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get time-based reading patterns
 * @route   GET /api/v1/users/dashboard/patterns
 * @access  Private
 */
const getReadingPatterns = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Day of week pattern
    const dayOfWeekPattern = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          dayOfWeek: '$_id',
          count: 1,
        },
      },
    ]);

    // Hour of day pattern
    const hourPattern = await Reading.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          hour: '$_id',
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        dayOfWeek: dayOfWeekPattern,
        hourOfDay: hourPattern,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserDashboard,
  getCategoryStats,
  getCardFrequency,
  getReadingPatterns,
};
