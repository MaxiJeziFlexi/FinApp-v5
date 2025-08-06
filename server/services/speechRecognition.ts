// This file provides server-side utilities for speech recognition
// The actual speech recognition will be implemented on the frontend using Web Speech API

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class SpeechRecognitionService {
  static getDefaultOptions(): SpeechRecognitionOptions {
    return {
      language: 'en-US',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1
    };
  }

  static validateTranscript(transcript: string): boolean {
    if (!transcript || typeof transcript !== 'string') {
      return false;
    }

    // Remove extra whitespace and check if meaningful content exists
    const cleaned = transcript.trim();
    return cleaned.length >= 2 && cleaned.length <= 500;
  }

  static cleanTranscript(transcript: string): string {
    if (!transcript) return '';
    
    return transcript
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?]/g, '') // Remove special characters except basic punctuation
      .slice(0, 500); // Limit length
  }

  static formatForChat(transcript: string): string {
    const cleaned = this.cleanTranscript(transcript);
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return cleaned;
  }

  static getSupportedLanguages(): string[] {
    return [
      'en-US', // English (United States)
      'en-GB', // English (United Kingdom)
      'es-ES', // Spanish (Spain)
      'es-MX', // Spanish (Mexico)
      'fr-FR', // French (France)
      'de-DE', // German (Germany)
      'it-IT', // Italian (Italy)
      'pt-BR', // Portuguese (Brazil)
      'zh-CN', // Chinese (Mandarin)
      'ja-JP', // Japanese
      'ko-KR', // Korean
      'ru-RU', // Russian
      'ar-SA', // Arabic (Saudi Arabia)
      'hi-IN'  // Hindi (India)
    ];
  }

  static isLanguageSupported(language: string): boolean {
    return this.getSupportedLanguages().includes(language);
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
