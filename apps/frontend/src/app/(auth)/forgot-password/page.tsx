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

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Şifre sıfırlama isteği başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Şifremi Unuttum</CardTitle>
            <CardDescription>
              E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
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
                  Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı e-posta adresinize gönderilecektir.
                </div>
                <div className="text-center space-y-2">
                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full"
                    variant="outline"
                  >
                    Giriş Sayfasına Dön
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
