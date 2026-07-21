'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Geçersiz veya eksik token');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Geçersiz token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre sıfırlama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Şifre Sıfırlama</CardTitle>
            <CardDescription>
              Yeni şifrenizi girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!success ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                    {error}
                  </div>
                )}

                {!token && (
                  <div className="p-3 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-md">
                    Geçersiz veya eksik token. Lütfen şifre sıfırlama bağlantısını tekrar kullanın.
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Yeni Şifre
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading || !token}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Şifre Tekrar
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    disabled={isLoading || !token}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !token}>
                  {isLoading ? 'Sıralanıyor...' : 'Şifreyi Sıfırla'}
                </Button>

                <div className="text-center">
                  <a href="/login" className="text-sm text-blue-600 hover:underline">
                    Giriş sayfasına dön
                  </a>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-md">
                  Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.
                </div>
                <div className="text-center space-y-2">
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full"
                  >
                    Giriş Sayfasına Git
                  </Button>
                </div>
              </div>
            )}
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
