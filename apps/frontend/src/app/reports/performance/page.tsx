'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ArrowLeft, Download, TrendingUp, Scale, Clock, CheckCircle, Target } from 'lucide-react';
import { reportsApi } from '@/lib/api';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  icon: any;
}

interface PerformanceData {
  caseSuccessRate: number;
  averageCaseDuration: number;
  taskCompletionRate: number;
  clientSatisfaction: number;
  revenueGrowth: number;
  activeCases: number;
  completedCases: number;
}

export default function PerformanceReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    caseSuccessRate: 85,
    averageCaseDuration: 45,
    taskCompletionRate: 92,
    clientSatisfaction: 4.5,
    revenueGrowth: 15,
    activeCases: 24,
    completedCases: 156,
  });

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await reportsApi.getPerformance();
      const data = response.data;
      setPerformanceData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting performance report...');
  };

  const kpiMetrics: KPIMetric[] = [
    {
      id: '1',
      name: 'Dava Başarı Oranı',
      value: performanceData.caseSuccessRate,
      unit: '%',
      trend: 'up',
      trendValue: '+5%',
      icon: Scale,
    },
    {
      id: '2',
      name: 'Ortalama Dava Süresi',
      value: performanceData.averageCaseDuration,
      unit: 'gün',
      trend: 'down',
      trendValue: '-3 gün',
      icon: Clock,
    },
    {
      id: '3',
      name: 'Görev Tamamlanma',
      value: performanceData.taskCompletionRate,
      unit: '%',
      trend: 'up',
      trendValue: '+8%',
      icon: CheckCircle,
    },
    {
      id: '4',
      name: 'Müvekkil Memnuniyeti',
      value: performanceData.clientSatisfaction,
      unit: '/5',
      trend: 'up',
      trendValue: '+0.3',
      icon: Target,
    },
    {
      id: '5',
      name: 'Gelir Büyümesi',
      value: performanceData.revenueGrowth,
      unit: '%',
      trend: 'up',
      trendValue: '+12%',
      icon: TrendingUp,
    },
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 dark:text-green-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      case 'stable': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingUp className="w-4 h-4 rotate-180" />;
      case 'stable': return <TrendingUp className="w-4 h-4 rotate-90" />;
      default: return null;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Performans Raporu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                KPI metrikleri ve trend analizi
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpiMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                      <span>{metric.trendValue}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}{metric.unit}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Case Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Dava İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Aktif Davalar</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{performanceData.activeCases}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(performanceData.activeCases / (performanceData.activeCases + performanceData.completedCases)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan Davalar</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{performanceData.completedCases}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(performanceData.completedCases / (performanceData.activeCases + performanceData.completedCases)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Toplam Davalar</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{performanceData.activeCases + performanceData.completedCases}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Performans Trendleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dava Başarı Oranı</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Son 6 ay</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">%85</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+5%</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Ortalama Dava Süresi</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Son 6 ay</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">45 gün</p>
                  <p className="text-sm text-green-600 dark:text-green-400">-3 gün</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Görev Tamamlanma</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Son 6 ay</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">%92</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+8%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Aylık Performans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz'].map((month, idx) => (
                <div key={month} className="flex items-center space-x-4">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{month}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all" 
                        style={{ width: `${60 + Math.random() * 35}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 dark:text-white font-medium">
                    {Math.floor(60 + Math.random() * 35)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
