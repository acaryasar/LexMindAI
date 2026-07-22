'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowLeft, Download, Mail, Phone, Building2 } from 'lucide-react';
import { reportsApi } from '@/lib/api';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  activeCases: number;
  totalCases: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

export default function ClientReportPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await reportsApi.getClient();
      const data = response.data;
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting client report...');
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
                Müvekkil Raporu
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Müvekkil bazlı özet ve aktiviteler
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Müvekkil</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Müvekkil</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.filter(c => c.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Dava</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.reduce((acc, c) => acc + c.totalCases, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Dava</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.reduce((acc, c) => acc + c.activeCases, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card><CardContent className="pt-6"><p className="text-center text-gray-500">Yükleniyor...</p></CardContent></Card>
        ) : clients.length === 0 ? (
          <Card><CardContent className="pt-6"><p className="text-center text-gray-500">Müvekkil bulunamadı</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                        {client.company && <p className="text-sm text-gray-500 dark:text-gray-400">{client.company}</p>}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                      {client.status === 'active' ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400">Aktif Davalar</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{client.activeCases}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400">Toplam Davalar</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{client.totalCases}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Son Aktivite: {new Date(client.lastActivity).toLocaleDateString('tr-TR')}
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
