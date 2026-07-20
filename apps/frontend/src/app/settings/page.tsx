'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Bell, Shield, Database, Palette, Globe, Cpu, CheckCircle, AlertCircle, Info } from 'lucide-react';
import axios from 'axios';

export default function SettingsPage() {
  const [aiConfig, setAiConfig] = useState({
    provider: '',
    apiKey: '',
    model: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    fetchAIConfig();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeTooltip) {
        const target = event.target as HTMLElement;
        const tooltipButton = target.closest('[data-tooltip]');
        const tooltipContent = target.closest('[data-tooltip-content]');
        
        // Tooltip butonuna veya içeriğine tıklandıysa kapatma
        if (tooltipButton || tooltipContent) {
          return;
        }
        
        // Dışarı tıklandıysa kapat
        setActiveTooltip(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeTooltip]);

  const fetchAIConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:3001/api/v1/auth/ai-config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAiConfig({
        provider: response.data.provider || '',
        apiKey: '',
        model: response.data.model || '',
      });
    } catch (error) {
      console.error('Error fetching AI config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAIConfig = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      await axios.put('http://localhost:3001/api/v1/auth/ai-config', aiConfig, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestResult({ success: true, message: 'AI konfigürasyonu başarıyla kaydedildi' });
    } catch (error) {
      console.error('Error saving AI config:', error);
      setTestResult({ success: false, message: 'AI konfigürasyonu kaydedilemedi' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ayarlar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Hesap ve uygulama ayarları
          </p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profil Ayarları</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ad</label>
                <Input defaultValue="Admin" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Soyad</label>
                <Input defaultValue="User" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-posta</label>
                <Input defaultValue="admin@lexmind.ai" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input defaultValue="+905551234567" />
              </div>
            </div>
            <Button>Kaydet</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Bildirim Ayarları</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">E-posta Bildirimleri</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Önemli güncellemeler için e-posta al
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Duruşma Hatırlatmaları</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yaklaşan duruşmalar için bildirim al
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fatura Hatırlatmaları</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vade yaklaşan faturalar için bildirim al
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Güvenlik Ayarları</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mevcut Şifre</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yeni Şifre</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre Tekrar</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button>Şifre Değiştir</Button>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="w-5 h-5" />
              <span>Yapay Zeka Ayarları</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">AI Sağlayıcı</label>
                    <button
                      data-tooltip="provider"
                      onClick={() => setActiveTooltip(activeTooltip === 'provider' ? null : 'provider')}
                      className="relative w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={aiConfig.provider}
                    onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value })}
                  >
                    <option value="">Seçiniz</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google AI</option>
                  </select>
                  {activeTooltip === 'provider' && (
                    <div 
                      data-tooltip-content="provider"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="relative z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-auto"
                    >
                      <p className="font-medium mb-1">AI Sağlayıcı Nedir?</p>
                      <p className="text-gray-300">Kullanmak istediğiniz AI hizmet sağlayıcısını seçin (OpenAI, Anthropic, Google AI). Her sağlayıcının farklı modelleri ve fiyatlandırması vardır.</p>
                      <div className="mt-2 space-y-1">
                        <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 cursor-pointer">🔗 openai.com</a>
                        <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 cursor-pointer block">🔗 anthropic.com</a>
                        <a href="https://ai.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 cursor-pointer block">🔗 ai.google.com</a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">API Anahtarı</label>
                    <button
                      data-tooltip="apiKey"
                      onClick={() => setActiveTooltip(activeTooltip === 'apiKey' ? null : 'apiKey')}
                      className="relative w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  />
                  {activeTooltip === 'apiKey' && (
                    <div 
                      data-tooltip-content="apiKey"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="relative z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-auto"
                    >
                      <p className="font-medium mb-1">API Anahtarı Nedir?</p>
                      <p className="text-gray-300">Seçtiğiniz AI sağlayıcısının API anahtarını girin. Bu anahtar, AI hizmetlerine erişmek için gereklidir.</p>
                      <div className="mt-2 space-y-1">
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 cursor-pointer">🔗 platform.openai.com/api-keys</a>
                        <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 cursor-pointer block">🔗 console.anthropic.com/</a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Model</label>
                    <button
                      data-tooltip="model"
                      onClick={() => setActiveTooltip(activeTooltip === 'model' ? null : 'model')}
                      className="relative w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </div>
                  <Input
                    placeholder="gpt-4, claude-3-opus, etc."
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                  />
                  {activeTooltip === 'model' && (
                    <div 
                      data-tooltip-content="model"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="relative z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-auto"
                    >
                      <p className="font-medium mb-1">Model Nedir?</p>
                      <p className="text-gray-300">Kullanmak istediğiniz AI modelinin adını girin (örn: gpt-4, claude-3-opus, gemini-pro).</p>
                      <div className="mt-2 space-y-1">
                        <a href="https://platform.openai.com/docs/models" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 cursor-pointer">🔗 platform.openai.com/docs/models</a>
                        <a href="https://docs.anthropic.com/claude/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 cursor-pointer block">🔗 docs.anthropic.com/claude/docs</a>
                      </div>
                    </div>
                  )}
                </div>
                {testResult && (
                  <div className={`flex items-center space-x-2 p-3 rounded-md ${
                    testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{testResult.message}</span>
                  </div>
                )}
                <Button onClick={handleSaveAIConfig} disabled={saving}>
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Görünüm Ayarları</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Karanlık Mod</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Uygulama temasını değiştir
                </p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dil</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
