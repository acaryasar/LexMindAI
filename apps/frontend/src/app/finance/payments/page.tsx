'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useAlert } from '@/components/ui/alert-dialog';

export default function FinancePaymentsPage() {
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');

  const payments = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      client: 'Ahmet Yılmaz',
      amount: 15000,
      paymentDate: '2024-07-15',
      method: 'BANK_TRANSFER',
      status: 'COMPLETED',
      reference: 'TR1234567890',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      client: 'Ayşe Demir',
      amount: 25000,
      paymentDate: '2024-07-20',
      method: 'CREDIT_CARD',
      status: 'COMPLETED',
      reference: 'CC9876543210',
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      client: 'Mehmet Kaya',
      amount: 8000,
      paymentDate: null,
      method: null,
      status: 'PENDING',
      reference: null,
    },
  ];

  const statusColors = {
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  const statusLabels = {
    COMPLETED: 'Tamamlandı',
    PENDING: 'Beklemede',
    FAILED: 'Başarısız',
  };

  const methodLabels = {
    BANK_TRANSFER: 'Banka Havalesi',
    CREDIT_CARD: 'Kredi Kartı',
    CASH: 'Nakit',
    CHECK: 'Çek',
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ödemeler
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ödeme takibi ve kaydı
            </p>
          </div>
          <Button onClick={() => showAlert('info', 'Yeni ödeme özelliği yakında eklenecek')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ödeme
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Ödeme ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Payments List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {payment.invoiceNumber}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            statusColors[payment.status as keyof typeof statusColors]
                          }`}
                        >
                          {statusLabels[payment.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {payment.client}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Tutar: ₺{payment.amount.toLocaleString('tr-TR')}</span>
                        {payment.paymentDate && (
                          <span>
                            Tarih: {new Date(payment.paymentDate).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                        {payment.method && (
                          <span>Yöntem: {methodLabels[payment.method as keyof typeof methodLabels]}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz ödeme kaydı yok'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
