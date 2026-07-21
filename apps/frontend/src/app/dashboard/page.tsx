'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { AICopilotPanel } from '@/components/ai-copilot/ai-copilot-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Scale,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { clientsApi } from '@/lib/api/clients';
import { casesApi } from '@/lib/api/cases';
import { hearingsApi, Hearing } from '@/lib/api/hearings';
import { tasksApi } from '@/lib/api/tasks';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCases: 0,
    activeClients: 0,
    upcomingHearings: 0,
    pendingTasks: 0,
  });
  const [recentActivities] = useState([
    { id: 1, action: 'Yeni dava oluşturuldu', time: '2 saat önce', type: 'case' },
    { id: 2, action: 'Belge yüklendi', time: '3 saat önce', type: 'document' },
    { id: 3, action: 'Ödeme alındı', time: '5 saat önce', type: 'finance' },
    { id: 4, action: 'AI analiz tamamlandı', time: '6 saat önce', type: 'ai' },
    { id: 5, action: 'Duruşma eklendi', time: '1 gün önce', type: 'hearing' },
  ]);
  const [upcomingHearings, setUpcomingHearings] = useState<Hearing[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsResponse, casesResponse, hearingsResponse, tasksResponse] = await Promise.all([
        clientsApi.getAll(1, 1),
        casesApi.getAll(1, 1),
        hearingsApi.getAll(1, 10),
        tasksApi.getAll(1, 1),
      ]);

      setStats({
        activeCases: casesResponse.meta.total,
        activeClients: clientsResponse.meta.total,
        upcomingHearings: hearingsResponse.meta.total,
        pendingTasks: tasksResponse.meta.total,
      });

      setUpcomingHearings(hearingsResponse.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiData = [
    {
      title: 'Aktif Davalar',
      value: stats.activeCases.toString(),
      trend: '+12%',
      icon: Scale,
      color: 'blue',
    },
    {
      title: 'Aktif Müvekkiller',
      value: stats.activeClients.toString(),
      trend: '+8%',
      icon: Users,
      color: 'green',
    },
    {
      title: 'Yaklaşan Duruşmalar',
      value: stats.upcomingHearings.toString(),
      trend: '+2',
      icon: Calendar,
      color: 'orange',
    },
    {
      title: 'Bekleyen Görevler',
      value: stats.pendingTasks.toString(),
      trend: '-5',
      icon: Clock,
      color: 'purple',
    },
  ];

  return (
    <div className="flex">
      <MainLayout showAIPanel={true}>
        <div 
          className="space-y-6 transition-all duration-300 ease-in-out lg:mr-80 md:mr-64 mr-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ana Sayfa
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Hoş geldiniz, işlerinizi buradan yönetebilirsiniz
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Rapor Oluştur
              </Button>
              <Button>
                <Scale className="w-4 h-4 mr-2" />
                Yeni Dava
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi) => {
              const Icon = kpi.icon;
              const colorClasses = {
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                orange: 'bg-orange-500',
                purple: 'bg-purple-500',
              };

              return (
                <Card key={kpi.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {kpi.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                          {kpi.value}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {activity.type === 'case' && <Scale className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'document' && <FileText className="w-5 h-5 text-green-600" />}
                        {activity.type === 'finance' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                        {activity.type === 'ai' && <CheckCircle className="w-5 h-5 text-orange-600" />}
                        {activity.type === 'hearing' && <Calendar className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>AI Asistan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Bugünkü hukuki asistanınız:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span>3 kritik göreviniz var</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>Yarın 2 duruşmanız bulunuyor</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-500" />
                      <span>5 belge AI analizi bekliyor</span>
                    </li>
                  </ul>
                </div>
                <Button className="w-full" onClick={() => router.push('/ai-workspace')}>
                  AI Asistanı Başlat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Hearings */}
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Duruşmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingHearings.map((hearing) => (
                  <div key={hearing.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dava ID: {hearing.caseId}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {hearing.location || 'Konum belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(hearing.date).toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {hearing.time || 'Saat belirtilmemiş'}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingHearings.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Yaklaşan duruşma yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </div>
  );
}
