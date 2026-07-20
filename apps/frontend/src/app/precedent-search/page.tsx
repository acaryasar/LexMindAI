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
} from 'lucide-react';

export default function PrecedentSearchPage() {
  const [activeTab, setActiveTab] = useState('smart');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'smart', label: 'Akıllı Arama', icon: Brain },
    { id: 'text', label: 'Metin Arama', icon: FileText },
    { id: 'similar', label: 'Emsal Arama', icon: Scale },
    { id: 'advanced', label: 'Gelişmiş Arama', icon: Filter },
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                İçtihat Arama
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Yargıtay, Danıştay ve Bölge Adliye Mahkemesi kararlarında yapay zekâ destekli arama.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Arama Geçmişi</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4" />
                <span>Kaydedilen Aramalar</span>
              </Button>
              <Button className="flex items-center space-x-2 bg-[#5B4BFF] hover:bg-[#4A3BE8]">
                <Plus className="w-4 h-4" />
                <span>Yeni Arama</span>
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
                    className="w-full h-16 pl-6 pr-16 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-[#5B4BFF] dark:focus:border-[#5B4BFF]"
                  />
                  <Button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-6 bg-[#5B4BFF] hover:bg-[#4A3BE8]"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    <span className="font-medium">AI ile Ara</span>
                  </Button>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Arama Sonuçları
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {sampleResults.length} sonuç bulundu
                </span>
              </div>

              {sampleResults.map((result) => (
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
                      {result.legalConcepts.map((concept) => (
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
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="w-4 h-4 mr-2" />
                        Detayı Gör
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Analizi
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Scale className="w-4 h-4 mr-2" />
                        Karşılaştır
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        PDF Aç
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 p-8 space-y-6">
            {/* Search Summary */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Arama Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Toplam Sonuç</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {sampleResults.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Benzer Kararlar</span>
                  <span className="font-semibold text-green-600">
                    {sampleResults.filter((r) => r.similarityScore > 85).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Yüksek Güven</span>
                  <span className="font-semibold text-[#5B4BFF]">
                    {sampleResults.filter((r) => r.aiConfidence > 90).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">AI Öneri Skoru</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    92%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Filtreler</CardTitle>
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

        {/* Floating AI Assistant */}
        <div className="fixed bottom-8 right-8">
          <Button
            className="h-16 px-6 bg-[#5B4BFF] hover:bg-[#4A3BE8] shadow-2xl rounded-full"
          >
            <MessageSquare className="w-6 h-6 mr-3" />
            <span className="font-medium">Hukuki araştırmayı AI ile genişlet</span>
            <ChevronRight className="w-5 h-5 ml-3" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
