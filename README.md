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
- **AI**: Anthropic Claude Sonnet 4, OpenAI Whisper & TTS
- **Security**: Helmet, bcrypt, CORS, rate-limiting
- **Validation**: Joi
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint
- **Deployment**: Docker, Railway (Platform-as-a-Service)

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

# Claude API Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLAUDE_MODEL=claude-sonnet-4-20250514
CLAUDE_MAX_TOKENS=2000
CLAUDE_TEMPERATURE=0.7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Get your Anthropic API key:
   - Sign up at [Anthropic Console](https://console.anthropic.com/)
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key to your `.env` file as `ANTHROPIC_API_KEY`
   - **Note**: The API key is required for AI-powered tarot interpretations

6. Start MongoDB:
```bash
# Make sure MongoDB is running
mongod
```

7. Seed the database with initial data:
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

## API Documentation

**Interactive API Documentation**: Available at `/api-docs` when server is running

**Postman Collection**: Import `postman_collection.json` for testing

### Base URL
- Development: `http://localhost:3000`
- API Version: `/api/v1`

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user (protected)
- `GET /api/v1/auth/me` - Get current user (protected)
- `PUT /api/v1/auth/profile` - Update profile (protected)

### Cards
- `GET /api/v1/cards` - Get all cards (supports pagination, filtering)
- `GET /api/v1/cards/search?q=term` - Search cards by name/keywords
- `GET /api/v1/cards/random/:count` - Get random cards (1-10)
- `GET /api/v1/cards/:id` - Get single card
- `POST /api/v1/cards` - Create card (admin only)
- `PUT /api/v1/cards/:id` - Update card (admin only)
- `DELETE /api/v1/cards/:id` - Delete card (admin only)

### Spreads
- `GET /api/v1/spreads` - Get all spreads
- `GET /api/v1/spreads/:id` - Get single spread
- `POST /api/v1/spreads` - Create spread (admin only)
- `PUT /api/v1/spreads/:id` - Update spread (admin only)
- `DELETE /api/v1/spreads/:id` - Delete spread (admin only)

### Readings
- `GET /api/v1/readings` - Get user's readings (protected, paginated)
- `GET /api/v1/readings/:id` - Get single reading (protected)
- `POST /api/v1/readings` - Create new reading (protected, rate-limited)
- `PUT /api/v1/readings/:id` - Update reading (protected)
- `DELETE /api/v1/readings/:id` - Delete reading (protected)
- `POST /api/v1/readings/:id/feedback` - Submit reading feedback (protected)

### Users
- `GET /api/v1/users/profile` - Get user profile (protected)
- `PUT /api/v1/users/profile` - Update user profile (protected)
- `PUT /api/v1/users/password` - Update password (protected)
- `GET /api/v1/users/stats` - Get user statistics (protected)

### Voice (STT/TTS)
- `POST /api/v1/voice/transcribe` - Convert audio to text (protected, multipart/form-data)
- `POST /api/v1/voice/synthesize` - Convert text to speech (protected)
- `POST /api/v1/voice/reading` - Full voice tarot reading (protected, multipart/form-data)
- `POST /api/v1/voice/reading/:id/regenerate` - Regenerate audio for existing reading (protected)

### System
- `GET /health` - Health check
- `GET /` - API information
- `GET /api-docs` - Swagger API documentation

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
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

### Rate Limiting
- **Global**: 100 requests per 15 minutes
- **Login**: 5 attempts per 15 minutes
- **Register**: 3 attempts per hour
- **Create Reading**: 10 per hour (free users), unlimited (premium)

## Development Phases

### Phase 1: Project Foundation ✅ Completed
- Project structure setup
- Database models
- Authentication system
- Basic CRUD operations
- Middleware and utilities

### Phase 2: Data Models & Seed Data ✅ Completed
- Enhanced data models with detailed fields
- 22 Major Arcana cards with Korean translations
- 5 tarot spread patterns
- Database seeding scripts
- Test user accounts

### Phase 3: Complete REST API ✅ Completed
- Enhanced authentication with subscription management
- Comprehensive API endpoints (/api/v1)
- Search and pagination for cards
- Reading feedback system
- User profile and statistics
- Rate limiting per endpoint
- Swagger/OpenAPI documentation
- Integration tests (Jest + Supertest)
- Postman collection

### Phase 4: AI Integration ✅ Completed
- Anthropic Claude API integration (Claude Sonnet 4)
- AI-powered tarot card interpretations in Korean
- Context-aware readings based on user questions
- Personalized interpretations by expertise level
- Position-specific card analysis
- Automatic retry logic with exponential backoff
- Fallback interpretation when API unavailable
- Token usage tracking and cost monitoring

### Phase 5: Voice Features ✅ Completed
- OpenAI Whisper integration for Speech-to-Text (STT)
- OpenAI TTS for Text-to-Speech synthesis
- Full voice-based tarot reading flow
- Korean language support for voice
- Multiple voice style options (6 voices)
- Audio file management with automatic cleanup
- Multipart file upload handling
- Voice reading regeneration for existing readings

### Phase 6: Advanced Features (Next)
- Image upload for cards
- Public reading sharing
- User analytics dashboard
- Email notifications
- Reading history export
- Social features (comments, likes)

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

## AI-Powered Interpretation

This API uses **Anthropic's Claude AI** (Sonnet 4) to generate personalized tarot card interpretations.

### Features

- **Korean Language Support**: All interpretations are generated in Korean
- **Context-Aware**: Considers user's question, card positions, and spread type
- **Personalized**: Adapts language complexity based on user expertise level (beginner/intermediate/advanced)
- **Comprehensive Analysis**:
  - Individual card interpretations for each position
  - Overall message synthesizing all cards
  - Practical advice and guidance
  - Card interactions and patterns (elements, numerology)
- **Reliable**: Automatic retry with exponential backoff
- **Fallback**: Basic card meanings if API is unavailable

### Claude API Configuration

```env
ANTHROPIC_API_KEY=your_key_here       # Required
CLAUDE_MODEL=claude-sonnet-4-20250514  # Default model
CLAUDE_MAX_TOKENS=2000                 # Max response length
CLAUDE_TEMPERATURE=0.7                 # Creativity (0.0-1.0)
```

### Cost Estimation

- Input: ~500-800 tokens per reading (cards, spread, question)
- Output: ~1500-2000 tokens per reading (interpretation)
- Total: ~2000-2800 tokens per reading
- Approximate cost: $0.015-$0.02 per reading (Claude Sonnet 4 pricing)

### Response Format

```json
{
  "aiInterpretation": {
    "fullReading": "📖 Complete formatted interpretation...",
    "positionReadings": [
      {
        "position": 1,
        "cardName": "바보",
        "interpretation": "새로운 시작을 나타냅니다..."
      }
    ],
    "overallMessage": "전체적인 메시지...",
    "advice": "실천 가능한 조언...",
    "generatedBy": "claude-sonnet-4-20250514",
    "generatedAt": "2025-10-25T...",
    "tokensUsed": 2345
  }
}
```

## Voice Features (STT/TTS)

This API supports full voice-based tarot readings using **OpenAI's Whisper** (Speech-to-Text) and **TTS** (Text-to-Speech) APIs.

### Features

- **Speech-to-Text (STT)**: Convert user's spoken question to text using Whisper
- **Korean Language Support**: Optimized for Korean speech recognition
- **Text-to-Speech (TTS)**: Convert AI interpretation to natural-sounding Korean audio
- **Full Voice Reading Flow**: Ask question → Draw cards → Receive audio interpretation
- **Multiple Voice Options**: Choose from 6 different voice styles
- **Audio File Management**: Automatic cleanup of old files (24 hours)

### Voice Configuration

```env
OPENAI_API_KEY=your_openai_api_key_here  # Required
TTS_MODEL=tts-1-hd                        # High quality (or tts-1 for faster/cheaper)
TTS_VOICE=nova                            # Voice style (alloy, echo, fable, onyx, nova, shimmer)
TTS_SPEED=0.95                            # Speech speed (0.25-4.0, default 0.95)
```

### Voice Styles

- **alloy**: Neutral and balanced
- **echo**: Clear and professional
- **fable**: Warm and expressive
- **onyx**: Deep and authoritative
- **nova**: Friendly and energetic (default)
- **shimmer**: Soft and soothing

### Supported Audio Formats

**Upload (STT):**
- WAV, MP3, M4A, OGG, WebM, FLAC, AAC
- Maximum file size: 25MB (Whisper API limit)

**Download (TTS):**
- MP3 format
- Public URL accessible for 24 hours

### Usage Example

**1. Full Voice Reading (All-in-one)**

```bash
# Record audio question (e.g., "나의 커리어 전망은 어떤가요?")
# Upload via multipart/form-data

POST /api/v1/voice/reading
Content-Type: multipart/form-data

audio: [audio file]
category: career (optional)
spread: [spread_id] (optional, defaults to Three Card Spread)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reading": { ... },
    "transcription": "나의 커리어 전망은 어떤가요?",
    "audioUrl": "/audio/tts_uuid.mp3"
  }
}
```

**2. Transcribe Only (STT)**

```bash
POST /api/v1/voice/transcribe
Content-Type: multipart/form-data

audio: [audio file]
```

**3. Synthesize Only (TTS)**

```bash
POST /api/v1/voice/synthesize
Content-Type: application/json

{
  "text": "타로 리딩 결과입니다...",
  "voice": "nova"  // optional
}
```

**4. Regenerate Audio**

```bash
# For existing reading without audio
POST /api/v1/voice/reading/:readingId/regenerate
```

### Cost Estimation

**Whisper (STT):**
- $0.006 per minute of audio
- Average question: 10-30 seconds = ~$0.001-0.003

**TTS:**
- $15.00 per 1M characters (tts-1-hd)
- $7.50 per 1M characters (tts-1)
- Average reading: 1500-2000 characters = ~$0.02-0.03

**Total per voice reading:** ~$0.02-0.04

### Browser Integration Example

```javascript
// Record audio in browser
const mediaRecorder = new MediaRecorder(stream);
// ... record audio ...

// Upload for voice reading
const formData = new FormData();
formData.append('audio', audioBlob, 'question.webm');
formData.append('category', 'love');

const response = await fetch('/api/v1/voice/reading', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { data } = await response.json();

// Play audio response
const audio = new Audio(data.audioUrl);
audio.play();
```

### Audio File Cleanup

- Audio files are automatically deleted after 24 hours
- Cleanup runs daily at midnight (cron job)
- Manual cleanup can be triggered if needed

## Deployment

### Railway Deployment (Recommended)

This application is optimized for deployment on **Railway** with full platform portability.

**Quick Deploy:**

1. Fork this repository to your GitHub account
2. Sign up at [Railway](https://railway.app)
3. Create new project from GitHub repo
4. Add environment variables (see RAILWAY_DEPLOYMENT.md)
5. Deploy automatically

**Comprehensive Guide:**

For detailed step-by-step instructions, troubleshooting, and cost optimization:

📖 **[Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md)**

### Docker Deployment

The application includes a production-ready Dockerfile for containerized deployment.

```bash
# Build image
docker build -t unwoldam-tarot-api .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e ANTHROPIC_API_KEY="your_key" \
  -e OPENAI_API_KEY="your_key" \
  -e JWT_SECRET="your_secret" \
  unwoldam-tarot-api
```

### Platform Portability

The application is designed for maximum portability (95/100 score):

- **Environment-based configuration**: All settings via env variables
- **Storage abstraction layer**: Supports local/S3/GCS storage
- **Docker containerization**: Deploy anywhere Docker runs
- **No platform lock-in**: Easy migration to AWS, GCP, Azure, DigitalOcean

**Supported Platforms:**
- Railway (recommended for MVP)
- Render
- Fly.io
- AWS (ECS, Elastic Beanstalk)
- Google Cloud (Cloud Run)
- DigitalOcean App Platform
- Any Docker-compatible platform

**Cost Estimates:**
- Railway: $3-5/month (free tier covers MVP)
- Render: $7/month (free tier available)
- Fly.io: $5-10/month
- See RAILWAY_DEPLOYMENT.md for detailed cost analysis

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
