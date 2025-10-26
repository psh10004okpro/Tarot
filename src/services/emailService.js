const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service
 * Handles email notifications using Nodemailer
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_FROM || 'Unwoldam Tarot <noreply@unwoldam.com>';
    this.isConfigured = false;

    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  initialize() {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        logger.warn('Email service not configured. Email notifications will be disabled.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      this.isConfigured = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', { error: error.message });
    }
  }

  /**
   * Send email (generic method)
   */
  async sendEmail(to, subject, html, text) {
    if (!this.isConfigured) {
      logger.warn(`Email not sent (not configured): ${subject} to ${to}`);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${subject} to ${to}`, { messageId: info.messageId });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send email: ${subject} to ${to}`, { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user) {
    const subject = '🔮 Unwoldam Tarot에 오신 것을 환영합니다!';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔮 환영합니다!</h1>
            <p>Unwoldam Studio의 AI 타로 리딩 서비스</p>
          </div>
          <div class="content">
            <h2>안녕하세요, ${user.username}님!</h2>
            <p>Unwoldam Tarot에 가입해주셔서 진심으로 감사드립니다.</p>

            <p><strong>무엇을 할 수 있나요?</strong></p>
            <ul>
              <li>🎴 AI 기반 개인화된 타로 리딩</li>
              <li>🎙️ 음성으로 질문하고 답변 받기</li>
              <li>💬 커뮤니티와 리딩 공유하기</li>
              <li>📊 나만의 리딩 히스토리 분석</li>
            </ul>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://tarot-production-e645.up.railway.app'}" class="button">
                첫 리딩 시작하기
              </a>
            </p>

            <p><strong>팁:</strong> 질문은 구체적일수록 더 명확한 해석을 받을 수 있어요!</p>

            <div class="footer">
              <p>행운을 빕니다! 🌟</p>
              <p>Unwoldam Studio</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  /**
   * Send reading completed notification
   */
  async sendReadingCompleteEmail(user, reading) {
    const subject = '🔮 타로 리딩이 완료되었습니다';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .reading-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔮 타로 리딩 완료</h2>
          </div>
          <div class="content">
            <p>안녕하세요, ${user.username}님!</p>
            <p>요청하신 타로 리딩이 완료되었습니다.</p>

            <div class="reading-box">
              <p><strong>질문:</strong> ${reading.question}</p>
              <p><strong>카테고리:</strong> ${reading.questionCategory}</p>
              <p><strong>날짜:</strong> ${new Date(reading.createdAt).toLocaleString('ko-KR')}</p>
            </div>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://tarot-production-e645.up.railway.app'}/readings/${reading._id}" class="button">
                리딩 결과 보기
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  /**
   * Send comment notification
   */
  async sendCommentNotificationEmail(readingOwner, commenter, reading, comment) {
    const subject = '💬 새로운 댓글이 달렸습니다';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .comment-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; padding: 10px 25px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>💬 새 댓글 알림</h2>
          </div>
          <div class="content">
            <p>안녕하세요, ${readingOwner.username}님!</p>
            <p><strong>${commenter.username}</strong>님이 회원님의 리딩에 댓글을 남겼습니다.</p>

            <div class="comment-box">
              <p><strong>리딩:</strong> "${reading.question}"</p>
              <p><strong>댓글:</strong></p>
              <p>"${comment.content}"</p>
            </div>

            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://tarot-production-e645.up.railway.app'}/readings/${reading._id}" class="button">
                댓글 확인하기
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(readingOwner.email, subject, html);
  }

  /**
   * Send like notification
   */
  async sendLikeNotificationEmail(readingOwner, liker, reading) {
    const subject = '❤️ 회원님의 리딩을 좋아합니다';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e94560; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; text-align: center; }
          .button { display: inline-block; padding: 10px 25px; background: #e94560; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>❤️ 좋아요 알림</h2>
          </div>
          <div class="content">
            <p>안녕하세요, ${readingOwner.username}님!</p>
            <p><strong>${liker.username}</strong>님이 회원님의 리딩을 좋아합니다!</p>

            <p style="margin: 20px 0;">
              <strong>"${reading.question}"</strong>
            </p>

            <p style="font-size: 24px; margin: 20px 0;">
              총 ${reading.likesCount}명이 이 리딩을 좋아합니다 ❤️
            </p>

            <p>
              <a href="${process.env.FRONTEND_URL || 'https://tarot-production-e645.up.railway.app'}/readings/${reading._id}" class="button">
                리딩 보기
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(readingOwner.email, subject, html);
  }

  /**
   * Send weekly summary email
   */
  async sendWeeklySummaryEmail(user, stats) {
    const subject = '📊 주간 타로 리딩 요약';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .stat-box { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; text-align: center; }
          .stat-number { font-size: 48px; color: #667eea; font-weight: bold; }
          .stat-label { color: #666; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 주간 요약</h1>
            <p>${new Date().toLocaleDateString('ko-KR')}</p>
          </div>
          <div class="content">
            <p>안녕하세요, ${user.username}님!</p>
            <p>지난 한 주간의 타로 리딩 활동을 정리했습니다.</p>

            <div class="stat-box">
              <div class="stat-number">${stats.totalReadings || 0}</div>
              <div class="stat-label">이번 주 리딩</div>
            </div>

            <div class="stat-box">
              <div class="stat-number">${stats.totalLikes || 0}</div>
              <div class="stat-label">받은 좋아요</div>
            </div>

            <div class="stat-box">
              <div class="stat-number">${stats.totalComments || 0}</div>
              <div class="stat-label">받은 댓글</div>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'https://tarot-production-e645.up.railway.app'}/dashboard" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                대시보드 보기
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();
