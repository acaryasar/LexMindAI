'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Plus, MessageSquare, FileText, Brain } from 'lucide-react';
import api from '@/lib/api';

export default function AIWorkspacePage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Merhaba! Ben LexMind AI asistanınızım. Size hukuki konularda yardımcı olmak için buradayım. Nasıl yardımcı olabilirim?',
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      role: 'user',
      content: message,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: message,
        conversationId: null,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'assistant',
          content: response.data.response,
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'assistant',
          content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Asistan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Yapay zeka destekli hukuki asistan
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Sohbet
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Sidebar - Conversations */}
          <Card className="w-80 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Sohbet Geçmişi</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 cursor-pointer">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Yeni Sohbet
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Bugün
                </p>
              </div>
              <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Dava Analizi
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Dün
                </p>
              </div>
              <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Sözleşme İncelemesi
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  2 gün önce
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Chat */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Yeni Sohbet</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hukuki asistanınız
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input
                  placeholder="Mesajınızı yazın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Context Panel */}
          <Card className="w-80 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Bağlam</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  İlgili Dava
                </h4>
                <select className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background">
                  <option>Dava seçin</option>
                  <option>2024/1234 - Tazminat Davası</option>
                  <option>2024/1235 - Boşanma Davası</option>
                </select>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  İlgili Müvekkil
                </h4>
                <select className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background">
                  <option>Müvekkil seçin</option>
                  <option>Ahmet Yılmaz</option>
                  <option>Ayşe Demir</option>
                </select>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  İlgili Belgeler
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Dilekçe.pdf
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Sözleşme.pdf
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Belge Ekle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
