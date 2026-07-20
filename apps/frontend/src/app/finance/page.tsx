'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, FileText, Users } from 'lucide-react';
import api from '@/lib/api';

export default function FinancePage() {
  const [summary, setSummary] = useState<any>(null);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [summaryRes, invoicesRes] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/finance/invoices?limit=5'),
      ]);
      setSummary(summaryRes.data);
      setRecentInvoices(invoicesRes.data);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const statusLabels = {
    PAID: 'Ödendi',
    PENDING: 'Beklemede',
    OVERDUE: 'Gecikmiş',
    CANCELLED: 'İptal',
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Finans
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Faturalar, ödemeler ve raporlar
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Rapor
            </Button>
            <Button>
              <DollarSign className="w-4 h-4 mr-2" />
              Yeni Fatura
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Toplam Fatura
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      ₺{summary?.totalInvoiced?.toLocaleString('tr-TR') || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tahsil Edilen
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      ₺{summary?.totalCollected?.toLocaleString('tr-TR') || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Giderler
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      ₺{summary?.totalExpenses?.toLocaleString('tr-TR') || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Net Kar
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      ₺{summary?.netProfit?.toLocaleString('tr-TR') || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Son Faturalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {invoice.client}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ₺{invoice.amount.toLocaleString('tr-TR')}
                    </p>
                    <div className="flex items-center justify-end space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          statusColors[invoice.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[invoice.status as keyof typeof statusLabels]}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
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
