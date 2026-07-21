'use client';

import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Plus,
  Minimize2,
  Maximize2,
  RefreshCw,
  Zap,
  PenTool,
  Scale,
  BookOpen,
  CheckCircle2,
  Package,
  Mic,
  Paperclip,
  Send,
  History,
  Copy,
  FileText,
  Download,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Shield,
  TrendingUp,
  FileCheck,
  Search,
  Filter,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Petition } from '@/types/petition';

// Types
type TabType = 'quick' | 'writing' | 'legal' | 'precedent' | 'control' | 'final';

interface QuickAction {
  id: string;
  icon: any;
  title: string;
  description: string;
  action: () => void;
}

interface WritingCommand {
  id: string;
  title: string;
  action: () => void;
}

interface LegalAction {
  id: string;
  icon: any;
  title: string;
  description: string;
  action: () => void;
}

interface PrecedentFilter {
  court: string;
  timeRange: string;
  sortBy: string;
}

interface Precedent {
  id: string;
  title: string;
  court: string;
  date: string;
  summary: string;
}

interface QualityMetric {
  label: string;
  score: number;
  icon: any;
  color: string;
}

interface AIResponse {
  id: string;
  content: string;
  type: 'suggestion' | 'correction' | 'analysis' | 'generation';
  timestamp: Date;
}

interface PetitionAIPanelProps {
  petition?: Petition;
  selectedText?: string;
  onApplyToDocument?: (content: string, position?: 'replace' | 'append' | 'insert') => void;
}

