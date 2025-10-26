const express = require('express');
const router = express.Router();
const {
  transcribeAudio,
  synthesizeSpeech,
  voiceReading,
  regenerateAudio,
} = require('../controllers/voiceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * Voice Routes
 * All routes require authentication
 */

/**
 * @route   POST /api/v1/voice/transcribe
 * @desc    Transcribe audio to text (STT)
 * @access  Private
 */
router.post('/transcribe', protect, upload.single('audio'), transcribeAudio);

/**
 * @route   POST /api/v1/voice/synthesize
 * @desc    Convert text to speech (TTS)
 * @access  Private
 */
router.post('/synthesize', protect, synthesizeSpeech);

/**
 * @route   POST /api/v1/voice/reading
 * @desc    Full voice tarot reading (STT → AI → TTS)
 * @access  Private
 */
router.post('/reading', protect, upload.single('audio'), voiceReading);

/**
 * @route   POST /api/v1/voice/reading/:id/regenerate
 * @desc    Regenerate audio for existing reading
 * @access  Private
 */
router.post('/reading/:id/regenerate', protect, regenerateAudio);

module.exports = router;
