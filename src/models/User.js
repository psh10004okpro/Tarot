const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User Schema
 * Manages user authentication and profile information
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },

  // Profile
  profile: {
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name must be less than 50 characters'],
    },
    birthDate: {
      type: Date,
    },
    birthTime: {
      type: String,
    },
    zodiacSign: {
      type: String,
      enum: [
        'Aries', 'Taurus', 'Gemini', 'Cancer',
        'Leo', 'Virgo', 'Libra', 'Scorpio',
        'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
        null,
      ],
    },
    avatarUrl: {
      type: String,
    },
  },

  // User Role
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  // Subscription
  subscription: {
    type: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
    credits: {
      type: Number,
      default: 10,
    },
    expiresAt: {
      type: Date,
    },
  },

  // Preferences
  preferences: {
    language: {
      type: String,
      enum: ['ko', 'en'],
      default: 'ko',
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    favoriteDeck: {
      type: String,
      default: 'Rider-Waite',
    },
    expertiseLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },

  // Statistics
  stats: {
    totalReadings: {
      type: Number,
      default: 0,
    },
    favoriteCards: [{
      card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
      },
      count: {
        type: Number,
        default: 0,
      },
    }],
    mostCommonQuestionCategory: {
      type: String,
      enum: ['love', 'career', 'spiritual', 'general', 'health', null],
    },
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to increment reading count
userSchema.methods.incrementReadingCount = async function () {
  this.stats.totalReadings += 1;
  await this.save();
};

// Method to use credit
userSchema.methods.useCredit = async function () {
  if (this.subscription.credits <= 0) {
    throw new Error('No credits remaining');
  }
  this.subscription.credits -= 1;
  await this.save();
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
