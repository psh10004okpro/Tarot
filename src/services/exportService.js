const PDFDocument = require('pdfkit');

/**
 * Export Service
 * Handles export of reading history in various formats
 */
class ExportService {
  /**
   * Generate CSV from readings
   */
  generateCSV(readings) {
    const headers = [
      'Date',
      'Question',
      'Category',
      'Spread',
      'Cards',
      'Orientation',
      'Rating',
      'Favorite',
      'Public',
      'Views',
      'Likes',
      'Comments',
    ].join(',');

    const rows = readings.map((reading) => {
      const cards = reading.cardsDrawn
        .map((cd) => `${cd.card?.nameKo || cd.card?.name || 'Unknown'}`)
        .join('; ');

      const orientations = reading.cardsDrawn
        .map((cd) => cd.orientation)
        .join('; ');

      return [
        new Date(reading.createdAt).toLocaleString('ko-KR'),
        `"${reading.question.replace(/"/g, '""')}"`, // Escape quotes
        reading.questionCategory,
        reading.spread?.nameKo || reading.spread?.name || '',
        `"${cards}"`,
        `"${orientations}"`,
        reading.userFeedback?.rating || '',
        reading.isFavorite ? 'Yes' : 'No',
        reading.isPublic ? 'Yes' : 'No',
        reading.viewsCount || 0,
        reading.likesCount || 0,
        reading.commentsCount || 0,
      ].join(',');
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * Generate JSON from readings
   */
  generateJSON(readings) {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalReadings: readings.length,
        readings: readings.map((reading) => ({
          id: reading._id,
          date: reading.createdAt,
          question: reading.question,
          category: reading.questionCategory,
          spread: {
            id: reading.spread?._id,
            name: reading.spread?.name,
            nameKo: reading.spread?.nameKo,
          },
          cards: reading.cardsDrawn.map((cd) => ({
            name: cd.card?.name,
            nameKo: cd.card?.nameKo,
            number: cd.card?.number,
            position: cd.position,
            orientation: cd.orientation,
          })),
          interpretation: {
            overallMessage: reading.aiInterpretation?.overallMessage,
            advice: reading.aiInterpretation?.advice,
          },
          feedback: {
            rating: reading.userFeedback?.rating,
            comment: reading.userFeedback?.comment,
          },
          metadata: {
            isFavorite: reading.isFavorite,
            isPublic: reading.isPublic,
            viewsCount: reading.viewsCount || 0,
            likesCount: reading.likesCount || 0,
            commentsCount: reading.commentsCount || 0,
          },
        })),
      },
      null,
      2
    );
  }

  /**
   * Generate PDF from readings
   */
  async generatePDF(user, readings) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('Unwoldam Tarot - Reading History', { align: 'center' });

        doc.moveDown(0.5);
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`User: ${user.username}`, { align: 'center' });
        doc.text(`Export Date: ${new Date().toLocaleString('ko-KR')}`, {
          align: 'center',
        });
        doc.text(`Total Readings: ${readings.length}`, { align: 'center' });

        doc.moveDown(2);

        // Readings
        readings.forEach((reading, index) => {
          // Check if we need a new page
          if (doc.y > 650) {
            doc.addPage();
          }

          // Reading number
          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(`Reading #${index + 1}`, { underline: true });

          doc.moveDown(0.5);

          // Date and category
          doc
            .fontSize(10)
            .font('Helvetica')
            .text(`Date: ${new Date(reading.createdAt).toLocaleString('ko-KR')}`);
          doc.text(`Category: ${reading.questionCategory}`);
          doc.text(`Spread: ${reading.spread?.nameKo || reading.spread?.name || 'Unknown'}`);

          doc.moveDown(0.5);

          // Question
          doc.font('Helvetica-Bold').text('Question:');
          doc.font('Helvetica').text(reading.question, { width: 500 });

          doc.moveDown(0.5);

          // Cards
          doc.font('Helvetica-Bold').text('Cards:');
          reading.cardsDrawn.forEach((cd) => {
            const cardName = cd.card?.nameKo || cd.card?.name || 'Unknown';
            const orientation = cd.orientation === 'upright' ? 'Upright' : 'Reversed';
            doc
              .font('Helvetica')
              .text(`  ${cd.position}. ${cardName} (${orientation})`);
          });

          doc.moveDown(0.5);

          // Overall message (truncated if too long)
          if (reading.aiInterpretation?.overallMessage) {
            doc.font('Helvetica-Bold').text('Overall Message:');
            const message = reading.aiInterpretation.overallMessage;
            const truncated = message.length > 300 ? message.substring(0, 297) + '...' : message;
            doc.font('Helvetica').text(truncated, { width: 500 });
          }

          doc.moveDown(0.5);

          // Metadata
          const metadata = [];
          if (reading.userFeedback?.rating) {
            metadata.push(`Rating: ${'★'.repeat(reading.userFeedback.rating)}`);
          }
          if (reading.isFavorite) metadata.push('⭐ Favorite');
          if (reading.isPublic) {
            metadata.push(
              `Public (${reading.viewsCount || 0} views, ${reading.likesCount || 0} likes)`
            );
          }

          if (metadata.length > 0) {
            doc.fontSize(9).fillColor('#666').text(metadata.join(' | '));
            doc.fillColor('#000');
          }

          doc.moveDown(1.5);
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown(1);
        });

        // Footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc
            .fontSize(8)
            .text(
              `Page ${i + 1} of ${pageCount}`,
              50,
              doc.page.height - 50,
              { align: 'center' }
            );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ExportService();
