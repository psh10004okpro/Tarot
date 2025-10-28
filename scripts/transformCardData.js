/**
 * Card Data Transformation Utility
 * Transforms tarot_cards_en_keys.json data to match the Card model schema
 */

/**
 * Parse card identifier string to extract card details
 * @param {string} cardString - Example: "0. THE FOOL / 바보(광대) / 메이저 아르카나"
 *                              or "ACE of CUPS / 컵에이스 / 마이너 아르카나 / 핍카드"
 * @returns {object} - Parsed card information
 */
function parseCardIdentifier(cardString) {
  const parts = cardString.split('/').map(s => s.trim());

  // Extract English name from first part
  const firstPart = parts[0];
  let number = 0;
  let name = firstPart;

  // Extract Korean name (second part)
  const nameKo = parts[1] || '';

  // Extract arcana type (third part)
  const arcanaText = parts[2] || '';
  let arcana = 'Major';
  let suit = null;

  if (arcanaText.includes('메이저') || arcanaText.includes('Major')) {
    arcana = 'Major';
    // For Major Arcana, extract number from beginning of card name
    const numberMatch = firstPart.match(/^(\d+)\.\s*(.+)$/);
    if (numberMatch) {
      number = parseInt(numberMatch[1], 10);
      name = numberMatch[2].trim();
    }
  } else if (arcanaText.includes('마이너') || arcanaText.includes('Minor')) {
    arcana = 'Minor';

    // Determine suit from Korean or English name
    const lowerName = name.toLowerCase();
    const lowerNameKo = nameKo;

    if (lowerNameKo.includes('완드') || lowerName.includes('wand')) {
      suit = 'Wands';
    } else if (lowerNameKo.includes('컵') || lowerName.includes('cup')) {
      suit = 'Cups';
    } else if (lowerNameKo.includes('소드') || lowerName.includes('sword')) {
      suit = 'Swords';
    } else if (lowerNameKo.includes('펜타클') || lowerNameKo.includes('코인') ||
               lowerName.includes('pentacle') || lowerName.includes('coin')) {
      suit = 'Pentacles';
    }

    // Extract card number/rank from name
    const cardRanks = {
      'ACE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5,
      'SIX': 6,
      'SEVEN': 7,
      'EIGHT': 8,
      'NINE': 9,
      'TEN': 10,
      'PAGE': 11,
      'KNIGHT': 12,
      'QUEEN': 13,
      'KING': 14
    };

    // Check if name starts with a rank
    for (const [rank, num] of Object.entries(cardRanks)) {
      if (name.toUpperCase().startsWith(rank)) {
        number = num;
        break;
      }
    }
  }

  // Generate nameShort (unique identifier)
  let nameShort = '';
  if (arcana === 'Major') {
    nameShort = `AR${number.toString().padStart(2, '0')}`; // AR00, AR01, etc.
  } else {
    const suitPrefix = {
      'Wands': 'WA',
      'Cups': 'CU',
      'Swords': 'SW',
      'Pentacles': 'PE'
    };
    nameShort = `${suitPrefix[suit]}${number.toString().padStart(2, '0')}`;
  }

  return {
    number,
    name,
    nameKo,
    arcana,
    suit,
    nameShort
  };
}

/**
 * Transform a single card from JSON format to model format
 * @param {object} jsonCard - Card data from tarot_cards_en_keys.json
 * @returns {object} - Transformed card data for database
 */
function transformCard(jsonCard) {
  const cardInfo = parseCardIdentifier(jsonCard.card);

  return {
    card: jsonCard.card,
    nameShort: cardInfo.nameShort,
    name: cardInfo.name,
    nameKo: cardInfo.nameKo,
    arcana: cardInfo.arcana,
    suit: cardInfo.suit,
    number: cardInfo.number,
    imageDescription: jsonCard.image_description || '',
    keywords: jsonCard.keywords || [],
    love: jsonCard.love || '',
    relationship: jsonCard.relationship || '',
    finance: jsonCard.finance || '',
    educationCareerBusiness: jsonCard.education_career_business || '',
    reunion: jsonCard.reunion || '',
    contract: jsonCard.contract || '',
    travelMoving: jsonCard.travel_moving || '',
    jobChange: jsonCard.job_change || '',
    health: jsonCard.health || '',
    places: jsonCard.places || '',
    mood: jsonCard.mood || '',
    numerology: jsonCard.numerology || '',
    symbolism: jsonCard.symbolism || '',
    advice: jsonCard.advice || '',
    caution: jsonCard.caution || '',
    isActive: true
  };
}

/**
 * Transform all cards from JSON array
 * @param {array} jsonCards - Array of cards from tarot_cards_en_keys.json
 * @returns {array} - Array of transformed card data
 */
function transformAllCards(jsonCards) {
  return jsonCards.map(transformCard);
}

module.exports = {
  parseCardIdentifier,
  transformCard,
  transformAllCards
};
