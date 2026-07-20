'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, FileText, Download, Send } from 'lucide-react';

export default function FinanceInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const invoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      client: 'Ahmet Yılmaz',
      amount: 15000,
      status: 'PAID',
      dueDate: '2024-07-15',
      issuedDate: '2024-07-01',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      client: 'Ayşe Demir',
      amount: 25000,
      status: 'PENDING',
      dueDate: '2024-07-25',
      issuedDate: '2024-07-10',
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      client: 'Mehmet Kaya',
      amount: 8000,
      status: 'OVERDUE',
      dueDate: '2024-07-10',
      issuedDate: '2024-06-25',
    },
  ];

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

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Faturalar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Fatura yönetimi
            </p>
          </div>
          <Button onClick={() => alert('Yeni fatura özelliği yakında eklenecek')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Fatura
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Fatura ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Invoices List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            statusColors[invoice.status as keyof typeof statusColors]
                          }`}
                        >
                          {statusLabels[invoice.status as keyof typeof statusLabels]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {invoice.client}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Tutar: ₺{invoice.amount.toLocaleString('tr-TR')}</span>
                        <span>Vade: {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}</span>
                        <span>Düzenleme: {new Date(invoice.issuedDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      İndir
                    </Button>
                    {invoice.status === 'PENDING' && (
                      <Button variant="outline" size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        Gönder
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz fatura eklenmemiş'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
