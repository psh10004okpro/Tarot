const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../utils/logger');

/**
 * Claude AI Service
 * Handles AI-powered tarot reading interpretations using Anthropic's Claude
 */

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
    this.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS) || 2000;
    this.temperature = parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7;
    this.maxRetries = 3;
  }

  /**
   * Generate tarot reading interpretation using Claude AI
   * @param {Object} readingData - Complete reading data
   * @returns {Promise<Object>} AI-generated interpretation
   */
  async generateTarotInterpretation(readingData) {
    const { question, category, cards, spread, userProfile } = readingData;

    // Build system prompt based on user profile
    const systemPrompt = this.buildSystemPrompt(userProfile);

    // Build user prompt with reading details
    const userPrompt = this.buildUserPrompt(question, category, cards, spread);

    // Call Claude API with retry logic
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Claude API call attempt ${attempt}/${this.maxRetries}`);

        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });

        // Parse and structure the response
        const interpretation = this.parseResponse(response.content[0].text);

        logger.info('Claude API interpretation generated successfully');

        return {
          fullReading: interpretation.fullReading,
          positionReadings: interpretation.positionReadings,
          overallMessage: interpretation.overallMessage,
          advice: interpretation.advice,
          generatedBy: this.model,
          generatedAt: new Date(),
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        };
      } catch (error) {
        lastError = error;
        logger.error(`Claude API attempt ${attempt} failed:`, {
          error: error.message,
        });

        // Wait before retry (exponential backoff)
        if (attempt < this.maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    // All retries failed - return fallback interpretation
    logger.error('All Claude API retries failed, using fallback interpretation');
    throw new Error('AI 해석 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }

  /**
   * Build system prompt based on user expertise level
   * @param {Object} userProfile - User profile data
   * @returns {String} System prompt
   */
  buildSystemPrompt(userProfile) {
    const expertiseLevel = userProfile?.expertiseLevel || 'beginner';

    const expertiseLevels = {
      beginner: '초보자에게 친근하고 이해하기 쉬운',
      intermediate: '적당한 깊이의 전문적인',
      advanced: '고급 상징과 아케타입을 포함한 심화된',
    };

    return `당신은 30년 경력의 전문 타로 리더입니다.

역할:
- 라이더-웨이트-스미스(Rider-Waite-Smith) 전통을 따르는 타로 전문가
- 심리학과 영적 안내를 결합한 통찰력 있는 해석 제공
- 공감적이고 지지적인 태도 유지

해석 원칙:
1. 카드 상징과 전통적 의미를 정확하게 반영
2. 사용자 질문과 맥락에 맞춰 개인화
3. 원소(불, 물, 공기, 흙) 상호작용 고려
4. 수비학적 패턴 인식
5. 위치별 의미 통합 (스프레드 구조)
6. 정방향/역방향 의미 구분

언어 스타일:
- 한국어로 작성
- ${expertiseLevels[expertiseLevel]} 언어 사용
- 부드럽고 긍정적인 톤 (하지만 현실적)
- 결정론적 예측 피하기 - 대신 가능성과 조언 제시
- 역량 강화(empowerment) 언어 사용

금지사항:
- 절대적인 미래 예측 ("당신은 반드시 ~할 것입니다")
- 두려움을 조장하는 표현
- 의학적/법률적 조언
- 타인의 자유의지 침해 ("그 사람은 당신을 사랑합니다")

출력 형식:
JSON 형식으로 다음 구조를 따르세요:
{
  "positionReadings": [
    {
      "position": 1,
      "cardName": "카드명",
      "interpretation": "이 위치에서의 카드 해석 (2-3문장)..."
    }
  ],
  "overallMessage": "전체 리딩의 핵심 메시지 (3-4문장)...",
  "advice": "실천 가능한 조언 (2-3문장)..."
}`;
  }

  /**
   * Build user prompt with reading details
   * @param {String} question - User's question
   * @param {String} category - Question category
   * @param {Array} cards - Array of drawn cards
   * @param {Object} spread - Spread configuration
   * @returns {String} User prompt
   */
  buildUserPrompt(question, category, cards, spread) {
    let prompt = '타로 리딩을 해석해주세요.\n\n';

    // Question information
    prompt += `**질문 카테고리**: ${this.translateCategory(category)}\n`;
    prompt += `**사용자 질문**: "${question}"\n\n`;

    // Spread information
    prompt += `**스프레드**: ${spread.nameKo} (${spread.name})\n`;
    prompt += `**설명**: ${spread.description}\n`;
    prompt += `**카드 수**: ${spread.cardCount}\n\n`;

    // Cards information
    prompt += `**뽑힌 카드들**:\n\n`;
    cards.forEach((cardData) => {
      const position = spread.positions.find((p) => p.position === cardData.position);

      prompt += `${cardData.position}. **위치**: ${position?.nameKo || position?.name || 'N/A'}\n`;
      prompt += `   **위치 의미**: ${position?.description || 'N/A'}\n`;
      prompt += `   **카드**: ${cardData.card.nameKo} (${cardData.card.name})\n`;
      prompt += `   **방향**: ${cardData.isReversed ? '역방향' : '정방향'}\n`;
      prompt += `   **아르카나**: ${cardData.card.arcana === 'major' ? '메이저' : '마이너'}\n`;

      if (cardData.card.suit && cardData.card.suit !== 'none') {
        const suitKo = {
          wands: '완드',
          cups: '컵',
          swords: '소드',
          pentacles: '펜타클',
        };
        prompt += `   **수트**: ${suitKo[cardData.card.suit] || cardData.card.suit}\n`;
      }

      // Card meanings
      const meanings = cardData.isReversed
        ? cardData.card.meaningReversed
        : cardData.card.meaningUpright;

      if (meanings && meanings.length > 0) {
        prompt += `   **전통적 의미**: ${meanings.join(', ')}\n`;
      }

      // Keywords
      const keywords = cardData.isReversed
        ? cardData.card.keywordsReversed
        : cardData.card.keywordsUpright;

      if (keywords) {
        prompt += `   **키워드**: ${keywords}\n`;
      }

      prompt += '\n';
    });

    prompt += `**요청사항**:\n`;
    prompt += `1. 각 위치의 카드를 해석하되, 위치의 의미와 카드의 의미를 통합하세요.\n`;
    prompt += `2. 카드 간의 상호작용과 패턴을 파악하세요 (원소 조합, 수비학, 상징).\n`;
    prompt += `3. 사용자의 질문에 직접적으로 답하는 전체 메시지를 제공하세요.\n`;
    prompt += `4. 실천 가능하고 긍정적인 조언을 제시하세요.\n`;
    prompt += `5. 반드시 JSON 형식으로만 출력하세요 (마크다운 코드 블록 사용 가능).\n`;

    return prompt;
  }

  /**
   * Translate category to Korean
   * @param {String} category - Category in English
   * @returns {String} Category in Korean
   */
  translateCategory(category) {
    const translations = {
      love: '연애/관계',
      career: '커리어/직업',
      spiritual: '영적 성장',
      health: '건강/웰빙',
      general: '일반/종합',
      finance: '재정/금전',
      family: '가족',
    };
    return translations[category] || category;
  }

  /**
   * Parse Claude's response and extract structured data
   * @param {String} responseText - Raw response from Claude
   * @returns {Object} Parsed interpretation
   */
  parseResponse(responseText) {
    try {
      // Try to extract JSON from markdown code block or plain text
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/) ||
        responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);

        return {
          fullReading: this.generateFullReadingText(parsed),
          positionReadings: parsed.positionReadings || [],
          overallMessage: parsed.overallMessage || '',
          advice: parsed.advice || '',
        };
      }

      // If JSON parsing fails, return the full text as is
      logger.warn('Could not parse JSON from Claude response, using full text');
      return {
        fullReading: responseText,
        positionReadings: [],
        overallMessage: responseText,
        advice: '',
      };
    } catch (error) {
      logger.error('Error parsing Claude response:', { error: error.message });
      return {
        fullReading: responseText,
        positionReadings: [],
        overallMessage: responseText,
        advice: '',
      };
    }
  }

  /**
   * Generate full reading text from parsed data
   * @param {Object} parsed - Parsed interpretation data
   * @returns {String} Formatted full reading text
   */
  generateFullReadingText(parsed) {
    let fullText = '';

    // Position-by-position readings
    if (parsed.positionReadings && parsed.positionReadings.length > 0) {
      fullText += '📖 **카드별 해석**\n\n';
      parsed.positionReadings.forEach((reading) => {
        fullText += `**${reading.position}. ${reading.cardName}**\n`;
        fullText += `${reading.interpretation}\n\n`;
      });
    }

    // Overall message
    if (parsed.overallMessage) {
      fullText += '✨ **종합 메시지**\n\n';
      fullText += `${parsed.overallMessage}\n\n`;
    }

    // Advice
    if (parsed.advice) {
      fullText += '💡 **조언**\n\n';
      fullText += `${parsed.advice}\n`;
    }

    return fullText;
  }

  /**
   * Generate fallback interpretation when API fails
   * @param {Array} cards - Array of drawn cards
   * @returns {Object} Fallback interpretation
   */
  generateFallbackInterpretation(cards) {
    const positionReadings = cards.map((cardData) => {
      const meanings = cardData.isReversed
        ? cardData.card.meaningReversed
        : cardData.card.meaningUpright;

      return {
        position: cardData.position,
        cardName: cardData.card.nameKo,
        interpretation: `${cardData.card.nameKo}는 ${meanings ? meanings.join(', ') : '변화와 성장'}을 나타냅니다.`,
      };
    });

    return {
      fullReading: this.generateFullReadingText({
        positionReadings,
        overallMessage: '현재 AI 서비스가 일시적으로 이용 불가합니다. 카드의 기본 의미를 참고해주세요.',
        advice: '타로 카드는 가능성을 보여줍니다. 깊이 있는 해석을 원하시면 잠시 후 다시 시도해주세요.',
      }),
      positionReadings,
      overallMessage: '현재 AI 서비스가 일시적으로 이용 불가합니다.',
      advice: '잠시 후 다시 시도해주세요.',
      generatedBy: 'fallback',
      generatedAt: new Date(),
    };
  }

  /**
   * Sleep utility for retry backoff
   * @param {Number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new ClaudeService();
