import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key is required for translation service');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranslationRequest {
  text: string;
  fromLanguage: string;
  toLanguage: string;
  context?: string;
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number;
  fromLanguage: string;
  toLanguage: string;
}

export class TranslationService {
  private supportedLanguages = {
    'en': 'English',
    'de': 'German',
    'fr': 'French',
    'pl': 'Polish'
  };

  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const { text, fromLanguage, toLanguage, context } = request;
      
      // Validate supported languages
      if (!this.supportedLanguages[fromLanguage] || !this.supportedLanguages[toLanguage]) {
        throw new Error('Unsupported language pair');
      }

      const systemPrompt = `You are a professional financial translator specializing in financial education content. 
      Translate the following text from ${this.supportedLanguages[fromLanguage]} to ${this.supportedLanguages[toLanguage]}.
      
      Context: ${context || 'Financial education application'}
      
      Requirements:
      - Maintain financial terminology accuracy
      - Preserve the professional tone
      - Keep the same formatting and structure
      - Use appropriate financial terms for the target language
      - Respond only with the translated text, no explanations
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.1, // Low temperature for consistent translations
        max_tokens: Math.max(text.length * 2, 500), // Ensure enough tokens
      });

      const translatedText = response.choices[0].message.content?.trim() || text;

      return {
        translatedText,
        confidence: 0.95, // High confidence for GPT-4o translations
        fromLanguage,
        toLanguage
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Failed to translate text: ${error.message}`);
    }
  }

  async translateBulk(texts: string[], fromLanguage: string, toLanguage: string, context?: string): Promise<string[]> {
    try {
      const translations = await Promise.all(
        texts.map(text => this.translateText({ text, fromLanguage, toLanguage, context }))
      );
      
      return translations.map(t => t.translatedText);
    } catch (error) {
      console.error('Bulk translation error:', error);
      throw error;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Detect the language of the following text. Respond with only the ISO 639-1 language code (en, de, fr, pl, etc.). If uncertain, respond with 'unknown'."
          },
          { role: "user", content: text.substring(0, 500) } // Limit text length for detection
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const detectedLang = response.choices[0].message.content?.trim().toLowerCase() || 'unknown';
      
      // Validate detected language is supported
      return this.supportedLanguages[detectedLang] ? detectedLang : 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }

  getSupportedLanguages(): { [key: string]: string } {
    return { ...this.supportedLanguages };
  }

  isLanguageSupported(languageCode: string): boolean {
    return !!this.supportedLanguages[languageCode];
  }
}

export const translationService = new TranslationService();