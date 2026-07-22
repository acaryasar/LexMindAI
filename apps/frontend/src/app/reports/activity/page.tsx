'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft, Download, Filter, Scale, FileText, Users, Calendar } from 'lucide-react';
import { reportsApi } from '@/lib/api';

interface ActivityLog {
  id: string;
  action: string;
  type: 'case' | 'document' | 'finance' | 'ai' | 'hearing' | 'task';
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export default function ActivityReportPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'case' | 'document' | 'finance' | 'ai' | 'hearing' | 'task'>('all');

  useEffect(() => {
    fetchActivities();
  }, [filterType]);

  const fetchActivities = async () => {
    try {
      const response = await reportsApi.getActivity(filterType);
      const data = response.data;
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting activity report...');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'case': return <Scale className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      case 'finance': return <Activity className="w-5 h-5" />;
      case 'ai': return <Activity className="w-5 h-5" />;
      case 'hearing': return <Calendar className="w-5 h-5" />;
      case 'task': return <Activity className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'case': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
      case 'document': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'finance': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'ai': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'hearing': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'task': return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'case': return 'bg-indigo-100 dark:bg-indigo-900/20';
      case 'document': return 'bg-green-100 dark:bg-green-900/20';
      case 'finance': return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'ai': return 'bg-purple-100 dark:bg-purple-900/20';
      case 'hearing': return 'bg-blue-100 dark:bg-blue-900/20';
      case 'task': return 'bg-red-100 dark:bg-red-900/20';
      default: return 'bg-gray-100 dark:bg-gray-900/20';
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
                Aktivite Raporu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Son aktiviteler ve kullanıcı bazlı özet
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}>Tümü</Button>
                <Button variant={filterType === 'case' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('case')}>Dava</Button>
                <Button variant={filterType === 'document' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('document')}>Belge</Button>
                <Button variant={filterType === 'finance' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('finance')}>Finans</Button>
                <Button variant={filterType === 'ai' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('ai')}>AI</Button>
                <Button variant={filterType === 'hearing' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('hearing')}>Duruşma</Button>
                <Button variant={filterType === 'task' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('task')}>Görev</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Aktivite</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{new Set(activities.map(a => a.userId)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bugün</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activities.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card><CardContent className="pt-6"><p className="text-center text-gray-500">Yükleniyor...</p></CardContent></Card>
        ) : activities.length === 0 ? (
          <Card><CardContent className="pt-6"><p className="text-center text-gray-500">Aktivite bulunamadı</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeBg(activity.type)}`}>
                      <span className={getTypeColor(activity.type)}>
                        {getTypeIcon(activity.type)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{activity.action}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.details}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                          {activity.type === 'case' ? 'Dava' : activity.type === 'document' ? 'Belge' : activity.type === 'finance' ? 'Finans' : activity.type === 'ai' ? 'AI' : activity.type === 'hearing' ? 'Duruşma' : 'Görev'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{activity.userName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(activity.timestamp).toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
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
