const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../models/User');

/**
 * Auth API Integration Tests
 * Tests for registration, login, logout, and profile endpoints
 */

describe('Auth API', () => {
  let authToken;
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
  };

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({ email: testUser.email });
    await mongoose.connection.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).toHaveProperty('username', testUser.username);
      expect(response.body.data.user).not.toHaveProperty('password');

      authToken = response.body.data.token;
    });

    it('should fail to register with existing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should fail to register without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'incomplete@example.com' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail to register with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('should fail to login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/invalid credentials/i);
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to login without required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testUser.email })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should fail to get profile without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail to get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/logged out/i);
    });

    it('should fail to logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login endpoint', async () => {
      const requests = [];

      // Make 6 requests (limit is 5)
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({
              email: 'wrong@example.com',
              password: 'wrongpassword',
            })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses[responses.length - 1];

      expect(rateLimitedResponse.status).toBe(429);
    }, 10000); // Increase timeout for rate limiting test
  });
});
