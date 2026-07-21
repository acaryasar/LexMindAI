'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { useAlert } from '@/components/ui/alert-dialog';
import api from '@/lib/api';

export default function NewUserPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'USER',
  });
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const token = localStorage.getItem('accessToken');
      const response = await api.get('/auth/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      showAlert('warning', 'Lütfen zorunlu alanları doldurunuz.');
      return;
    }

    setSubmitting(true);
    try {
      await usersApi.register(formData);
      showAlert('success', 'Kullanıcı başarıyla oluşturuldu. Kullanıcıya e-posta bildirimi gönderildi.');
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
              <label className="text-sm font-medium">Rol</label>
              {loadingRoles ? (
                <p className="text-sm text-gray-500">Yükleniyor...</p>
              ) : (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
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
