'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { reportsApi } from '@/lib/api';

interface AIAnalysis {
  id: string;
  caseId: string;
  analysisType: string;
  result: string;
  confidence: number;
  recommendations: string[];
  risks: string[];
  createdAt: string;
}

export default function AIAnalysisReportPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await reportsApi.getAIAnalysis();
      const data = response.data;
      setAnalyses(data);
    } catch (error) {
      console.error('Error fetching AI analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting AI analysis report...');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (confidence >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Analiz Raporu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Yapay zeka tarafından yapılan analizler ve öneriler
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Analiz</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ort. Güven</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyses.length > 0 ? Math.round(analyses.reduce((acc, a) => acc + a.confidence, 0) / analyses.length) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Öneriler</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyses.reduce((acc, a) => acc + a.recommendations.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Riskler</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyses.reduce((acc, a) => acc + a.risks.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis List */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Yükleniyor...</p>
            </CardContent>
          </Card>
        ) : analyses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Analiz bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {analysis.analysisType}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dava ID: {analysis.caseId}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceBg(analysis.confidence)} ${getConfidenceColor(analysis.confidence)}`}>
                        %{analysis.confidence} Güven
                      </div>
                    </div>

                    {/* Result */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {analysis.result}
                      </p>
                    </div>

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                          Öneriler
                        </h4>
                        <ul className="space-y-1">
                          {analysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risks */}
                    {analysis.risks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
                          Riskler
                        </h4>
                        <ul className="space-y-1">
                          {analysis.risks.map((risk, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                              <span className="mr-2">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Analiz Tarihi: {new Date(analysis.createdAt).toLocaleString('tr-TR')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