export function PetitionAIPanel({ petition, selectedText, onApplyToDocument }: PetitionAIPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('quick');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [showPromptHistory, setShowPromptHistory] = useState(false);
  const [qualityScore, setQualityScore] = useState(78);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Quick Actions
  const quickActions: QuickAction[] = [
    { id: '1', icon: FileText, title: 'Baştan Dilekçe Oluştur', description: 'Yeni dilekçe taslağı hazırla', action: () => {} },
    { id: '2', icon: PenTool, title: 'Seçili Bölümü Yeniden Yaz', description: 'Seçili metni iyileştir', action: () => {} },
    { id: '3', icon: FileCheck, title: 'Dilekçeyi Tamamla', description: 'Eksik kısımları doldur', action: () => {} },
    { id: '4', icon: Sparkles, title: 'Sonuç Bölümünü Yaz', description: 'Talep sonucunu oluştur', action: () => {} },
    { id: '5', icon: Package, title: 'Talep Sonucu Oluştur', description: 'Maddi talepleri belirle', action: () => {} },
    { id: '6', icon: History, title: 'Olay Özeti Oluştur', description: 'Kronolojik özet hazırla', action: () => {} },
    { id: '7', icon: TrendingUp, title: 'Olay Kronolojisi Oluştur', description: 'Zaman çizelgesi oluştur', action: () => {} },
    { id: '8', icon: Scale, title: 'Hukuki Değerlendirme Yaz', description: 'Hukuki analiz yap', action: () => {} },
    { id: '9', icon: Shield, title: 'Savunma Hazırla', description: 'Savunma stratejisi geliştir', action: () => {} },
    { id: '10', icon: AlertCircle, title: 'İstinaf Gerekçesi Oluştur', description: 'İstinaf dilekçesi hazırla', action: () => {} },
    { id: '11', icon: BookOpen, title: 'Temyiz Gerekçesi Oluştur', description: 'Temyiz dilekçesi hazırla', action: () => {} },
  ];

  // Writing Commands
  const writingCommands: WritingCommand[] = [
    { id: '1', title: 'Daha Profesyonel Yaz', action: () => {} },
    { id: '2', title: 'Hukuki Dili Güçlendir', action: () => {} },
    { id: '3', title: 'Resmileştir', action: () => {} },
    { id: '4', title: 'Daha Akıcı Yaz', action: () => {} },
    { id: '5', title: 'Paragrafları Düzenle', action: () => {} },
    { id: '6', title: 'İmla Hatalarını Düzelt', action: () => {} },
    { id: '7', title: 'Yazım Hatalarını Düzelt', action: () => {} },
    { id: '8', title: 'Tekrarları Kaldır', action: () => {} },
    { id: '9', title: 'Kısalt', action: () => {} },
    { id: '10', title: 'Uzat', action: () => {} },
    { id: '11', title: 'Maddeleştir', action: () => {} },
    { id: '12', title: 'Özetle', action: () => {} },
    { id: '13', title: 'Akademik Dile Çevir', action: () => {} },
    { id: '14', title: 'Kurumsal Dile Çevir', action: () => {} },
  ];

  // Legal Actions
  const legalActions: LegalAction[] = [
    { id: '1', icon: BookOpen, title: 'İlgili Kanun Maddelerini Öner', description: 'Uygun kanun maddeleri bul', action: () => {} },
    { id: '2', icon: FileText, title: 'İlgili Yönetmelikleri Öner', description: 'Yönetmelik tespiti yap', action: () => {} },
    { id: '3', icon: Scale, title: 'İlgili Mevzuatı Bul', description: 'Mevzuat araştırması', action: () => {} },
    { id: '4', icon: BookOpen, title: 'İçtihat Öner', description: 'Emsal kararlar bul', action: () => {} },
    { id: '5', icon: Sparkles, title: 'Doktrin Görüşü Öner', description: 'Bilimsel görüşler ara', action: () => {} },
    { id: '6', icon: AlertCircle, title: 'Eksik Hukuki Dayanakları Bul', description: 'Hukuki eksikleri tespit et', action: () => {} },
    { id: '7', icon: FileCheck, title: 'Eksik Talepleri Bul', description: 'Talep eksikliklerini belirle', action: () => {} },
    { id: '8', icon: Shield, title: 'Delilleri Güçlendir', description: 'Delil stratejisi geliştir', action: () => {} },
    { id: '9', icon: TrendingUp, title: 'Savunmayı Güçlendir', description: 'Savunma argümanları üret', action: () => {} },
    { id: '10', icon: AlertCircle, title: 'Karşı Argüman Üret', description: 'Muhtemel itirazları tahmin et', action: () => {} },
    { id: '11', icon: Shield, title: 'Muhtemel Savunmaları Tahmin Et', description: 'Karşı taraf stratejisi', action: () => {} },
    { id: '12', icon: TrendingUp, title: 'İkna Gücünü Artır', description: 'İkna stratejisi geliştir', action: () => {} },
    { id: '13', icon: AlertCircle, title: 'Hukuki Riskleri Analiz Et', description: 'Risk değerlendirmesi yap', action: () => {} },
  ];

  // Quality Metrics
  const qualityMetrics: QualityMetric[] = [
    { label: 'Hukuki Dayanak', score: 85, icon: Scale, color: 'bg-blue-500' },
    { label: 'İkna Gücü', score: 72, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Delil Uyumu', score: 90, icon: FileCheck, color: 'bg-green-500' },
    { label: 'İçtihat Desteği', score: 65, icon: BookOpen, color: 'bg-orange-500' },
    { label: 'Mevzuat Uyumu', score: 88, icon: FileText, color: 'bg-cyan-500' },
    { label: 'Biçim Uygunluğu', score: 95, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Risk Seviyesi', score: 70, icon: AlertCircle, color: 'bg-red-500' },
    { label: 'Genel Kalite', score: 78, icon: Sparkles, color: 'bg-violet-500' },
  ];

  // Favorite Prompts
  const favoritePrompts = [
    'İşveren Savunmasını Çürüt',
    'İçtihat Ekle',
    'Kanun Maddesi Ekle',
    'Manevi Tazminatı Güçlendir',
    'Faiz Talebini Kontrol Et',
    'Zamanaşımı Analizi Yap',
    'HMK Atıflarını Kontrol Et',
    'Karşı Tarafın Savunmalarını Tahmin Et',
    'Talep Sonucunu Güçlendir',
    'Eksik Delilleri Bul',
  ];

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const newResponse: AIResponse = {
        id: Date.now().toString(),
        content: `AI yanıtı: "${prompt}" komutuna göre işlem yapıldı.`,
        type: 'suggestion',
        timestamp: new Date(),
      };
      setResponses([...responses, newResponse]);
      setPrompt('');
      setIsProcessing(false);
    }, 1500);
  };

  const handleNewChat = () => {
    setResponses([]);
    setPrompt('');
  };

  const runQualityAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setQualityScore(Math.floor(Math.random() * 30) + 70);
      setIsAnalyzing(false);
    }, 2000);
  };

  useEffect(() => {
    if (petition) {
      runQualityAnalysis();
    }
  }, [petition]);

  if (isCollapsed) {
    return (
      <div
        className="fixed right-0 top-0 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 z-50 flex flex-col items-center py-4 gap-4 transition-all duration-300"
        style={{ width: '60px' }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="hover:bg-purple-100 dark:hover:bg-purple-900/20"
        >
          <Maximize2 className="w-5 h-5 text-purple-600" />
        </Button>
        <div className="flex-1 flex flex-col items-center gap-3">
          {[
            { tab: 'quick' as TabType, icon: Zap },
            { tab: 'writing' as TabType, icon: PenTool },
            { tab: 'legal' as TabType, icon: Scale },
            { tab: 'precedent' as TabType, icon: BookOpen },
            { tab: 'control' as TabType, icon: CheckCircle2 },
            { tab: 'final' as TabType, icon: Package },
          ].map(({ tab, icon: Icon }) => (
            <Button
              key={tab}
              variant="ghost"
              size="icon"
              onClick={() => {
                setActiveTab(tab);
                setIsCollapsed(false);
              }}
              className={cn(
                'hover:bg-purple-100 dark:hover:bg-purple-900/20',
                activeTab === tab && 'bg-purple-100 dark:bg-purple-900/20 text-purple-600'
              )}
            >
              <Icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed right-0 top-0 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 z-50 flex flex-col shadow-2xl transition-all duration-300"
      style={{ width: '440px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                🤖 LexMind AI
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Dilekçenizi yapay zekâ ile analiz edin, geliştirin ve güçlendirin.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Online</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNewChat} className="hover:bg-purple-100 dark:hover:bg-purple-900/20">
              <RefreshCw className="w-4 h-4 text-purple-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="hover:bg-purple-100 dark:hover:bg-purple-900/20">
              <Minimize2 className="w-4 h-4 text-purple-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as TabType)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start px-4 pt-4 pb-2 bg-transparent border-b border-gray-200/50 dark:border-gray-700/50 h-auto">
          <TabsTrigger value="quick" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/20">
            <Zap className="w-4 h-4 mr-2" />
            Hızlı
          </TabsTrigger>
          <TabsTrigger value="writing" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/20">
            <PenTool className="w-4 h-4 mr-2" />
            Yazım
          </TabsTrigger>
          <TabsTrigger value="legal" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/20">
            <Scale className="w-4 h-4 mr-2" />
            Hukuki
          </TabsTrigger>
          <TabsTrigger value="precedent" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/20">
            <BookOpen className="w-4 h-4 mr-2" />
            İçtihat
          </TabsTrigger>
          <TabsTrigger value="control" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/20">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Kontrol
          </TabsTrigger>
          <TabsTrigger value="final" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/20">
            <Package className="w-4 h-4 mr-2" />
            Son
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Actions Tab */}
          <TabsContent value="quick" className="mt-0 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-left hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <action.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{action.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Writing Tab */}
          <TabsContent value="writing" className="mt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {writingCommands.map((command) => (
                <button
                  key={command.id}
                  onClick={command.action}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all text-left hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{command.title}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Legal Strengthening Tab */}
          <TabsContent value="legal" className="mt-0 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {legalActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-left hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{action.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* Precedents Tab */}
          <TabsContent value="precedent" className="mt-0 space-y-4">
            <PrecedentSearch />
          </TabsContent>

          {/* Control Tab */}
          <TabsContent value="control" className="mt-0 space-y-4">
            <QualityAnalysisCard 
              score={qualityScore} 
              metrics={qualityMetrics}
              isAnalyzing={isAnalyzing}
              onAnalyze={runQualityAnalysis}
            />
          </TabsContent>

          {/* Final Preparation Tab */}
          <TabsContent value="final" className="mt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileText, title: 'PDF Oluştur' },
                { icon: FileText, title: 'Word Oluştur' },
                { icon: FileCheck, title: 'UYAP Formatına Dönüştür' },
                { icon: CheckCircle2, title: 'Elektronik İmzaya Hazırla' },
                { icon: Package, title: 'Kapak Sayfası Oluştur' },
                { icon: FileText, title: 'Ek Listesi Oluştur' },
                { icon: Send, title: 'Mail Taslağı Hazırla' },
                { icon: Package, title: 'Belge Paketini Oluştur' },
              ].map((item, index) => (
                <button
                  key={index}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-left hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white text-center">{item.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
        </div>

        {/* AI Responses */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 max-h-48 overflow-y-auto p-4 space-y-3">
            {responses.map((response) => (
              <div
                key={response.id}
                className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <p className="text-sm text-gray-900 dark:text-white">{response.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Copy className="w-3 h-3 mr-1" />
                    Kopyala
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Dilekçeye Ekle
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <ThumbsDown className="w-3 h-3 mr-1" />
                  </Button>
                </div>
              </div>
            ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI yanıt üretiyor...
            </div>
          )}
        </div>

        {/* Prompt Library */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Hızlı Promptlar</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              Tümünü Gör
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {favoritePrompts.slice(0, 5).map((prompt, index) => (
              <button
                key={index}
                onClick={() => setPrompt(prompt)}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-md text-xs text-gray-700 dark:text-gray-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Command Input */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 space-y-2">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder="AI komutunuzu yazın..."
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              rows={2}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-purple-100 dark:hover:bg-purple-900/20">
                <Mic className="w-4 h-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-purple-100 dark:hover:bg-purple-900/20">
                <Paperclip className="w-4 h-4 text-gray-500" />
              </Button>
              <Button
                onClick={handleSendPrompt}
                disabled={!prompt.trim() || isProcessing}
                size="icon"
                className="h-7 w-7 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Enter ile gönder, Shift+Enter yeni satır</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPromptHistory(!showPromptHistory)}
              className="h-5"
            >
              <History className="w-3 h-3 mr-1" />
              Geçmiş
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

// Precedent Search Component
function PrecedentSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    court: '',
    timeRange: '',
    sortBy: '',
  });

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Kanun maddesi, karar no, anahtar kelime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="w-full"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtreler
        {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
      </Button>

      {showFilters && (
        <div
          className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Mahkeme</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              value={filters.court}
              onChange={(e) => setFilters({ ...filters, court: e.target.value })}
            >
              <option value="">Tümü</option>
              <option value="yargitay">Yargıtay</option>
              <option value="danistay">Danıştay</option>
              <option value="aym">AYM</option>
              <option value="aihm">AİHM</option>
              <option value="bam">BAM</option>
              <option value="ilk_derece">İlk Derece</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Zaman Aralığı</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
            >
              <option value="">Tümü</option>
              <option value="1_year">Son 1 Yıl</option>
              <option value="5_years">Son 5 Yıl</option>
              <option value="latest">En Güncel</option>
              <option value="most_cited">En Çok Atıf Alan</option>
              <option value="similar">Benzer Kararlar</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty State */}
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          İçtihat aramak için yukarıdaki arama kutusunu kullanın
        </p>
      </div>
    </div>
  );
}

// Quality Analysis Card Component
interface QualityAnalysisCardProps {
  score: number;
  metrics: QualityMetric[];
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

function QualityAnalysisCard({ score, metrics, isAnalyzing, onAnalyze }: QualityAnalysisCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Mükemmel';
    if (score >= 75) return 'İyi';
    if (score >= 60) return 'Geliştirilmeli';
    return 'Kritik';
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dilekçe Kalite Analizi</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Son analiz: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="hover:bg-purple-100 dark:hover:bg-purple-900/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analiz ediliyor...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Yeniden Analiz Et
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {isAnalyzing ? (
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
                ) : (
                  score
                )}
              </div>
              <p className={`text-sm font-medium mt-2 ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <metric.icon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{metric.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{metric.score}%</span>
            </div>
            <Progress value={metric.score} className="h-2" />
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI Önerileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            'Bu dilekçede faiz talebi belirtilmemiş.',
            'Kanun maddesi desteği artırılabilir.',
            'Yargıtay kararları eklenebilir.',
            'Delil listesi eksik görünüyor.',
          ].map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700 dark:text-gray-300">{suggestion}</p>
              <Button variant="ghost" size="sm" className="h-6 text-xs ml-auto">
                Düzelt
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
