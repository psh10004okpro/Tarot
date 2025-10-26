const voiceService = require('../services/voiceService');
const { performTarotReading } = require('../services/tarotService');
const Reading = require('../models/Reading');
const Spread = require('../models/Spread');
const Card = require('../models/Card');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Voice Controller
 * Handles voice-based tarot reading operations
 */

/**
 * @desc    Transcribe audio to text (STT)
 * @route   POST /api/v1/voice/transcribe
 * @access  Private
 */
const transcribeAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: '오디오 파일이 필요합니다',
          code: 'AUDIO_FILE_REQUIRED',
        },
      });
    }

    logger.info(`Transcribing audio for user: ${req.user.id}`);

    const text = await voiceService.transcribeAudio(req.file.buffer, req.file.originalname);

    res.status(200).json({
      success: true,
      data: {
        transcription: text,
        language: 'ko',
        audioSize: req.file.size,
        audioType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Synthesize text to speech (TTS)
 * @route   POST /api/v1/voice/synthesize
 * @access  Private
 */
const synthesizeSpeech = async (req, res, next) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: {
          message: '변환할 텍스트가 필요합니다',
          code: 'TEXT_REQUIRED',
        },
      });
    }

    if (text.length > 4096) {
      return res.status(400).json({
        success: false,
        error: {
          message: '텍스트는 4096자를 초과할 수 없습니다',
          code: 'TEXT_TOO_LONG',
        },
      });
    }

    logger.info(`Synthesizing speech for user: ${req.user.id}, length: ${text.length}`);

    const audioUrl = await voiceService.synthesizeSpeech(text, voice);

    res.status(200).json({
      success: true,
      data: {
        audioUrl,
        textLength: text.length,
        voice: voice || process.env.TTS_VOICE || 'nova',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Full voice tarot reading (STT → Reading → TTS)
 * @route   POST /api/v1/voice/reading
 * @access  Private
 */
const voiceReading = async (req, res, next) => {
  try {
    // 1. Validate audio file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: '음성 파일이 필요합니다',
          code: 'AUDIO_FILE_REQUIRED',
        },
      });
    }

    logger.info(`Voice reading requested by user: ${req.user.id}`);

    // 2. Transcribe audio to text
    const question = await voiceService.transcribeAudio(req.file.buffer, req.file.originalname);

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: '음성을 인식할 수 없습니다. 다시 시도해주세요.',
          code: 'TRANSCRIPTION_EMPTY',
        },
      });
    }

    logger.info(`Transcribed question: ${question}`);

    // 3. Get spread (default to Three Card Spread)
    const { spread: spreadId, category } = req.body;
    let spreadDoc;

    if (spreadId) {
      spreadDoc = await Spread.findById(spreadId);
    } else {
      // Default to Three Card Spread for voice readings
      spreadDoc = await Spread.findOne({ nameShort: 'three-card' });
      if (!spreadDoc) {
        spreadDoc = await Spread.findOne({ cardCount: 3 });
      }
    }

    if (!spreadDoc) {
      return res.status(404).json({
        success: false,
        error: {
          message: '스프레드를 찾을 수 없습니다',
          code: 'SPREAD_NOT_FOUND',
        },
      });
    }

    // 4. Draw random cards
    const selectedCards = await Card.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: spreadDoc.cardCount } },
    ]);

    // 5. Assign orientations
    const cardsWithOrientation = selectedCards.map((card, index) => {
      const isReversed = Math.random() > 0.7;
      return {
        card: card._id,
        position: index + 1,
        orientation: isReversed ? 'reversed' : 'upright',
        isReversed,
      };
    });

    // 6. Get user profile
    const userProfile = {
      expertiseLevel: req.user.profile?.expertiseLevel || 'beginner',
      preferences: req.user.preferences,
    };

    // 7. Generate AI interpretation
    const aiInterpretation = await performTarotReading(
      spreadDoc,
      selectedCards,
      cardsWithOrientation,
      question,
      category || 'general',
      userProfile
    );

    // 8. Synthesize tarot reading to audio
    logger.info('Generating audio for tarot reading');
    const audioUrl = await voiceService.synthesizeTarotReading(aiInterpretation);

    // 9. Prepare cardsDrawn for database
    const cardsDrawn = cardsWithOrientation.map((card) => ({
      card: card.card,
      position: card.position,
      orientation: card.orientation,
    }));

    // 10. Create reading document
    const reading = await Reading.create({
      user: req.user.id,
      spread: spreadDoc._id,
      question,
      questionCategory: category || 'general',
      cardsDrawn,
      aiInterpretation,
      isVoiceReading: true,
      audioUrl,
      isPublic: false,
    });

    // 11. Update user statistics
    if (req.user.stats) {
      req.user.stats.totalReadings = (req.user.stats.totalReadings || 0) + 1;
    }
    await req.user.save();

    // 12. Update spread popularity
    spreadDoc.popularity = (spreadDoc.popularity || 0) + 1;
    await spreadDoc.save();

    // 13. Populate the reading
    const populatedReading = await Reading.findById(reading._id)
      .populate('spread')
      .populate('cardsDrawn.card');

    logger.info(`Voice reading created successfully: ${reading._id}`);

    res.status(201).json({
      success: true,
      data: {
        reading: populatedReading,
        transcription: question,
        audioUrl,
        spread: {
          name: spreadDoc.name,
          nameKo: spreadDoc.nameKo,
        },
      },
    });
  } catch (error) {
    logger.error('Voice reading error:', { error: error.message });
    next(error);
  }
};

/**
 * @desc    Regenerate audio for existing reading
 * @route   POST /api/v1/voice/reading/:id/regenerate
 * @access  Private
 */
const regenerateAudio = async (req, res, next) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Reading not found',
          code: 'READING_NOT_FOUND',
        },
      });
    }

    // Check ownership
    if (reading.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: '권한이 없습니다',
          code: 'FORBIDDEN',
        },
      });
    }

    if (!reading.aiInterpretation) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'AI 해석이 없는 리딩입니다',
          code: 'NO_INTERPRETATION',
        },
      });
    }

    logger.info(`Regenerating audio for reading: ${reading._id}`);

    // Generate new audio
    const audioUrl = await voiceService.synthesizeTarotReading(reading.aiInterpretation);

    // Update reading
    reading.audioUrl = audioUrl;
    reading.isVoiceReading = true;
    await reading.save();

    res.status(200).json({
      success: true,
      data: {
        audioUrl,
        readingId: reading._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  transcribeAudio,
  synthesizeSpeech,
  voiceReading,
  regenerateAudio,
};
