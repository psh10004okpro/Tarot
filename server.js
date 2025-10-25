require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const connectDB = require('./src/config/database');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

// Import routes
const authRoutes = require('./src/routes/auth');
const cardRoutes = require('./src/routes/cards');
const spreadRoutes = require('./src/routes/spreads');
const readingRoutes = require('./src/routes/readings');
const userRoutes = require('./src/routes/users');

/**
 * Unwoldam Studio - Tarot Card AI API
 * Express server configuration
 */

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  message: 'Too many registration attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const readingCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 readings per hour for free users
  message: 'Reading creation limit reached. Upgrade to premium for unlimited readings.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for premium users
    return req.user && req.user.subscription && req.user.subscription.type === 'premium';
  },
});

app.use('/api/', globalLimiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static Files
app.use('/images', express.static('public/images'));

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Unwoldam API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Unwoldam API Docs',
}));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1/spreads', spreadRoutes);
app.use('/api/v1/readings', readingRoutes);
app.use('/api/v1/users', userRoutes);

// Apply specific rate limiters
const authRouter = express.Router();
authRouter.post('/login', authLoginLimiter);
authRouter.post('/register', authRegisterLimiter);
app.use('/api/v1/auth', authRouter);

const readingRouter = express.Router();
readingRouter.post('/', readingCreationLimiter);
app.use('/api/v1/readings', readingRouter);

// Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Unwoldam Studio Tarot API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      cards: '/api/v1/cards',
      spreads: '/api/v1/spreads',
      readings: '/api/v1/readings',
      users: '/api/v1/users',
    },
  });
});

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', { error: err.message });
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
