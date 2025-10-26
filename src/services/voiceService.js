const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Voice Service
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS) using OpenAI APIs
 */

class VoiceService {
  constructor() {
    // Check if OpenAI API key is configured
    this.isConfigured = !!process.env.OPENAI_API_KEY;

    if (this.isConfigured) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      logger.info('VoiceService initialized with OpenAI API');
    } else {
      this.openai = null;
      logger.warn(
        'VoiceService: OPENAI_API_KEY not configured. Voice features (STT/TTS) will be disabled.'
      );
    }

    this.audioDir = path.join(__dirname, '../../public/audio');
    this.ttsModel = process.env.TTS_MODEL || 'tts-1-hd';
    this.ttsVoice = process.env.TTS_VOICE || 'nova';
    this.ttsSpeed = parseFloat(process.env.TTS_SPEED) || 0.95;

    // Create audio directory if it doesn't exist
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
      logger.info('Created audio directory:', this.audioDir);
    }
  }

  /**
   * Speech-to-Text: Convert audio to text using Whisper
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {String} filename - Original filename
   * @returns {Promise<String>} Transcribed text
   */
  async transcribeAudio(audioBuffer, filename) {
    if (!this.isConfigured) {
      logger.error('VoiceService: Cannot transcribe audio - OPENAI_API_KEY not configured');
      throw new Error('음성 인식 기능이 비활성화되어 있습니다. 관리자에게 문의하세요.');
    }

    try {
      // Save temporary file
      const tempFilePath = path.join(this.audioDir, `temp_${uuidv4()}_${filename}`);
      fs.writeFileSync(tempFilePath, audioBuffer);

      logger.info('Transcribing audio file:', filename);

      // Call Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'ko', // Korean
        response_format: 'json',
      });

      // Delete temporary file
      fs.unlinkSync(tempFilePath);

      logger.info('Transcription successful:', transcription.text);

      return transcription.text;
    } catch (error) {
      logger.error('STT Error:', { error: error.message });
      throw new Error('음성 인식에 실패했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * Text-to-Speech: Convert text to audio
   * @param {String} text - Text to convert
   * @param {String} voice - Voice style (alloy, echo, fable, onyx, nova, shimmer)
   * @returns {Promise<String>} Generated audio file URL
   */
  async synthesizeSpeech(text, voice = null) {
    if (!this.isConfigured) {
      logger.error('VoiceService: Cannot synthesize speech - OPENAI_API_KEY not configured');
      throw new Error('음성 합성 기능이 비활성화되어 있습니다. 관리자에게 문의하세요.');
    }

    try {
      const selectedVoice = voice || this.ttsVoice;
      const filename = `tts_${uuidv4()}.mp3`;
      const filepath = path.join(this.audioDir, filename);

      logger.info('Synthesizing speech, length:', text.length);

      // Call OpenAI TTS API
      const mp3 = await this.openai.audio.speech.create({
        model: this.ttsModel,
        voice: selectedVoice,
        input: text,
        speed: this.ttsSpeed,
      });

      // Save audio stream to file
      const buffer = Buffer.from(await mp3.arrayBuffer());
      fs.writeFileSync(filepath, buffer);

      logger.info('Speech synthesis successful:', filename);

      // Return public URL
      return `/audio/${filename}`;
    } catch (error) {
      logger.error('TTS Error:', { error: error.message });
      throw new Error('음성 합성에 실패했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * Synthesize tarot reading with improved formatting
   * @param {Object} interpretation - AI interpretation object
   * @returns {Promise<String>} Audio file URL
   */
  async synthesizeTarotReading(interpretation) {
    let speechText = '';

    // Introduction
    speechText += '타로 리딩 결과를 알려드리겠습니다. ';

    // Position-by-position readings
    if (interpretation.positionReadings && interpretation.positionReadings.length > 0) {
      speechText += '먼저 각 카드를 살펴보겠습니다. ';

      interpretation.positionReadings.forEach((reading, index) => {
        speechText += `${reading.position}번째 위치는 ${reading.cardName} 카드입니다. `;
        speechText += `${reading.interpretation} `;

        // Natural pause between cards
        if (index < interpretation.positionReadings.length - 1) {
          speechText += '다음 카드로 넘어가겠습니다. ';
        }
      });
    }

    // Overall message
    if (interpretation.overallMessage) {
      speechText += '이제 전체적인 메시지를 말씀드리겠습니다. ';
      speechText += `${interpretation.overallMessage} `;
    }

    // Advice
    if (interpretation.advice) {
      speechText += '마지막으로 조언을 드리겠습니다. ';
      speechText += `${interpretation.advice} `;
    }

    // Closing
    speechText += '리딩을 마치겠습니다. 좋은 하루 되세요.';

    // Clean text for speech
    speechText = this.cleanTextForSpeech(speechText);

    return await this.synthesizeSpeech(speechText);
  }

  /**
   * Clean text for natural speech
   * @param {String} text - Text to clean
   * @returns {String} Cleaned text
   */
  cleanTextForSpeech(text) {
    return (
      text
        // Remove markdown formatting
        .replace(/\*\*/g, '')
        .replace(/#+\s/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
        // Remove emojis
        .replace(/[📖✨💡🎯🔮🌟⭐✅❌⚠️🎨🎭🎪🎬🎤🎧🎵🎶]/g, '')
        // Normalize whitespace
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  /**
   * Clean up old audio files (older than 24 hours)
   */
  cleanupOldAudioFiles() {
    try {
      if (!fs.existsSync(this.audioDir)) {
        return;
      }

      const files = fs.readdirSync(this.audioDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      let deletedCount = 0;

      files.forEach((file) => {
        const filepath = path.join(this.audioDir, file);
        const stats = fs.statSync(filepath);

        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old audio files`);
      }
    } catch (error) {
      logger.error('Audio cleanup error:', { error: error.message });
    }
  }

  /**
   * Get audio file info
   * @param {String} filename - Audio filename
   * @returns {Object} File info (exists, size, age)
   */
  getAudioFileInfo(filename) {
    const filepath = path.join(this.audioDir, filename);

    if (!fs.existsSync(filepath)) {
      return { exists: false };
    }

    const stats = fs.statSync(filepath);
    const ageMs = Date.now() - stats.mtimeMs;

    return {
      exists: true,
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      ageHours: (ageMs / (1000 * 60 * 60)).toFixed(1),
      created: stats.mtime,
    };
  }
}

module.exports = new VoiceService();
