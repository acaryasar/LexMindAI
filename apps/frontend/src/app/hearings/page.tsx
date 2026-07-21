'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, Scale, Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { hearingsApi, Hearing } from '@/lib/api/hearings';
import { useAlert } from '@/components/ui/alert-dialog';

export default function HearingsPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHearings();
  }, []);

  const fetchHearings = async () => {
    try {
      const response = await hearingsApi.getAll(1, 50);
      setHearings(response.data);
    } catch (error) {
      console.error('Error fetching hearings:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    POSTPONED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  const statusLabels = {
    SCHEDULED: 'Planlandı',
    COMPLETED: 'Tamamlandı',
    POSTPONED: 'Ertelendi',
    CANCELLED: 'İptal',
  };

  const filteredHearings = Array.isArray(hearings) ? hearings.filter(
    (hearing) =>
      hearing.caseId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hearing.location?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <MainLayout showAIPanel={true}>
      <div className="space-y-6 lg:mr-80 md:mr-64 mr-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Duruşmalar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Duruşma takibi ve yönetimi
            </p>
          </div>
          <Button onClick={() => router.push('/hearings/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Duruşma
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Duruşma ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Hearing List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredHearings.map((hearing) => (
              <Card key={hearing.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/hearings/${hearing.id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Dava ID: {hearing.caseId}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(hearing.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{hearing.time || 'Saat belirtilmemiş'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{hearing.location || 'Konum belirtilmemiş'}</span>
                        </div>
                      </div>
                      {hearing.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                          Not: {hearing.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/hearings/${hearing.id}`); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredHearings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz duruşma eklenmemiş'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
