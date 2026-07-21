'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { useAlert } from '@/components/ui/alert-dialog';

export default function NewUserPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      showAlert('warning', 'Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    setSubmitting(true);
    try {
      await usersApi.register(formData);
      showAlert('success', 'Kullanıcı başarıyla oluşturuldu.');
      router.push('/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Kullanıcı oluşturulurken bir hata oluştu.';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout showAIPanel={true}>
      <div className="space-y-6 lg:mr-80 md:mr-64 mr-0">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/users')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Kullanıcı
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Yeni kullanıcı oluşturun
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ad</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ad"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Soyad</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Soyad"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-posta</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="E-posta adresi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefon</label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Telefon numarası"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Şifre</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Şifre"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => router.push('/users')}>
                İptal
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
