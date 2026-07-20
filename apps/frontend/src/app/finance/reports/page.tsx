'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, FileText, Download, Calendar } from 'lucide-react';

export default function FinanceReportsPage() {
  const summary = {
    totalRevenue: 125000,
    totalExpenses: 32000,
    netProfit: 93000,
    pendingInvoices: 5,
    overdueInvoices: 2,
  };

  const recentReports = [
    {
      id: 1,
      name: 'Aylık Rapor - Temmuz 2024',
      type: 'MONTHLY',
      generatedAt: '2024-07-20',
      period: '2024-07-01 - 2024-07-31',
    },
    {
      id: 2,
      name: 'Yıllık Rapor - 2024',
      type: 'YEARLY',
      generatedAt: '2024-01-01',
      period: '2024-01-01 - 2024-12-31',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Finansal Raporlar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Finansal analiz ve raporlar
            </p>
          </div>
          <Button onClick={() => alert('Rapor oluşturma özelliği yakında eklenecek')}>
            <FileText className="w-4 h-4 mr-2" />
            Rapor Oluştur
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Toplam Gelir
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    ₺{summary.totalRevenue.toLocaleString('tr-TR')}
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
                    Toplam Gider
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    ₺{summary.totalExpenses.toLocaleString('tr-TR')}
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
                    ₺{summary.netProfit.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Bekleyen Fatura
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.pendingInvoices}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gelir Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Aylık
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gider Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Aylık
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kar/Zarar Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Aylık
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Son Raporlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {report.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {report.period}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(report.generatedAt).toLocaleDateString('tr-TR')}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      İndir
                    </Button>
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
