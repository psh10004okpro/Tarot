const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Unwoldam Studio - Tarot Card AI API',
      version: '1.0.0',
      description: 'RESTful API for AI-powered tarot card readings with subscription management',
      contact: {
        name: 'Unwoldam Studio',
        email: 'support@unwoldam.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.unwoldam.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'testuser' },
            email: { type: 'string', example: 'test@unwoldam.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            profile: {
              type: 'object',
              properties: {
                displayName: { type: 'string', example: 'Test User' },
                birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
                zodiacSign: { type: 'string', example: 'Capricorn' },
              },
            },
            subscription: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['free', 'basic', 'premium'], example: 'free' },
                credits: { type: 'number', example: 10 },
                expiresAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        Card: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'The Fool' },
            nameKo: { type: 'string', example: '바보' },
            nameShort: { type: 'string', example: 'fool' },
            number: { type: 'number', example: 0 },
            arcana: { type: 'string', enum: ['major', 'minor'], example: 'major' },
            suit: { type: 'string', enum: ['wands', 'cups', 'swords', 'pentacles', 'none'], example: 'none' },
            meaningUpright: {
              type: 'array',
              items: { type: 'string' },
              example: ['New beginnings', 'Innocence', 'Spontaneity'],
            },
            meaningReversed: {
              type: 'array',
              items: { type: 'string' },
              example: ['Recklessness', 'Naivety', 'Poor judgment'],
            },
          },
        },
        Spread: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Three Card Spread' },
            nameKo: { type: 'string', example: '쓰리 카드 스프레드' },
            description: { type: 'string', example: 'A versatile three-card spread' },
            cardCount: { type: 'number', example: 3 },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'beginner' },
            category: { type: 'string', example: 'general' },
            isPremium: { type: 'boolean', example: false },
          },
        },
        Reading: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            spread: { type: 'string', example: '507f1f77bcf86cd799439011' },
            question: { type: 'string', example: 'What does my future hold?' },
            cardsDrawn: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  card: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  position: { type: 'number', example: 1 },
                  isReversed: { type: 'boolean', example: false },
                },
              },
            },
            aiInterpretation: {
              type: 'object',
              properties: {
                fullReading: { type: 'string', example: 'Your reading shows...' },
                overallMessage: { type: 'string', example: 'Embrace new beginnings' },
                advice: { type: 'string', example: 'Take calculated risks' },
              },
            },
            isFavorite: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Error message' },
                code: { type: 'string', example: 'ERROR_CODE' },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Cards',
        description: 'Tarot card management',
      },
      {
        name: 'Spreads',
        description: 'Tarot spread patterns',
      },
      {
        name: 'Readings',
        description: 'Tarot reading operations',
      },
      {
        name: 'Users',
        description: 'User profile and statistics',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
