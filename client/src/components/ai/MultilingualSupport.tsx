import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Volume2, MessageCircle, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  supported: boolean;
  aiQuality: 'excellent' | 'good' | 'fair';
}

interface TranslationResult {
  original: string;
  translated: string;
  language: string;
  confidence: number;
}

const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', supported: true, aiQuality: 'excellent' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', supported: true, aiQuality: 'excellent' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', supported: true, aiQuality: 'excellent' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', supported: true, aiQuality: 'good' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', supported: true, aiQuality: 'excellent' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', supported: true, aiQuality: 'good' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', supported: true, aiQuality: 'good' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', supported: true, aiQuality: 'fair' }
];

export function MultilingualSupport({ 
  userId,
  currentLanguage = 'en',
  onLanguageChange
}: { 
  userId: string;
  currentLanguage?: string;
  onLanguageChange: (language: string) => void;
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState<TranslationResult[]>([
    {
      original: "Your investment portfolio is performing well this quarter.",
      translated: "Ihr Anlageportfolio entwickelt sich in diesem Quartal gut.",
      language: 'de',
      confidence: 0.95
    },
    {
      original: "Consider increasing your emergency fund to 6 months of expenses.",
      translated: "Envisagez d'augmenter votre fonds d'urgence à 6 mois de dépenses.",
      language: 'fr',
      confidence: 0.92
    }
  ]);

  const { toast } = useToast();

  const handleLanguageChange = async (langCode: string) => {
    setIsTranslating(true);
    
    // Simulate AI translation process
    setTimeout(() => {
      setSelectedLanguage(langCode);
      onLanguageChange(langCode);
      setIsTranslating(false);
      
      const language = supportedLanguages.find(l => l.code === langCode);
      toast({
        title: "Language Updated",
        description: `Interface switched to ${language?.name || langCode}`,
      });
    }, 1500);
  };

  const translateText = async (text: string, targetLang: string) => {
    setIsTranslating(true);
    
    // Simulate translation
    setTimeout(() => {
      const mockTranslations: Record<string, string> = {
        'de': 'Dies ist eine Beispielübersetzung für deutschen Text.',
        'fr': 'Ceci est un exemple de traduction en français.',
        'pl': 'To jest przykład tłumaczenia na język polski.',
        'es': 'Esta es una traducción de ejemplo en español.',
      };
      
      const translated = mockTranslations[targetLang] || text;
      const newTranslation: TranslationResult = {
        original: text,
        translated,
        language: targetLang,
        confidence: Math.random() * 0.1 + 0.9 // 90-100% confidence
      };
      
      setRecentTranslations(prev => [newTranslation, ...prev.slice(0, 4)]);
      setIsTranslating(false);
    }, 2000);
  };

  const getQualityColor = (quality: Language['aiQuality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const currentLang = supportedLanguages.find(l => l.code === selectedLanguage);

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language Settings
          </CardTitle>
          <CardDescription>
            Customize your FinApp experience in your preferred language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Interface Language</label>
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose language" />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        <span className="text-gray-500">({lang.nativeName})</span>
                        {lang.supported && <Check className="h-3 w-3 text-green-600" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isTranslating && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Translating...</span>
              </div>
            )}
          </div>

          {currentLang && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentLang.flag}</span>
                  <div>
                    <h3 className="font-medium">{currentLang.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentLang.nativeName}
                    </p>
                  </div>
                </div>
                <Badge className={getQualityColor(currentLang.aiQuality)}>
                  AI: {currentLang.aiQuality}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Translation Quality */}
      <Card>
        <CardHeader>
          <CardTitle>AI Financial Translation</CardTitle>
          <CardDescription>
            Our AI provides contextually accurate financial translations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedLanguages.filter(l => l.supported).map((lang, index) => (
              <motion.div
                key={lang.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </div>
                  <Badge variant="outline" className={getQualityColor(lang.aiQuality)}>
                    {lang.aiQuality}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Financial terminology accuracy: {
                    lang.aiQuality === 'excellent' ? '95-99%' :
                    lang.aiQuality === 'good' ? '85-94%' : '75-84%'
                  }
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => translateText("Sample financial text", lang.code)}
                  disabled={isTranslating}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Test Translation
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Translations */}
      {recentTranslations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Translations</CardTitle>
            <CardDescription>Examples of contextual financial translations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {recentTranslations.map((translation, index) => {
                  const lang = supportedLanguages.find(l => l.code === translation.language);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span>{lang?.flag}</span>
                        <span className="font-medium text-sm">{lang?.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {(translation.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Original:</p>
                          <p className="text-sm">{translation.original}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Translation:</p>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {translation.translated}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="ghost" className="text-xs">
                          <Volume2 className="h-3 w-3 mr-1" />
                          Listen
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Copy
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Benefits */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="text-green-900 dark:text-green-100">
            Multilingual Financial Intelligence
          </CardTitle>
          <CardDescription>
            Powered by advanced AI for accurate financial communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-800 dark:text-green-200">Key Features:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  Context-aware financial translations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  Real-time AI advisor conversations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  Localized financial education content
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  Cultural financial context adaptation
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Supported Regions:</h4>
              <div className="flex flex-wrap gap-2">
                {supportedLanguages.filter(l => l.supported).map(lang => (
                  <Badge key={lang.code} variant="outline" className="text-xs">
                    {lang.flag} {lang.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}