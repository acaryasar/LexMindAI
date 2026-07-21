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
  Clock3,
  ScrollText,
  FolderOpen,
  Search,
  Sparkles,
  Phone,
  Video,
  Building2,
  MapPin,
  CalendarDays,
  CircleCheckBig,
  TriangleAlert,
  ShieldAlert,
  Navigation,
  NotebookPen,
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
        casesApi.getAll(1, 1, undefined, 'ACTIVE'),
        hearingsApi.getAll(1, 100),
        tasksApi.getAll(1, 1, undefined, 'TODO'),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcomingHearingsList = hearingsResponse.data
        .filter(hearing => new Date(hearing.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      setStats({
        activeCases: casesResponse.meta.total,
        activeClients: clientsResponse.meta.total,
        upcomingHearings: upcomingHearingsList.length,
        pendingTasks: tasksResponse.meta.total,
      });

      setUpcomingHearings(upcomingHearingsList);
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 text-center">
                      {kpi.title}
                    </p>
                    <div className="flex items-center gap-3 justify-center">
                      <div className={`w-12 h-12 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {kpi.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bugünkü Ajanda - Premium Timeline */}
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Bugünün Ajandası</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Bugünkü programınız</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8">
                      <CalendarDays className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8">
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-[80px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                  {/* Timeline Items */}
                  <div className="space-y-4">
                    {/* Event 1 - Court Hearing - Current Event */}
                    <div className="relative flex items-start group">
                      {/* Time Column */}
                      <div className="w-[80px] flex-shrink-0 pr-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">09:30</p>
                          <p className="text-xs text-gray-500">AM</p>
                        </div>
                      </div>

                      {/* Timeline Node with Pulse Animation */}
                      <div className="absolute left-[76px] w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900 shadow-md z-10 animate-pulse"></div>

                      {/* Event Card - Current Event Highlighting */}
                      <div className="flex-1 ml-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 border border-blue-200 dark:border-blue-800 group-hover:border-blue-300 dark:group-hover:border-blue-700">
                          {/* Event Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Duruşma</p>
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Court Hearing</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-orange-600 dark:text-orange-400">20 dk sonra başlıyor</p>
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Building2 className="w-4 h-4 mr-2" />
                              <span>Ankara 3. İş Mahkemesi</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <FileText className="w-4 h-4 mr-2" />
                              <span>Dava: 2026/154</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Users className="w-4 h-4 mr-2" />
                              <span>Müvekkil: ABC Holding</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>Durum Salonu 12</span>
                            </div>
                          </div>

                          {/* AI Insight */}
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 mb-3 border border-purple-100 dark:border-purple-800">
                            <div className="flex items-start space-x-2">
                              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-purple-700 dark:text-purple-300">Bu duruşma 30 dakika sonra başlıyor. Trafik gecikmeye neden olabilir. Duruşma notlarını hazırlayın.</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="flex-1">
                              Davayı Aç
                            </Button>
                            <Button size="sm" variant="outline">
                              <Navigation className="w-4 h-4 mr-1" />
                              Yol Tarifi
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event 2 - Client Meeting */}
                    <div className="relative flex items-start group">
                      <div className="w-[80px] flex-shrink-0 pr-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">11:00</p>
                          <p className="text-xs text-gray-500">AM</p>
                        </div>
                      </div>

                      <div className="absolute left-[76px] w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900 shadow-md z-10"></div>

                      <div className="flex-1 ml-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Müvekkil Görüşmesi</p>
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Client Meeting</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">1 saat 50 dk sonra</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Users className="w-4 h-4 mr-2" />
                              <span>Müvekkil: XYZ Şirketi</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Video className="w-4 h-4 mr-2" />
                              <span>Video Toplantısı</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Clock3 className="w-4 h-4 mr-2" />
                              <span>Süre: 45 dakika</span>
                            </div>
                          </div>

                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 mb-3 border border-purple-100 dark:border-purple-800">
                            <div className="flex items-start space-x-2">
                              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-purple-700 dark:text-purple-300">Müvekkil bu sabah yeni kanıt yükledi. Duruşmadan önce inceleyin.</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="flex-1">
                              Toplantıya Katıl
                            </Button>
                            <Button size="sm" variant="outline">
                              <NotebookPen className="w-4 h-4 mr-1" />
                              Notlar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event 3 - Document Review */}
                    <div className="relative flex items-start group">
                      <div className="w-[80px] flex-shrink-0 pr-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">14:30</p>
                          <p className="text-xs text-gray-500">PM</p>
                        </div>
                      </div>

                      <div className="absolute left-[76px] w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900 shadow-md z-10"></div>

                      <div className="flex-1 ml-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                <ScrollText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Dilekçe Teslimi</p>
                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">Petition</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">5 saat sonra</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <FileText className="w-4 h-4 mr-2" />
                              <span>Dava: 2026/155</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Building2 className="w-4 h-4 mr-2" />
                              <span>İstanbul 5. Asliye Hukuk Mahkemesi</span>
                            </div>
                          </div>

                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 mb-3 border border-purple-100 dark:border-purple-800">
                            <div className="flex items-start space-x-2">
                              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-purple-700 dark:text-purple-300">Dilekçe taslağı hazır. AI özeti kullanabilirsiniz.</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="flex-1">
                              Dilekçeyi Gör
                            </Button>
                            <Button size="sm" variant="outline">
                              <Sparkles className="w-4 h-4 mr-1" />
                              AI Özet
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event 4 - File Review */}
                    <div className="relative flex items-start group">
                      <div className="w-[80px] flex-shrink-0 pr-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">16:00</p>
                          <p className="text-xs text-gray-500">PM</p>
                        </div>
                      </div>

                      <div className="absolute left-[76px] w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900 shadow-md z-10"></div>

                      <div className="flex-1 ml-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                <FolderOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Dosya İncelemesi</p>
                                <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">Research</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">6.5 saat sonra</p>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <FileText className="w-4 h-4 mr-2" />
                              <span>Dava: 2026/145</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Search className="w-4 h-4 mr-2" />
                              <span>Benzemeyen kararlar araştırması</span>
                            </div>
                          </div>

                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 mb-3 border border-purple-100 dark:border-purple-800">
                            <div className="flex items-start space-x-2">
                              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-purple-700 dark:text-purple-300">Benzer bir mahkeme kararı bulundu. İncelemenizi öneriyoruz.</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" className="flex-1">
                              Dosyayı Aç
                            </Button>
                            <Button size="sm" variant="outline">
                              <Sparkles className="w-4 h-4 mr-1" />
                              AI Analizi
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
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
