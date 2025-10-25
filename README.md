# Unwoldam Studio - Tarot Card AI API

AI-powered tarot card reading application backend built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization with JWT
- Tarot card management (78 cards)
- Multiple spread patterns (3-card, Celtic Cross, etc.)
- AI-powered tarot reading interpretations
- Reading history and favorites
- RESTful API design
- Rate limiting and security features
- Comprehensive input validation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose 8.x
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcrypt, CORS, rate-limiting
- **Validation**: Joi
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint

## Project Structure

```
/src
  /models          # Mongoose models (User, Card, Spread, Reading)
  /routes          # Express routes
  /controllers     # Request handlers
  /middleware      # Auth, validation, error handling
  /services        # Business logic (tarot service)
  /utils           # Helper functions and logger
  /config          # Database configuration
  /tests           # Unit and integration tests
/public
  /images/cards    # Card images
server.js          # Application entry point
```

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm >= 9.0.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Tarot
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/unwoldam
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
ANTHROPIC_API_KEY=your_anthropic_api_key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Start MongoDB:
```bash
# Make sure MongoDB is running
mongod
```

6. Seed the database with initial data:
```bash
# Seed with initial cards, spreads, and test users
npm run seed

# Or clear existing data and seed fresh
npm run seed:clear
```

This will create:
- 22 Major Arcana tarot cards
- 5 tarot spreads (Single Card, Three Card, Love Triangle, Career Path, Celtic Cross)
- 2 test user accounts:
  - User: `test@unwoldam.com` / `password123`
  - Admin: `admin@unwoldam.com` / `admin123`

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
npm run lint:fix
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Cards
- `GET /api/cards` - Get all cards
- `GET /api/cards/:id` - Get single card
- `GET /api/cards/random/:count` - Get random cards
- `POST /api/cards` - Create card (admin only)
- `PUT /api/cards/:id` - Update card (admin only)
- `DELETE /api/cards/:id` - Delete card (admin only)

### Spreads
- `GET /api/spreads` - Get all spreads
- `GET /api/spreads/:id` - Get single spread
- `POST /api/spreads` - Create spread (admin only)
- `PUT /api/spreads/:id` - Update spread (admin only)
- `DELETE /api/spreads/:id` - Delete spread (admin only)

### Readings
- `GET /api/readings` - Get user's readings (protected)
- `GET /api/readings/:id` - Get single reading (protected)
- `POST /api/readings` - Create new reading (protected)
- `PUT /api/readings/:id` - Update reading (protected)
- `DELETE /api/readings/:id` - Delete reading (protected)

### System
- `GET /health` - Health check
- `GET /` - API information

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Development Phases

### Phase 1: Project Foundation (Completed)
- Project structure setup
- Database models
- Authentication system
- Basic CRUD operations
- Middleware and utilities

### Phase 2: Data Models & Seed Data (Completed)
- Enhanced data models with detailed fields
- 22 Major Arcana cards with Korean translations
- 5 tarot spread patterns
- Database seeding scripts
- Test user accounts

### Phase 3: AI Integration (Next)
- Anthropic Claude API integration
- Advanced tarot interpretation
- Context-aware readings

### Phase 4: Advanced Features (Future)
- Image upload for cards
- Public reading sharing
- User analytics
- Email notifications

## MongoDB Atlas Setup (Cloud Database)

If you don't have MongoDB installed locally, you can use MongoDB Atlas (free tier):

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. Create a new cluster (choose the free tier M0)

3. Create a database user:
   - Go to "Database Access"
   - Add a new database user with username and password
   - Remember these credentials!

4. Whitelist your IP address:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" for development (0.0.0.0/0)

5. Get your connection string:
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `unwoldam`

6. Update your `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/unwoldam?retryWrites=true&w=majority
```

7. Run the seed command:
```bash
npm run seed
```

## Data Models

### Card Model
- 22 Major Arcana cards with detailed meanings
- Upright and reversed interpretations
- Korean translations
- Keywords, symbolism, and affirmations
- Astrological and numerological associations

### Spread Model
- Multiple spread patterns (1-10 cards)
- Position-specific interpretations
- Difficulty levels (beginner, intermediate, advanced)
- Categories (love, career, spiritual, general, health)

### Reading Model
- User questions and card draws
- AI-generated interpretations
- User feedback and ratings
- Voice reading support
- Public/private sharing options

### User Model
- Authentication and profiles
- Subscription tiers (free, basic, premium)
- Reading history and statistics
- Preferences and expertise levels

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Helmet.js security headers
- CORS protection
- Rate limiting
- Input validation and sanitization
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Author

Unwoldam Studio

## Support

For issues and questions, please create an issue in the repository.

---

Built with by Unwoldam Studio
