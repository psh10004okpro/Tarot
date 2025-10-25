require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Card = require('../src/models/Card');
const Spread = require('../src/models/Spread');
const User = require('../src/models/User');
const logger = require('../src/utils/logger');

/**
 * Database Seeding Script
 * Seeds the database with initial tarot cards, spreads, and a test user
 */

// Read JSON data files
const cardsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/tarot_cards_major_arcana.json'), 'utf-8')
);

const spreadsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/tarot_spreads.json'), 'utf-8')
);

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected for seeding');
  } catch (error) {
    logger.error('MongoDB connection error:', { error: error.message });
    process.exit(1);
  }
};

/**
 * Clear existing data
 */
const clearData = async () => {
  try {
    await Card.deleteMany({});
    await Spread.deleteMany({});
    await User.deleteMany({});
    logger.info('Existing data cleared');
  } catch (error) {
    logger.error('Error clearing data:', { error: error.message });
    throw error;
  }
};

/**
 * Seed Cards
 */
const seedCards = async () => {
  try {
    const cards = await Card.insertMany(cardsData);
    logger.info(`${cards.length} cards seeded successfully`);
    return cards;
  } catch (error) {
    logger.error('Error seeding cards:', { error: error.message });
    throw error;
  }
};

/**
 * Seed Spreads
 */
const seedSpreads = async () => {
  try {
    const spreads = await Spread.insertMany(spreadsData);
    logger.info(`${spreads.length} spreads seeded successfully`);
    return spreads;
  } catch (error) {
    logger.error('Error seeding spreads:', { error: error.message });
    throw error;
  }
};

/**
 * Create Test User
 */
const createTestUser = async () => {
  try {
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@unwoldam.com',
      password: 'password123',
      profile: {
        displayName: 'Test User',
      },
      role: 'user',
      subscription: {
        type: 'premium',
        credits: 100,
      },
      preferences: {
        language: 'ko',
        expertiseLevel: 'beginner',
      },
    });
    logger.info('Test user created successfully', {
      username: testUser.username,
      email: testUser.email,
    });
    return testUser;
  } catch (error) {
    logger.error('Error creating test user:', { error: error.message });
    throw error;
  }
};

/**
 * Create Admin User
 */
const createAdminUser = async () => {
  try {
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@unwoldam.com',
      password: 'admin123',
      profile: {
        displayName: 'Administrator',
      },
      role: 'admin',
      subscription: {
        type: 'premium',
        credits: 999,
      },
      preferences: {
        language: 'ko',
        expertiseLevel: 'advanced',
      },
    });
    logger.info('Admin user created successfully', {
      username: adminUser.username,
      email: adminUser.email,
    });
    return adminUser;
  } catch (error) {
    logger.error('Error creating admin user:', { error: error.message });
    throw error;
  }
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Connect to database
    await connectDB();

    // Check if --clear flag is provided
    const shouldClear = process.argv.includes('--clear');

    if (shouldClear) {
      logger.info('Clearing existing data...');
      await clearData();
    }

    // Seed data
    const cards = await seedCards();
    const spreads = await seedSpreads();
    const testUser = await createTestUser();
    const adminUser = await createAdminUser();

    logger.info('Database seeding completed successfully!');
    logger.info('Summary:', {
      cards: cards.length,
      spreads: spreads.length,
      users: 2,
    });

    console.log('\n=================================');
    console.log('Database Seeding Complete!');
    console.log('=================================');
    console.log(`Cards seeded: ${cards.length}`);
    console.log(`Spreads seeded: ${spreads.length}`);
    console.log('Users created: 2');
    console.log('\nTest Accounts:');
    console.log('User - email: test@unwoldam.com, password: password123');
    console.log('Admin - email: admin@unwoldam.com, password: admin123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', { error: error.message });
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
