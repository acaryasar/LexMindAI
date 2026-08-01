'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, Clock } from 'lucide-react';
import { aiApi } from '@/lib/api/ai';

export default function AIConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await aiApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sohbet Geçmişi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI asistan ile geçmiş sohbetler
            </p>
          </div>
          <Button onClick={() => router.push('/ai-workspace')}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Sohbet
          </Button>
        </div>

        {/* Conversations List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Yükleniyor...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations.map((conv) => (
              <Card 
                key={conv.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/ai-workspace?conversationId=${conv.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-lg">{conv.title}</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {conv.messages?.[0]?.content || 'Mesaj yok'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(conv.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <span>{conv._count?.messages || 0} mesaj</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Henüz sohbet geçmişi yok
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
