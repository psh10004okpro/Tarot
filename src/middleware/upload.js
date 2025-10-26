const multer = require('multer');
const path = require('path');

/**
 * File Upload Middleware
 * Handles audio file uploads for voice features
 */

// Use memory storage (process as buffer)
const storage = multer.memoryStorage();

// File filter (audio only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /wav|mp3|m4a|ogg|webm|flac|aac/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('audio/');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        '오디오 파일만 업로드 가능합니다 (.wav, .mp3, .m4a, .ogg, .webm, .flac, .aac)'
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB (Whisper API limit)
  },
  fileFilter: fileFilter,
});

module.exports = upload;
