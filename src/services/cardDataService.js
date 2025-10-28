const fs = require('fs');
const path = require('path');
const { transformAllCards } = require('../../scripts/transformCardData');

/**
 * Card Data Service
 * Provides in-memory card data without database dependency
 */
class CardDataService {
  constructor() {
    this.cards = [];
    this.loadCards();
  }

  /**
   * Load cards from JSON file
   */
  loadCards() {
    try {
      const rawData = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '../../data/tarot_cards_en_keys.json'),
          'utf-8'
        )
      );
      this.cards = transformAllCards(rawData);
      console.log(`✅ Loaded ${this.cards.length} tarot cards from JSON`);
    } catch (error) {
      console.error('Error loading cards:', error);
      this.cards = [];
    }
  }

  /**
   * Get all cards
   */
  getAllCards(filter = {}) {
    let filtered = [...this.cards];

    if (filter.suit) {
      filtered = filtered.filter(c => c.suit === filter.suit);
    }
    if (filter.arcana) {
      filtered = filtered.filter(c => c.arcana === filter.arcana);
    }

    return filtered;
  }

  /**
   * Get card by ID (nameShort)
   */
  getCardById(id) {
    return this.cards.find(c => c.nameShort === id || c._id === id);
  }

  /**
   * Search cards
   */
  searchCards(query) {
    const q = query.toLowerCase();
    return this.cards.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nameKo.includes(q) ||
      c.keywords.some(k => k.includes(q))
    );
  }

  /**
   * Get random cards
   */
  getRandomCards(count = 1) {
    const shuffled = [...this.cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

module.exports = new CardDataService();
