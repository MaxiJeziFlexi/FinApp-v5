import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: Array<{
    transaction: any;
    error: string;
  }>;
  duplicatesSkipped?: number;
}

export default function TransactionImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (csvContent: string) => {
      const response = await fetch('/api/budget/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setImporting(false);
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ['budget-performance'] });
      queryClient.invalidateQueries({ queryKey: ['cashflow-prediction'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
    },
    onError: (error) => {
      setResult({
        success: false,
        message: 'Błąd podczas importu: ' + error.message,
        imported: 0,
        errors: []
      });
      setImporting(false);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Proszę wybrać plik CSV');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      importMutation.mutate(csvContent);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = ['date', 'amount', 'description', 'account', 'category'];
    const sampleData = [
      ['2025-08-11', '-50.00', 'Biedronka - zakupy spożywcze', 'Konto główne', 'Groceries'],
      ['2025-08-10', '-12.50', 'McDonald\'s', 'Konto główne', 'Dining Out'],
      ['2025-08-09', '3500.00', 'Wynagrodzenie', 'Konto główne', 'Salary'],
      ['2025-08-08', '-200.00', 'Prąd - sierpień', 'Konto główne', 'Utilities']
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_transakcji.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearResult = () => {
    setResult(null);
    setFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import transakcji z CSV
        </CardTitle>
        <CardDescription>
          Importuj swoje transakcje z pliku CSV. System automatycznie wykryje kategorie i pominie duplikaty.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Download */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div>
            <div className="font-medium text-blue-900 dark:text-blue-100">
              Szablon CSV
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Pobierz przykładowy plik z prawidłowym formatem
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Pobierz szablon
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label htmlFor="csv-file" className="text-sm font-medium">
            Wybierz plik CSV:
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Import Button */}
        {file && !importing && !result && (
          <Button onClick={handleImport} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Importuj transakcje z {file.name}
          </Button>
        )}

        {/* Loading State */}
        {importing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>Importowanie transakcji...</span>
            </div>
            <Progress value={50} className="w-full" />
          </div>
        )}

        {/* Import Result */}
        {result && (
          <div className="space-y-3">
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                  </AlertDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={clearResult}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Alert>

            {result.success && result.imported > 0 && (
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{result.imported}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Zaimportowano</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{result.duplicatesSkipped || 0}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Pominięto duplikaty</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Błędy</div>
                </div>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-red-600">Błędy importu:</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {result.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-2 border-red-400">
                      <div className="font-medium text-red-800 dark:text-red-200">
                        Wiersz {index + 2}: {error.error}
                      </div>
                      <div className="text-red-600 dark:text-red-300">
                        {JSON.stringify(error.transaction)}
                      </div>
                    </div>
                  ))}
                  {result.errors.length > 5 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      ... i {result.errors.length - 5} więcej błędów
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Usage Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div className="font-medium">Format pliku CSV:</div>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>date</strong> - Data transakcji (RRRR-MM-DD lub DD.MM.RRRR)</li>
            <li><strong>amount</strong> - Kwota (liczby ujemne to wydatki)</li>
            <li><strong>description</strong> - Opis transakcji</li>
            <li><strong>account</strong> - Nazwa konta (opcjonalne)</li>
            <li><strong>category</strong> - Kategoria (opcjonalne, system wykryje automatycznie)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}