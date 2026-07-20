'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, FileText, Copy, Edit } from 'lucide-react';
import { useAlert } from '@/components/ui/alert-dialog';

export default function AIPromptsPage() {
  const { showAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');

  const prompts = [
    {
      id: 1,
      name: 'Dava Analizi',
      description: 'Dava dosyasını analiz et ve strateji öner',
      category: 'Dava',
      version: '1.0',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Sözleşme İncelemesi',
      description: 'Sözleşmede riskli maddeleri tespit et',
      category: 'Sözleşme',
      version: '1.2',
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Dilekçe Yazımı',
      description: 'Standart dilekçe taslağı oluştur',
      category: 'Dilekçe',
      version: '2.0',
      status: 'ACTIVE',
    },
  ];

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Prompt Kütüphanesi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI prompt şablonları
            </p>
          </div>
          <Button onClick={() => showAlert('info', 'Yeni prompt özelliği yakında eklenecek')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Prompt
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Prompt ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Prompts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{prompt.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {prompt.category}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {prompt.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      statusColors[prompt.status as keyof typeof statusColors]
                    }`}
                  >
                    {prompt.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    v{prompt.version}
                  </span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Kopyala
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz prompt eklenmemiş'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
