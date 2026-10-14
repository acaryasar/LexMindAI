'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export function DeleteAccountCard() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/auth/delete-account', { password });
      logout();
      router.push('/login');
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Hesap silinemedi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <Trash2 className="h-5 w-5" /> Hesabımı sil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!open ? (
          <Button type="button" variant="outline" onClick={() => setOpen(true)}>
            Hesabımı silmek istiyorum
          </Button>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3 max-w-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hesabınız, yapay zekâ konuşmalarınız, belleğiniz, önerileriniz ve günlük planlarınız kalıcı olarak silinir; geri alınamaz. Bürodaki dava ve
              müvekkil kayıtları büroya ait olduğundan silinmez. Bürodaki son yönetici hesabı silinemez.
            </p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Onay için şifreniz"
              autoComplete="current-password"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={busy} className="bg-red-600 hover:bg-red-700 text-white">
              Hesabımı kalıcı olarak sil
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
