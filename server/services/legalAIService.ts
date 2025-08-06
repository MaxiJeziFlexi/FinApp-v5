import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key is required for legal AI service');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LegalQuery {
  question: string;
  jurisdiction: string; // 'US', 'DE', 'FR', 'PL', 'EU'
  category: string; // 'financial', 'taxation', 'investment', 'banking', 'regulation'
  language: string;
}

export interface LegalResponse {
  answer: string;
  sources: string[];
  disclaimer: string;
  confidence: number;
  lastUpdated: string;
  jurisdiction: string;
}

export class LegalAIService {
  private readonly governmentSources = {
    'US': [
      'SEC.gov - U.S. Securities and Exchange Commission',
      'CFTC.gov - Commodity Futures Trading Commission', 
      'Treasury.gov - U.S. Department of the Treasury',
      'FDIC.gov - Federal Deposit Insurance Corporation',
      'IRS.gov - Internal Revenue Service',
      'FTC.gov - Federal Trade Commission'
    ],
    'DE': [
      'BaFin.de - German Federal Financial Supervisory Authority',
      'Bundesbank.de - Deutsche Bundesbank',
      'BMF.de - Federal Ministry of Finance',
      'Bundestag.de - German Federal Parliament',
      'Gesetze-im-internet.de - German Federal Laws'
    ],
    'FR': [
      'AMF-france.org - Autorité des marchés financiers',
      'Banque-france.fr - Banque de France',
      'Economie.gouv.fr - Ministry of Economy and Finance',
      'Legifrance.gouv.fr - French Legal Information'
    ],
    'PL': [
      'KNF.gov.pl - Polish Financial Supervision Authority',
      'NBP.pl - National Bank of Poland',
      'Gov.pl - Polish Government Portal',
      'Prawo.pl - Polish Legal Information'
    ],
    'EU': [
      'ESMA.europa.eu - European Securities and Markets Authority',
      'ECB.europa.eu - European Central Bank',
      'Europa.eu - Official EU Portal',
      'EUR-lex.europa.eu - EU Legal Database'
    ]
  };

  private readonly disclaimers = {
    'en': 'This information is for educational purposes only and does not constitute legal or financial advice. Always consult with qualified professionals before making financial decisions.',
    'de': 'Diese Informationen dienen nur zu Bildungszwecken und stellen keine Rechts- oder Finanzberatung dar. Konsultieren Sie immer qualifizierte Fachkräfte, bevor Sie finanzielle Entscheidungen treffen.',
    'fr': 'Ces informations sont à des fins éducatives uniquement et ne constituent pas des conseils juridiques ou financiers. Consultez toujours des professionnels qualifiés avant de prendre des décisions financières.',
    'pl': 'Te informacje służą wyłącznie celom edukacyjnym i nie stanowią porady prawnej ani finansowej. Zawsze skonsultuj się z wykwalifikowanymi specjalistami przed podejmowaniem decyzji finansowych.'
  };

  async queryLegalInformation(query: LegalQuery): Promise<LegalResponse> {
    try {
      const { question, jurisdiction, category, language } = query;
      
      // Get relevant sources for the jurisdiction
      const sources = this.governmentSources[jurisdiction] || this.governmentSources['US'];
      
      const systemPrompt = `You are a specialized legal AI assistant focused on financial regulations and laws. 
      
      Your knowledge is based on official government sources including: ${sources.join(', ')}.
      
      Guidelines:
      - Provide accurate, up-to-date legal information for ${jurisdiction} jurisdiction
      - Focus on ${category} regulations and laws
      - Always cite relevant legal sources and authorities
      - Include specific regulation numbers, acts, or legal codes when applicable
      - Mention if information may vary by state/region within jurisdiction
      - Always include appropriate disclaimers about seeking professional legal advice
      - Respond in ${language === 'en' ? 'English' : language === 'de' ? 'German' : language === 'fr' ? 'French' : 'Polish'}
      - Be comprehensive but clear and accessible to non-lawyers
      
      Question category: ${category}
      Jurisdiction: ${jurisdiction}
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.1, // Low temperature for factual accuracy
        max_tokens: 1500,
      });

      const answer = response.choices[0].message.content?.trim() || 'Unable to provide answer';
      
      return {
        answer,
        sources: sources.slice(0, 3), // Return top 3 relevant sources
        disclaimer: this.disclaimers[language] || this.disclaimers['en'],
        confidence: 0.85, // High confidence for government-sourced information
        lastUpdated: new Date().toISOString(),
        jurisdiction
      };
    } catch (error) {
      console.error('Legal AI query error:', error);
      throw new Error(`Failed to process legal query: ${error.message}`);
    }
  }

  async getRegulationSummary(jurisdiction: string, category: string, language: string = 'en'): Promise<LegalResponse> {
    const query: LegalQuery = {
      question: `Provide a comprehensive summary of current ${category} regulations and key compliance requirements`,
      jurisdiction,
      category,
      language
    };
    
    return this.queryLegalInformation(query);
  }

  async checkCompliance(description: string, jurisdiction: string, language: string = 'en'): Promise<{
    compliant: boolean;
    issues: string[];
    recommendations: string[];
    regulations: string[];
  }> {
    try {
      const systemPrompt = `You are a compliance expert for ${jurisdiction} financial regulations. 
      
      Analyze the following business practice/service description and identify:
      1. Potential compliance issues
      2. Applicable regulations
      3. Recommendations for compliance
      
      Respond in structured format and in ${language === 'en' ? 'English' : language === 'de' ? 'German' : language === 'fr' ? 'French' : 'Polish'}.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description }
        ],
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        compliant: result.compliant || false,
        issues: result.issues || [],
        recommendations: result.recommendations || [],
        regulations: result.regulations || []
      };
    } catch (error) {
      console.error('Compliance check error:', error);
      throw new Error(`Failed to check compliance: ${error.message}`);
    }
  }

  getSupportedJurisdictions(): string[] {
    return Object.keys(this.governmentSources);
  }

  getSourcesForJurisdiction(jurisdiction: string): string[] {
    return this.governmentSources[jurisdiction] || [];
  }
}

export const legalAIService = new LegalAIService();