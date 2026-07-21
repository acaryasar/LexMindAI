'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoRoles, setDemoRoles] = useState<any>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setAuth(user, accessToken, refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    const password = (document.getElementById('password') as HTMLInputElement)?.value;

    if (!email || !password) {
      setError('Lütfen e-posta ve şifre alanlarını doldurun');
      return;
    }

    setIsDemoLoading(true);
    setError('');
    setDemoRoles(null);

    try {
      const response = await api.post('/auth/demo-roles', { email, password });
      setDemoRoles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kullanıcı rolleri alınamadı');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Demo Button - Bottom Right Corner */}
      <Button
        onClick={handleDemoClick}
        disabled={isDemoLoading}
        className="fixed bottom-4 right-4 z-50"
        variant="outline"
      >
        {isDemoLoading ? 'Yükleniyor...' : 'Demo'}
      </Button>

      {/* Demo Roles Display */}
      {demoRoles && (
        <div className="fixed bottom-16 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold mb-3 text-gray-900 dark:text-white">Demo Kullanıcıları</h3>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {demoRoles.demoUsers && demoRoles.demoUsers.length > 0 ? (
              <div className="space-y-2">
                {demoRoles.demoUsers.map((user: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      <strong>Şifre:</strong> {user.password}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      <strong>Roller:</strong> {user.roles.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Kullanıcı bulunamadı</p>
            )}
          </div>
          
          <Button
            onClick={() => setDemoRoles(null)}
            className="mt-3 w-full"
            size="sm"
            variant="ghost"
          >
            Kapat
          </Button>
        </div>
      )}

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
        {/* Left side - Branding */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              LexMind AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Hukuk Büroları İçin Yapay Zeka Destekli Yönetim Platformu
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Güvenli ve Modern</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-300">AI Destekli Çalışma</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Verimlilik Odaklı</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
            <CardDescription>
              Hesabınıza giriş yaparak LexMind AI&apos;ı kullanmaya başlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-posta
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@firma.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="remember" className="text-sm">
                    Beni hatırla
                  </label>
                </div>
                <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                  Şifremi unuttum
                </a>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>
          </CardContent>          
        </Card>    

      </div>

      {/* Copyright - Screen Center and Bottom */}
      <div className="fixed bottom-0 left-0 right-0 text-center py-4">
        <p className="text-slate-600 text-xs">
          © 2026 Acar Software. All rights reserved.
        </p>
      </div>

    </div>
  );
}
