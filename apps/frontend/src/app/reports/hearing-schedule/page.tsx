'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, ArrowLeft, Download, Filter } from 'lucide-react';
import { reportsApi } from '@/lib/api';

interface Hearing {
  id: string;
  caseId: string;
  date: string;
  time: string;
  location: string;
  status: string;
  caseTitle?: string;
}

export default function HearingScheduleReportPage() {
  const router = useRouter();
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchHearings();
  }, [filterStatus]);

  const fetchHearings = async () => {
    try {
      const response = await reportsApi.getHearingSchedule(filterStatus);
      const data = response.data;
      setHearings(data);
    } catch (error) {
      console.error('Error fetching hearings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting hearing schedule report...');
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
                Duruşma Takvimi Raporu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tüm duruşmaların detaylı takvimi
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

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex space-x-2">
                <Button
                  variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('upcoming')}
                >
                  Yaklaşan
                </Button>
                <Button
                  variant={filterStatus === 'past' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('past')}
                >
                  Geçmiş
                </Button>
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Tümü
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hearing List */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Yükleniyor...</p>
            </CardContent>
          </Card>
        ) : hearings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Duruşma bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {hearings.map((hearing) => (
              <Card key={hearing.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {hearing.caseTitle || hearing.caseId}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dava ID: {hearing.caseId}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(hearing.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{hearing.time || 'Saat belirtilmemiş'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{hearing.location || 'Konum belirtilmemiş'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        hearing.status === 'upcoming' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {hearing.status === 'upcoming' ? 'Yaklaşan' : 'Geçmiş'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Özet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Duruşma</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{hearings.length}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Yaklaşan Duruşma</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {hearings.filter(h => new Date(h.date) >= new Date()).length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Geçmiş Duruşma</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {hearings.filter(h => new Date(h.date) < new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
