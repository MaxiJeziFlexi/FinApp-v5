import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileImage, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  X,
  Download,
  Eye,
  Sparkles,
  Brain,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import VisualDataGenerator from './VisualDataGenerator';

interface FileAnalysisUploaderProps {
  onFileAnalyze?: (file: File, analysis: any) => void;
  className?: string;
}

const supportedFileTypes = {
  'image/jpeg': { icon: FileImage, label: 'JPEG Image', color: 'from-blue-500 to-cyan-500' },
  'image/jpg': { icon: FileImage, label: 'JPG Image', color: 'from-blue-500 to-cyan-500' },
  'image/png': { icon: FileImage, label: 'PNG Image', color: 'from-blue-500 to-cyan-500' },
  'application/pdf': { icon: FileText, label: 'PDF Document', color: 'from-red-500 to-orange-500' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, label: 'Excel File', color: 'from-green-500 to-emerald-500' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, label: 'Excel File', color: 'from-green-500 to-emerald-500' },
  'application/vnd.ms-powerpoint': { icon: Presentation, label: 'PowerPoint', color: 'from-purple-500 to-pink-500' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { icon: Presentation, label: 'PowerPoint', color: 'from-purple-500 to-pink-500' },
  'application/msword': { icon: FileText, label: 'Word Document', color: 'from-indigo-500 to-purple-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'Word Document', color: 'from-indigo-500 to-purple-500' },
};

export default function FileAnalysisUploader({ 
  onFileAnalyze,
  className 
}: FileAnalysisUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [showVisualGenerator, setShowVisualGenerator] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  }, [dragActive]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      Object.keys(supportedFileTypes).includes(file.type)
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    setAnalyzing(true);
    
    // Simulate file analysis
    for (const file of files) {
      const mockAnalysis = await simulateFileAnalysis(file);
      setAnalysisResults(prev => [...prev, { file, analysis: mockAnalysis }]);
      onFileAnalyze?.(file, mockAnalysis);
    }
    
    setAnalyzing(false);
    setShowVisualGenerator(true);
  };

  const simulateFileAnalysis = async (file: File): Promise<any> => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const fileType = file.type;
    let analysisData = {};
    
    if (fileType.startsWith('image/')) {
      analysisData = {
        type: 'image',
        insights: [
          '🎨 Dominujące kolory: Niebieski (34%), Zielony (28%), Szary (22%)',
          '📐 Kompozycja: Symetryczna, z wyraźnym punktem centralnym',
          '💡 Obiektów wykrytych: 5 (budynki, drzewa, niebo)',
          '📊 Jasność: 65% średnia, kontrastowość wysoka',
          '🎯 Emocjonalny wydźwięk: Spokojny, profesjonalny'
        ],
        visualData: {
          charts: ['Histogram kolorów', 'Analiza kompozycji', 'Mapa obiektów'],
          metrics: { clarity: 0.85, composition: 0.78, appeal: 0.92 }
        }
      };
    } else if (fileType === 'application/pdf') {
      analysisData = {
        type: 'pdf',
        insights: [
          '📄 Strony: 12, Słowa: 3,847',
          '📈 Wykresy/tabele: 5 wykresów finansowych',
          '🎯 Kluczowe tematy: Analiza ROI, Budget Planning, Risk Assessment',
          '💼 Ton dokumentu: Profesjonalny, analityczny',
          '📊 Dane numeryczne: 127 wartości finansowych'
        ],
        visualData: {
          charts: ['Trend Analysis', 'Budget Breakdown', 'Risk Matrix'],
          metrics: { readability: 0.89, completeness: 0.95, accuracy: 0.92 }
        }
      };
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      analysisData = {
        type: 'excel',
        insights: [
          '📊 Arkusze: 4 (Dashboard, Data, Analysis, Summary)',
          '🔢 Wiersze danych: 2,847 rekordów',
          '📈 Formuły: 89 funkcji Excel (VLOOKUP, SUMIF, INDEX)',
          '💰 Wartości finansowe: $2.4M total revenue',
          '🎯 KPI Metrics: 12 kluczowych wskaźników'
        ],
        visualData: {
          charts: ['Revenue Trends', 'Cost Analysis', 'Performance Dashboard'],
          metrics: { accuracy: 0.96, completeness: 0.91, consistency: 0.88 }
        }
      };
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      analysisData = {
        type: 'powerpoint',
        insights: [
          '🎭 Slajdy: 24 slajdy prezentacyjne',
          '📊 Wykresy: 8 wykresów i diagramów',
          '🎨 Design: Spójny branding, profesjonalny layout',
          '💡 Key Messages: 6 głównych punktów strategicznych',
          '🎯 Audience Level: Executive/C-Suite presentation'
        ],
        visualData: {
          charts: ['Message Flow', 'Visual Impact', 'Content Structure'],
          metrics: { clarity: 0.93, engagement: 0.87, professionalism: 0.95 }
        }
      };
    } else {
      analysisData = {
        type: 'document',
        insights: [
          '📝 Słowa: 4,123 words',
          '📄 Paragrafy: 67 structured sections',
          '🎯 Readability: Professional level',
          '💼 Document type: Business proposal',
          '📊 Key metrics mentioned: 15 financial indicators'
        ],
        visualData: {
          charts: ['Content Structure', 'Keyword Analysis', 'Readability Score'],
          metrics: { readability: 0.84, structure: 0.91, completeness: 0.88 }
        }
      };
    }

    return analysisData;
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setAnalysisResults(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* File Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative p-8 rounded-3xl border-2 border-dashed transition-all duration-300",
          dragActive 
            ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 shadow-2xl shadow-cyan-500/50" 
            : "border-purple-400/50 bg-gradient-to-br from-slate-900/80 to-indigo-900/80 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />
        
        <div className="text-center">
          <motion.div
            animate={{
              scale: dragActive ? [1, 1.1, 1] : [1, 1.05, 1],
              rotateY: [0, 180, 360],
            }}
            transition={{
              duration: dragActive ? 1 : 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mx-auto mb-6"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/40 border border-purple-400/50 shadow-2xl inline-block">
              <Upload className="w-12 h-12 text-purple-300 drop-shadow-2xl" />
            </div>
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            {dragActive ? 'Drop your files here!' : 'Upload Files for Analysis'}
          </h3>
          <p className="text-purple-200/80 mb-4">
            Support: JPG, PNG, PDF, Excel, Word, PowerPoint
          </p>
          
          <Button
            asChild
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose Files
            </label>
          </Button>
        </div>
      </motion.div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          {uploadedFiles.map((file, index) => {
            const fileConfig = supportedFileTypes[file.type as keyof typeof supportedFileTypes];
            const Icon = fileConfig?.icon || FileText;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-indigo-900/50 border border-indigo-400/30 shadow-lg"
              >
                <div className={cn("p-2 rounded-lg bg-gradient-to-r", fileConfig?.color || 'from-gray-500 to-gray-600')}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-gray-300">
                    {fileConfig?.label || 'Unknown'} • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                {analyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Visual Data Generator */}
      {showVisualGenerator && (
        <VisualDataGenerator
          analysisData={analysisResults}
          isGenerating={analyzing}
          fileType={uploadedFiles[0]?.type.startsWith('image/') ? 'image' : 'pdf'}
        />
      )}

      {/* Analysis Results */}
      {analysisResults.length > 0 && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h4 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-400" />
            Analysis Results
          </h4>
          
          {analysisResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/60 to-teal-900/60 border border-emerald-400/40 shadow-xl backdrop-blur-sm"
            >
              <h5 className="text-lg font-bold text-emerald-100 mb-4">
                📁 {result.file.name}
              </h5>
              
              <div className="grid gap-3">
                {result.analysis.insights.map((insight: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-emerald-800/30 border border-emerald-600/30"
                  >
                    <Eye className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                    <p className="text-emerald-100 text-sm">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}