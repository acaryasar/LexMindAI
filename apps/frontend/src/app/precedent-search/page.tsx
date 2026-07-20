'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Clock,
  Bookmark,
  Plus,
  Brain,
  Sparkles,
  FileText,
  Scale,
  Calendar,
  Target,
  TrendingUp,
  Filter,
  ChevronRight,
  Download,
  Save,
  MessageSquare,
  Star,
  X,
  Bell,
  User,
  History,
  Pin,
  Trash2,
  Share2,
  FolderOpen,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Lightbulb,
  Zap,
  ArrowRight,
  RefreshCw,
  Settings,
} from 'lucide-react';

export default function PrecedentSearchPage() {
  const [activeTab, setActiveTab] = useState('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const tabs = [
    { id: 'ai', label: 'AI Arama', icon: Brain },
    { id: 'keyword', label: 'Anahtar Kelime', icon: Search },
    { id: 'similar', label: 'Emsal Karar', icon: Scale },
    { id: 'advanced', label: 'Gelişmiş', icon: Filter },
  ];

  const searchHistory = [
    {
      id: 1,
      query: 'Tazminat davasında faiz hesabı',
      date: '2024-07-19',
      filters: { court: 'Yargıtay', department: '1. Hukuk Dairesi' },
      summary: 'İş kazası tazminatında faiz hesabı',
      isPinned: true,
    },
    {
      id: 2,
      query: 'Boşanma davası mal paylaşımı',
      date: '2024-07-18',
      filters: { court: 'Bölge Adliye', department: '1. Hukuk Dairesi' },
      summary: 'Edinilmiş malın tasfiyesi',
      isPinned: false,
    },
    {
      id: 3,
      query: 'İdari yargı yürütmenin durdurulması',
      date: '2024-07-17',
      filters: { court: 'Danıştay', department: '6. Daire' },
      summary: 'Açıkça hukuka aykırı işlemler',
      isPinned: false,
    },
  ];

  const savedSearches = [
    {
      id: 1,
      name: 'Tazminat Faiz Aramaları',
      folder: 'İş Davaları',
      isShared: true,
      createdAt: '2024-07-15',
    },
    {
      id: 2,
      name: 'Boşanma Mal Paylaşımı',
      folder: 'Aile Hukuku',
      isShared: false,
      createdAt: '2024-07-10',
    },
  ];

  const sampleResults = [
    {
      id: 1,
      court: 'Yargıtay 1. Hukuk Dairesi',
      decisionDate: '2024-03-15',
      decisionNumber: '2024/1234',
      caseNumber: '2023/4567',
      similarityScore: 94,
      aiConfidence: 96,
      title: 'Tazminat davasında faiz hesabı',
      summary: 'Dava, iş kazası sonucu oluşan maddi tazminat talebi kapsamında açılmıştır. Mahkeme, faiz hesabının olay tarihinden itibaren uygulanması gerektiğine hükmetmiştir.',
      legalConcepts: ['Faiz Hesabı', 'Tazminat', 'İş Kazası'],
      referencedArticles: ['BK. 125', 'BK. 141'],
      referencedLaws: ['Borçlar Kanunu', 'İş Kanunu'],
      referencedDecisions: ['Yargıtay 2022/8901'],
    },
    {
      id: 2,
      court: 'Danıştay 6. Dairesi',
      decisionDate: '2024-02-20',
      decisionNumber: '2024/5678',
      caseNumber: '2023/8901',
      similarityScore: 89,
      aiConfidence: 92,
      title: 'İdari yargıda yürütmenin durdurulması',
      summary: 'Dava, idari işlemin iptali ve yürütmenin durdurulması talebiyle açılmıştır. Danıştay, açıkça hukuka aykırı işlemlerde yürütmenin durdurulması kararı vermiştir.',
      legalConcepts: ['Yürütmenin Durdurulması', 'İdari Yargı', 'İptal Davası'],
      referencedArticles: ['İYK. 27', 'İYK. 28'],
      referencedLaws: ['İdari Yargılama Usulü Kanunu'],
      referencedDecisions: ['Danıştay 2021/3456'],
    },
    {
      id: 3,
      court: 'İstanbul Bölge Adliye Mahkemesi 1. Hukuk Dairesi',
      decisionDate: '2024-01-10',
      decisionNumber: '2024/3456',
      caseNumber: '2023/2345',
      similarityScore: 85,
      aiConfidence: 88,
      title: 'Boşanma davasında mal paylaşımı',
      summary: 'Dava, mal rejiminin tasfiyesi talebiyle açılmıştır. Bölge Adliye Mahkemesi, edinilmiş malın değerinin belirlenmesi için bilirkişi incelemesi gerektiğine hükmetmiştir.',
      legalConcepts: ['Mal Paylaşımı', 'Edinilmiş Mal', 'Bilirkişi'],
      referencedArticles: ['TMK. 192', 'TMK. 225'],
      referencedLaws: ['Türk Medeni Kanunu'],
      referencedDecisions: ['Yargıtay 2020/1234'],
    },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate AI search process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSearchResults(sampleResults);
    setIsSearching(false);
  };

  const handleNewSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSelectedResult(null);
  };

  const handleViewFullDecision = (result: any) => {
    console.log('View full decision:', result.id);
  };

  const handleAIAnalysis = (result: any) => {
    setSelectedResult(result);
    setShowAIPanel(true);
  };

  const handleCompare = (result: any) => {
    console.log('Compare decision:', result.id);
  };

  const handleSave = (result: any) => {
    console.log('Save decision:', result.id);
  };

  const handleOpenPDF = (result: any) => {
    console.log('Open PDF:', result.id);
  };

  const aiPrompts = [
    { icon: Lightbulb, text: 'Bu kararı açıkla' },
    { icon: Scale, text: 'Zıt kararları bul' },
    { icon: Target, text: 'Daha güçlü emsaller ara' },
    { icon: User, text: 'Müvekkilim için özetle' },
    { icon: FileText, text: 'Hukuki görüş oluştur' },
    { icon: Zap, text: 'Dava stratejisi geliştir' },
    { icon: Search, text: 'Uygulanacak mevzuatı bul' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                İçtihat Arama
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                AI destekli içtihat araştırması
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryDrawer(true)}
                className="flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>Arama Geçmişi</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavedModal(true)}
                className="flex items-center space-x-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>Kaydedilenler</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewSearch}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Arama</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-8">
            {/* Search Card */}
            <Card className="mb-8 shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                {/* Tabs */}
                <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#5B4BFF] text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative mb-6">
                  <Input
                    type="text"
                    placeholder="Uyuşmazlığı veya hukuki probleminizi doğal dilde yazın..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full h-16 pl-6 pr-16 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-[#5B4BFF] dark:focus:border-[#5B4BFF]"
                    disabled={isSearching}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-6 bg-[#5B4BFF] hover:bg-[#4A3BE8] disabled:opacity-50"
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    <span className="font-medium">
                      {isSearching ? 'Aranıyor...' : 'AI ile Ara'}
                    </span>
                  </Button>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mahkeme</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option>Tüm Mahkemeler</option>
                      <option>Yargıtay</option>
                      <option>Danıştay</option>
                      <option>Bölge Adliye Mahkemesi</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daire</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option>Tüm Daireler</option>
                      <option>1. Hukuk Dairesi</option>
                      <option>2. Hukuk Dairesi</option>
                      <option>6. Daire</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Karar Türü</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option>Tüm Kararlar</option>
                      <option>Onama</option>
                      <option>Bozma</option>
                      <option>Düzeltme</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tarih Aralığı</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option>Tüm Zamanlar</option>
                      <option>Son 1 Yıl</option>
                      <option>Son 3 Yıl</option>
                      <option>Son 5 Yıl</option>
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filtreleri Uygula</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Sıfırla</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Filtre Setini Kaydet</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isSearching && (
              <Card className="mb-8 shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-12 h-12 text-[#5B4BFF] animate-spin mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    AI Analiz Yapılıyor...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hukuki bağlam analiz ediliyor, vektör veritabanında aranıyor...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!hasSearched && !isSearching && (
              <Card className="mb-8 shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#5B4BFF] to-indigo-600 flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Hukuki Sorunuzu AI ile Araştırın
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Uyuşmazlığınızı veya hukuki probleminizi doğal dilde yazın, yapay zeka binlerce mahkeme kararında arama yapsın.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {hasSearched && !isSearching && searchResults.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Arama Sonuçları
                  </h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {searchResults.length} sonuç bulundu
                  </span>
                </div>

                {searchResults.map((result) => (
                  <Card
                    key={result.id}
                    className="shadow-lg border-0 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow"
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="px-3 py-1 bg-[#5B4BFF] text-white text-sm rounded-full font-medium">
                              {result.court}
                            </span>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(result.decisionDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <FileText className="w-4 h-4" />
                              <span>{result.decisionNumber}</span>
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {result.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {result.summary}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              %{result.similarityScore} Benzerlik
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Brain className="w-4 h-4 text-[#5B4BFF]" />
                            <span className="text-sm font-semibold text-[#5B4BFF]">
                              %{result.aiConfidence} AI Güven
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Legal Concepts */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.legalConcepts.map((concept: string) => (
                          <span
                            key={concept}
                            className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-sm rounded-lg"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>

                      {/* References */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Madde:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {result.referencedArticles.join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Kanun:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {result.referencedLaws.join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">İçtihat:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            {result.referencedDecisions.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewFullDecision(result)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Detayı Gör
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAIAnalysis(result)}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          AI Analizi
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCompare(result)}
                        >
                          <Scale className="w-4 h-4 mr-2" />
                          Karşılaştır
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSave(result)}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Kaydet
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOpenPDF(result)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results State */}
            {hasSearched && !isSearching && searchResults.length === 0 && (
              <Card className="mb-8 shadow-lg border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Sonuç Bulunamadı
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Arama kriterlerinize uygun sonuç bulunamadı.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      • Daha geniş anahtar kelimeler deneyin
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      • Filtreleri azaltın
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      • AI ile aramayı deneyin
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      • Benzer konuları inceleyin
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 p-8 space-y-6">
            {/* Analytics Card */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Analitik</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Sonuç</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {searchResults.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ortalama Benzerlik</span>
                  <span className="font-semibold text-green-600">
                    {searchResults.length > 0
                      ? Math.round(searchResults.reduce((acc, r) => acc + r.similarityScore, 0) / searchResults.length)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ortalama AI Güven</span>
                  <span className="font-semibold text-[#5B4BFF]">
                    {searchResults.length > 0
                      ? Math.round(searchResults.reduce((acc, r) => acc + r.aiConfidence, 0) / searchResults.length)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Referans Kanun</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {searchResults.length > 0 ? searchResults.length * 2 : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">En Sık Mahkeme</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Yargıtay
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Filters Card */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filtreler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tarih
                  </label>
                  <input
                    type="range"
                    className="w-full accent-[#5B4BFF]"
                    min="0"
                    max="100"
                    defaultValue="50"
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>2020</span>
                    <span>2024</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mahkeme Türü
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-[#5B4BFF]" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Yargıtay</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-[#5B4BFF]" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Danıştay</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-[#5B4BFF]" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Bölge Adliye</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Benzerlik %
                  </label>
                  <input
                    type="range"
                    className="w-full accent-[#5B4BFF]"
                    min="0"
                    max="100"
                    defaultValue="70"
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Güven
                  </label>
                  <input
                    type="range"
                    className="w-full accent-[#5B4BFF]"
                    min="0"
                    max="100"
                    defaultValue="80"
                  />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search History Drawer */}
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowHistoryDrawer(false)}
            />
            <div className="relative w-96 bg-white dark:bg-gray-800 h-full shadow-2xl overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Arama Geçmişi
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowHistoryDrawer(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {searchHistory.map((item) => (
                  <Card key={item.id} className="shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.query}
                        </h3>
                        {item.isPinned && <Pin className="w-4 h-4 text-[#5B4BFF]" />}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                        <span>{item.filters.court} - {item.filters.department}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Tekrar
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Pin className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Saved Searches Modal */}
        {showSavedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowSavedModal(false)}
            />
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Kaydedilen Aramalar
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowSavedModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {savedSearches.map((item) => (
                  <Card key={item.id} className="shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.folder}
                          </p>
                        </div>
                        {item.isShared && <Share2 className="w-4 h-4 text-[#5B4BFF]" />}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FolderOpen className="w-3 h-3 mr-1" />
                          Aç
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Panel */}
        {showAIPanel && selectedResult && (
          <div className="fixed inset-y-0 right-0 z-50 w-[500px] bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-[#5B4BFF]" />
                  <span>AI Analizi</span>
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowAIPanel(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Karar Özeti</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedResult.summary}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Hukuki Gerekçe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Mahkeme, olayın hukuki niteliğini değerlendirerek, uyuşmazlığın çözümünde ilgili kanun maddelerini ve içtihatları dikkate almıştır.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Hakim Yaklaşımı</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Karar, mümkün olduğunca uzlaşma yollarını değerlendirmiş ve tarafların haklarını dengeli şekilde korumayı amaçlamıştır.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Riskler</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span>Yargıtay bozMası riski bulunmaktadır</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span>Delil yetersizliği durumu olabilir</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Güçlü Yönler</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Kanuni dayanakları güçlüdür</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>İçtihat desteği mevcuttur</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">AI Görüşü</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Bu karar, benzer uyuşmazlıklar için güçlü bir emsal teşkil etmektedir. %96 AI güven skoru ile yüksek güvenilirlik göstermektedir.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Floating AI Assistant */}
        <div className="fixed bottom-8 right-8">
          <Button
            onClick={() => setShowAIPanel(true)}
            className="h-16 px-6 bg-[#5B4BFF] hover:bg-[#4A3BE8] shadow-2xl rounded-full"
          >
            <MessageSquare className="w-6 h-6 mr-3" />
            <span className="font-medium">AI ile Sor</span>
            <ChevronRight className="w-5 h-5 ml-3" />
          </Button>
        </div>

        {/* AI Prompts Panel */}
        {showAIPanel && (
          <div className="fixed bottom-24 right-8 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 space-y-2">
            {aiPrompts.map((prompt, index) => {
              const Icon = prompt.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Icon className="w-4 h-4 mr-3 text-[#5B4BFF]" />
                  <span className="text-sm">{prompt.text}</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
