const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Storage Service
 * Abstraction layer for file storage (local, S3, GCS, etc.)
 * Makes the application portable across different cloud providers
 */

class StorageService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'local';
    this.localPath = path.join(__dirname, '../../public/audio');

    // Initialize based on provider
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'local':
        this.initializeLocal();
        break;
      case 's3':
        this.initializeS3();
        break;
      case 'gcs':
        this.initializeGCS();
        break;
      default:
        logger.warn(`Unknown storage provider: ${this.provider}, defaulting to local`);
        this.provider = 'local';
        this.initializeLocal();
    }

    logger.info(`Storage provider initialized: ${this.provider}`);
  }

  initializeLocal() {
    // Ensure local directory exists
    if (!fs.existsSync(this.localPath)) {
      fs.mkdirSync(this.localPath, { recursive: true });
      logger.info('Created local audio directory');
    }
  }

  initializeS3() {
    // Future: AWS S3 integration
    // const AWS = require('aws-sdk');
    // this.s3 = new AWS.S3({
    //   region: process.env.AWS_REGION,
    //   credentials: {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //   }
    // });
    // this.bucket = process.env.S3_BUCKET;
    logger.info('S3 storage provider ready');
  }

  initializeGCS() {
    // Future: Google Cloud Storage integration
    // const { Storage } = require('@google-cloud/storage');
    // this.gcs = new Storage({
    //   projectId: process.env.GCP_PROJECT_ID,
    //   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    // });
    // this.bucket = this.gcs.bucket(process.env.GCS_BUCKET);
    logger.info('GCS storage provider ready');
  }

  /**
   * Save file to storage
   * @param {Buffer} buffer - File buffer
   * @param {String} filename - File name
   * @returns {Promise<String>} Public URL
   */
  async saveFile(buffer, filename) {
    try {
      switch (this.provider) {
        case 'local':
          return await this.saveToLocal(buffer, filename);
        case 's3':
          return await this.saveToS3(buffer, filename);
        case 'gcs':
          return await this.saveToGCS(buffer, filename);
        default:
          throw new Error(`Unsupported storage provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error('File save error:', { error: error.message, filename });
      throw error;
    }
  }

  /**
   * Save to local filesystem
   */
  async saveToLocal(buffer, filename) {
    const filepath = path.join(this.localPath, filename);
    fs.writeFileSync(filepath, buffer);
    logger.info(`File saved locally: ${filename}`);
    return `/audio/${filename}`;
  }

  /**
   * Save to AWS S3
   */
  async saveToS3(buffer, filename) {
    // Future implementation
    // const params = {
    //   Bucket: this.bucket,
    //   Key: `audio/${filename}`,
    //   Body: buffer,
    //   ContentType: 'audio/mpeg',
    //   ACL: 'public-read',
    // };
    //
    // await this.s3.upload(params).promise();
    // return `https://${this.bucket}.s3.amazonaws.com/audio/${filename}`;

    // Fallback to local for now
    logger.warn('S3 not fully implemented, using local storage');
    return await this.saveToLocal(buffer, filename);
  }

  /**
   * Save to Google Cloud Storage
   */
  async saveToGCS(buffer, filename) {
    // Future implementation
    // const file = this.bucket.file(`audio/${filename}`);
    // await file.save(buffer, {
    //   contentType: 'audio/mpeg',
    //   public: true,
    // });
    // return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/audio/${filename}`;

    // Fallback to local for now
    logger.warn('GCS not fully implemented, using local storage');
    return await this.saveToLocal(buffer, filename);
  }

  /**
   * Delete file from storage
   * @param {String} filename - File name
   */
  async deleteFile(filename) {
    try {
      switch (this.provider) {
        case 'local':
          return await this.deleteFromLocal(filename);
        case 's3':
          return await this.deleteFromS3(filename);
        case 'gcs':
          return await this.deleteFromGCS(filename);
        default:
          throw new Error(`Unsupported storage provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error('File delete error:', { error: error.message, filename });
      throw error;
    }
  }

  async deleteFromLocal(filename) {
    const filepath = path.join(this.localPath, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      logger.info(`File deleted locally: ${filename}`);
    }
  }

  async deleteFromS3(filename) {
    // Future: S3 delete implementation
    logger.warn('S3 delete not implemented, using local');
    return await this.deleteFromLocal(filename);
  }

  async deleteFromGCS(filename) {
    // Future: GCS delete implementation
    logger.warn('GCS delete not implemented, using local');
    return await this.deleteFromLocal(filename);
  }

  /**
   * Clean up old files
   * @param {Number} maxAgeMs - Maximum age in milliseconds
   */
  async cleanupOldFiles(maxAgeMs = 24 * 60 * 60 * 1000) {
    try {
      if (this.provider !== 'local') {
        logger.info('Cleanup only supported for local storage currently');
        return;
      }

      if (!fs.existsSync(this.localPath)) {
        return;
      }

      const files = fs.readdirSync(this.localPath);
      const now = Date.now();
      let deletedCount = 0;

      files.forEach((file) => {
        const filepath = path.join(this.localPath, file);
        const stats = fs.statSync(filepath);

        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      });

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old audio files`);
      }
    } catch (error) {
      logger.error('Cleanup error:', { error: error.message });
    }
  }

  /**
   * Get file info
   * @param {String} filename - File name
   * @returns {Object} File information
   */
  getFileInfo(filename) {
    if (this.provider !== 'local') {
      return { exists: false, provider: this.provider };
    }

    const filepath = path.join(this.localPath, filename);

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
      provider: this.provider,
    };
  }
}

module.exports = new StorageService();
