'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, ArrowLeft, Download, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { reportsApi } from '@/lib/api';

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  type: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  lastActivity: string;
}

export default function CaseStatusReportPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchCases();
  }, [filterStatus]);

  const fetchCases = async () => {
    try {
      const response = await reportsApi.getCaseStatus(filterStatus);
      const data = response.data;
      setCases(data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting case status report...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600';
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
                Dava Durum Raporu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Aktif davaların durum özeti
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
              <div className="flex space-x-2">
                <Button variant={filterStatus === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('all')}>Tümü</Button>
                <Button variant={filterStatus === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('active')}>Aktif</Button>
                <Button variant={filterStatus === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('pending')}>Bekleyen</Button>
                <Button variant={filterStatus === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('completed')}>Tamamlanan</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Dava</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{cases.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Aktif</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{cases.filter(c => c.status === 'active').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Yüksek Öncelik</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{cases.filter(c => c.priority === 'high').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlanan</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cases.filter(c => c.status === 'completed').length}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card><CardContent className="pt-6"><p className="text-center text-gray-500">Yükleniyor...</p></CardContent></Card>
        ) : cases.length === 0 ? (
          <Card><CardContent className="pt-6"><p className="text-center text-gray-500">Dava bulunamadı</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Scale className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{c.caseNumber} • {c.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(c.priority)}`}>
                        {c.priority === 'high' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                        {c.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                        {c.status === 'active' ? 'Aktif' : c.status === 'pending' ? 'Bekleyen' : c.status === 'completed' ? 'Tamamlandı' : 'Arşiv'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>Oluşturma: {new Date(c.createdAt).toLocaleDateString('tr-TR')}</div>
                    <div>Son Aktivite: {new Date(c.lastActivity).toLocaleDateString('tr-TR')}</div>
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
