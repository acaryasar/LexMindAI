'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, Scale, Calendar, User } from 'lucide-react';
import { casesApi, Case } from '@/lib/api/cases';

export default function CasesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await casesApi.getAll(1, 50);
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    CLOSED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    ARCHIVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  };

  const statusLabels = {
    ACTIVE: 'Aktif',
    PENDING: 'Beklemede',
    CLOSED: 'Kapalı',
    ARCHIVED: 'Arşiv',
  };

  const filteredCases = Array.isArray(cases) ? cases.filter(
    (case_) =>
      (statusFilter === 'ALL' || case_.status === statusFilter) &&
      (case_.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.courtName?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  return (
    <MainLayout showAIPanel={true}>
      <div className="space-y-6 lg:mr-80 md:mr-64 mr-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Davalar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Dava yönetimi ve takibi
            </p>
          </div>
          <Button onClick={() => router.push('/cases/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Dava
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Dava ara..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 rounded-md border border-input bg-background text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="PENDING">Beklemede</option>
            <option value="CLOSED">Kapalı</option>
            <option value="ARCHIVED">Arşiv</option>
          </select>
        </div>

        {/* Case List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCases.map((case_) => (
              <Card key={case_.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => console.log('Case clicked:', case_.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {case_.caseNumber}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${statusColors[case_.status as keyof typeof statusColors]}`}
                        >
                          {statusLabels[case_.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {case_.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {case_.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Scale className="w-4 h-4" />
                          <span>{case_.courtName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          <span>
                            {case_.clients?.map((c: any) => `${c.firstName} ${c.lastName}`).join(', ') || '-'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(case_.startDate).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); console.log('More options'); }}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredCases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Arama sonucu bulunamadı'
                : 'Henüz dava eklenmemiş'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
