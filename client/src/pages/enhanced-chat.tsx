import React from 'react';
import EnhancedChatWindow from '@/components/chat/EnhancedChatWindow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function EnhancedChatPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <MessageCircle className="h-8 w-8" />
          Zaawansowany Chat AI
        </h1>
        <p className="text-gray-600">
          Komunikuj się z AI z możliwością wyszukiwania w internecie, generowania raportów i analizy danych.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <EnhancedChatWindow
            userId="demo-user"
            sessionId={`session-${Date.now()}`}
            onMessageSent={(message) => {
              console.log('Message sent:', message);
            }}
          />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Funkcje AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Wyszukiwanie internetowe
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Generowanie raportów
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Analiza finansowa
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Rozpoznawanie mowy
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Eksport do PDF
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dostępne modele</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <div className="font-medium">GPT-4o</div>
                <div className="text-gray-500">Najnowszy model OpenAI</div>
              </div>
              <div>
                <div className="font-medium">GPT-4 Turbo</div>
                <div className="text-gray-500">Szybki i wydajny</div>
              </div>
              <div>
                <div className="font-medium">Claude 3.5 Sonnet</div>
                <div className="text-gray-500">Zaawansowana analiza</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}