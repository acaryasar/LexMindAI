'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { casesApi, CreateCaseDto } from '@/lib/api/cases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useAlert } from '@/components/ui/alert-dialog';

const caseSchema = z.object({
  caseNumber: z.string().min(1, 'Dava numarası zorunludur'),
  title: z.string().min(3, 'Dava başlığı en az 3 karakter olmalı'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'CLOSED', 'ARCHIVED']),
  type: z.enum(['CIVIL', 'CRIMINAL', 'FAMILY', 'LABOR', 'COMMERCIAL', 'ADMINISTRATIVE']),
  courtName: z.string().min(1, 'Mahkeme adı zorunludur'),
  courtCity: z.string().min(1, 'Şehir zorunludur'),
  startDate: z.string().min(1, 'Başlangıç tarihi zorunludur'),
});

type CaseFormData = z.infer<typeof caseSchema>;

export default function NewCasePage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      status: 'ACTIVE',
      type: 'CIVIL',
    },
  });

  const onSubmit = async (data: CaseFormData) => {
    setIsLoading(true);
    try {
      const createData: CreateCaseDto = {
        caseNumber: data.caseNumber,
        title: data.title,
        description: data.description,
        status: data.status,
        type: data.type,
        courtName: data.courtName,
        courtCity: data.courtCity,
        startDate: data.startDate,
      };
      await casesApi.create(createData);
      router.push('/cases');
      showAlert('success', 'Dava başarıyla oluşturuldu.');
    } catch (error: any) {
      console.error('Error creating case:', error);
      const errorMessage = error.response?.data?.message || 'Dava oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.';
      showAlert('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout showAIPanel={true}>
      <div className="max-w-4xl mx-auto space-y-6 lg:mr-80 md:mr-64 mr-0">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Dava
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Yeni dava dosyası oluşturun
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dava Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Temel Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="caseNumber" className="text-sm font-medium">
                      Dava Numarası
                    </label>
                    <Input
                      id="caseNumber"
                      placeholder="2024/1234"
                      {...register('caseNumber')}
                    />
                    {errors.caseNumber && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.caseNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Dava Başlığı
                    </label>
                    <Input
                      id="title"
                      placeholder="Tazminat Davası"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Durum
                    </label>
                    <select
                      id="status"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...register('status')}
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="PENDING">Beklemede</option>
                      <option value="CLOSED">Kapalı</option>
                      <option value="ARCHIVED">Arşiv</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">
                      Dava Türü
                    </label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...register('type')}
                    >
                      <option value="CIVIL">Hukuk</option>
                      <option value="CRIMINAL">Ceza</option>
                      <option value="FAMILY">Aile</option>
                      <option value="LABOR">İş</option>
                      <option value="COMMERCIAL">Ticaret</option>
                      <option value="ADMINISTRATIVE">İdari</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Açıklama
                  </label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Dava hakkında kısa açıklama..."
                    {...register('description')}
                  />
                </div>
              </div>

              {/* Court Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Mahkeme Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="courtName" className="text-sm font-medium">
                      Mahkeme Adı
                    </label>
                    <Input
                      id="courtName"
                      placeholder="İstanbul 1. Asliye Hukuk Mahkemesi"
                      {...register('courtName')}
                    />
                    {errors.courtName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.courtName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="courtCity" className="text-sm font-medium">
                      Şehir
                    </label>
                    <Input
                      id="courtCity"
                      placeholder="İstanbul"
                      {...register('courtCity')}
                    />
                    {errors.courtCity && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.courtCity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">
                      Başlangıç Tarihi
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
