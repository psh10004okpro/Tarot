/**
 * Tarot Service
 * Business logic for tarot readings and AI interpretation
 */

/**
 * Perform AI-powered tarot reading interpretation
 * @param {Object} spread - The spread document
 * @param {Array} selectedCards - The selected card documents
 * @param {Array} cards - Cards with position and reversed status
 * @param {String} question - User's question
 * @returns {String} AI interpretation
 */
const performTarotReading = async (spread, selectedCards, cards, question) => {
  try {
    // Build the reading context
    const cardDescriptions = cards.map((cardItem, index) => {
      const card = selectedCards[index];
      const position = spread.positions.find(p => p.position === cardItem.position);
      const meaning = cardItem.isReversed ? card.reversedMeaning : card.uprightMeaning;

      return `Position ${cardItem.position} - ${position.name} (${position.nameKo}):
      Card: ${card.name} ${cardItem.isReversed ? '(Reversed)' : '(Upright)'}
      Meaning: ${meaning}
      Keywords: ${card.keywords.join(', ')}`;
    }).join('\n\n');

    const prompt = `You are an experienced tarot reader providing insightful interpretations.

Spread: ${spread.name} (${spread.nameKo})
Description: ${spread.description}

Question: ${question}

Cards drawn:
${cardDescriptions}

Please provide a comprehensive tarot reading that:
1. Interprets each card in the context of its position
2. Explains how the cards relate to each other
3. Provides meaningful guidance addressing the question
4. Uses a warm, insightful, and professional tone
5. Writes in Korean if the question is in Korean, otherwise in English

Keep the interpretation between 300-500 words.`;

    // TODO: Implement actual Anthropic API call in Phase 2
    // For now, return a placeholder interpretation
    const interpretation = `[AI Interpretation Placeholder]

This is a temporary interpretation. In Phase 2, this will be replaced with actual AI-powered interpretation using the Anthropic Claude API.

Question: ${question}
Spread: ${spread.name}
Number of cards: ${cards.length}

Each card's meaning will be analyzed in depth, considering:
- The position's significance in the spread
- Whether the card is upright or reversed
- How the cards interact with each other
- Practical guidance for the querent

The interpretation will be warm, insightful, and tailored to your specific question.`;

    return interpretation;
  } catch (error) {
    console.error('Error in performTarotReading:', error);
    throw new Error('Failed to generate tarot reading interpretation');
  }
};

/**
 * Validate reading request
 * @param {String} spreadId - Spread ID
 * @param {String} question - User's question
 * @returns {Object} Validation result
 */
const validateReadingRequest = (spreadId, question) => {
  const errors = [];

  if (!spreadId) {
    errors.push('Spread ID is required');
  }

  if (!question || question.trim().length === 0) {
    errors.push('Question is required');
  }

  if (question && question.length > 500) {
    errors.push('Question must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  performTarotReading,
  validateReadingRequest,
};
