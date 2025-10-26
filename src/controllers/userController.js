const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

/**
 * User Controller
 * Handles user profile and account management
 */

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { displayName, birthDate, birthTime, zodiacSign, avatarUrl } = req.body;

    const updateFields = {};
    if (displayName !== undefined) updateFields['profile.displayName'] = displayName;
    if (birthDate !== undefined) updateFields['profile.birthDate'] = birthDate;
    if (birthTime !== undefined) updateFields['profile.birthTime'] = birthTime;
    if (zodiacSign !== undefined) updateFields['profile.zodiacSign'] = zodiacSign;
    if (avatarUrl !== undefined) updateFields['profile.avatarUrl'] = avatarUrl;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/v1/users/password
 * @access  Private
 */
const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const Reading = require('../models/Reading');

    // Get readings count by category
    const categoryStats = await Reading.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$questionCategory',
          count: { $count: {} },
        },
      },
    ]);

    // Get readings per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Reading.aggregate([
      {
        $match: {
          user: user._id,
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $count: {} },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get favorite cards
    const favoriteCards = await Reading.aggregate([
      { $match: { user: user._id } },
      { $unwind: '$cardsDrawn' },
      {
        $group: {
          _id: '$cardsDrawn.card',
          count: { $count: {} },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: '_id',
          as: 'card',
        },
      },
      { $unwind: '$card' },
      {
        $project: {
          card: {
            name: '$card.name',
            nameKo: '$card.nameKo',
            nameShort: '$card.nameShort',
          },
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReadings: user.stats.totalReadings,
        categoryBreakdown: categoryStats,
        monthlyActivity: monthlyStats,
        favoriteCards,
        subscription: {
          type: user.subscription.type,
          credits: user.subscription.credits,
          expiresAt: user.subscription.expiresAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export user's reading history
 * @route   GET /api/v1/users/export?format=pdf|csv|json
 * @access  Private
 */
const exportReadings = async (req, res, next) => {
  try {
    const { format = 'pdf' } = req.query;
    const exportService = require('../services/exportService');
    const Reading = require('../models/Reading');

    // Fetch all user readings with populated data
    const readings = await Reading.find({ user: req.user.id })
      .populate('spread', 'name nameKo')
      .populate('cardsDrawn.card', 'name nameKo number')
      .sort({ createdAt: -1 });

    if (readings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No readings found to export',
      });
    }

    if (format === 'csv') {
      const csv = exportService.generateCSV(readings);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=tarot-readings-${Date.now()}.csv`
      );
      return res.send(csv);
    } else if (format === 'json') {
      const json = exportService.generateJSON(readings);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=tarot-readings-${Date.now()}.json`
      );
      return res.send(json);
    } else if (format === 'pdf') {
      const pdfBuffer = await exportService.generatePDF(req.user, readings);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=tarot-readings-${Date.now()}.pdf`
      );
      return res.send(pdfBuffer);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Use pdf, csv, or json',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  getStats,
  exportReadings,
};
