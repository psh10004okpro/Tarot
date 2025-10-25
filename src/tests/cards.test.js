const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Card = require('../models/Card');
const User = require('../models/User');

/**
 * Cards API Integration Tests
 * Tests for card listing, search, and retrieval endpoints
 */

describe('Cards API', () => {
  let authToken;
  let adminToken;
  let testCardId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }

    // Create test user and get token
    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'cardtestuser',
        email: 'cardtest@example.com',
        password: 'password123',
      });

    authToken = userResponse.body.data.token;

    // Create test card
    const card = await Card.create({
      name: 'Test Card',
      nameKo: '테스트 카드',
      nameShort: 'test',
      number: 99,
      arcana: 'major',
      suit: 'none',
      meaningUpright: ['Test meaning'],
      meaningReversed: ['Test reversed'],
      keywordsUpright: 'test, card, upright',
      keywordsReversed: 'test, card, reversed',
      isActive: true,
    });

    testCardId = card._id.toString();
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({ email: 'cardtest@example.com' });
    await Card.deleteMany({ name: 'Test Card' });
    await mongoose.connection.close();
  });

  describe('GET /api/v1/cards', () => {
    it('should get all cards successfully', async () => {
      const response = await request(app)
        .get('/api/v1/cards')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should filter cards by arcana', async () => {
      const response = await request(app)
        .get('/api/v1/cards?arcana=major')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        response.body.data.forEach(card => {
          expect(card.arcana).toBe('major');
        });
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/cards?page=1&limit=5')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should filter cards by active status', async () => {
      const response = await request(app)
        .get('/api/v1/cards?isActive=true')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);

      if (response.body.data.length > 0) {
        response.body.data.forEach(card => {
          expect(card.isActive).toBe(true);
        });
      }
    });
  });

  describe('GET /api/v1/cards/search', () => {
    it('should search cards by name', async () => {
      const response = await request(app)
        .get('/api/v1/cards/search?q=fool')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should search cards by Korean name', async () => {
      const response = await request(app)
        .get('/api/v1/cards/search?q=바보')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail search without query parameter', async () => {
      const response = await request(app)
        .get('/api/v1/cards/search')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/search query is required/i);
    });

    it('should support pagination in search', async () => {
      const response = await request(app)
        .get('/api/v1/cards/search?q=test&page=1&limit=5')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/v1/cards/random/:count', () => {
    it('should get random cards successfully', async () => {
      const response = await request(app)
        .get('/api/v1/cards/random/3')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    it('should fail with count greater than 10', async () => {
      const response = await request(app)
        .get('/api/v1/cards/random/15')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with count less than 1', async () => {
      const response = await request(app)
        .get('/api/v1/cards/random/0')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/cards/:id', () => {
    it('should get a single card by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/cards/${testCardId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', testCardId);
      expect(response.body.data).toHaveProperty('name', 'Test Card');
    });

    it('should return 404 for non-existent card', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/cards/${fakeId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should fail with invalid card ID format', async () => {
      const response = await request(app)
        .get('/api/v1/cards/invalid-id')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});
