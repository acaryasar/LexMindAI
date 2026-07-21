'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { hearingsApi } from '@/lib/api/hearings';
import { useAlert } from '@/components/ui/alert-dialog';

export default function NewHearingPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [formData, setFormData] = useState({
    caseId: '',
    date: '',
    time: '',
    location: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.caseId || !formData.date) {
      showAlert('warning', 'Lütfen dava ID ve tarih alanlarını doldurunuz.');
      return;
    }

    setSubmitting(true);
    try {
      await hearingsApi.create({
        caseId: formData.caseId,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        notes: formData.notes,
      });
      showAlert('success', 'Duruşma başarıyla oluşturuldu.');
      router.push('/hearings');
    } catch (error: any) {
      console.error('Error creating hearing:', error);
      const errorMessage = error.response?.data?.message || 'Duruşma oluşturulurken bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.';
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
          <Button variant="ghost" size="icon" onClick={() => router.push('/hearings')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Duruşma
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Yeni duruşma oluşturun
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Duruşma Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dava ID</label>
              <Input
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                placeholder="Dava ID"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Saat</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Konum</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Mahkeme veya konum"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notlar</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => router.push('/hearings')}>
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
