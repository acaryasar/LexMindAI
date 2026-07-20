'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { clientsApi, CreateClientDto } from '@/lib/api/clients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useAlert } from '@/components/ui/alert-dialog';

const clientSchema = z.object({
  firstName: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyisim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi girin').optional().or(z.literal('')),
  phoneNumber: z.string().min(10, 'Telefon numarası en az 10 karakter olmalı').optional().or(z.literal('')),
  nationalId: z.string().length(11, 'TCKN 11 haneli olmalı').optional().or(z.literal('')),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const { showAlert } = useAlert();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      const createData: CreateClientDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber || undefined,
        nationalId: data.nationalId || undefined,
        taxNumber: data.taxNumber,
        address: data.address,
        notes: data.notes,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : undefined,
      };
      await clientsApi.create(createData);
      router.push('/clients');
      showAlert('success', 'Müvekkil başarıyla oluşturuldu.');
    } catch (error: any) {
      console.error('Error creating client:', error);
      const errorMessage = error.response?.data?.message || 'Müvekkil oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.';
      showAlert('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Yeni Müvekkil
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Yeni müvekkil bilgisi ekleyin
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Müvekkil Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Kişisel Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      İsim
                    </label>
                    <Input
                      id="firstName"
                      placeholder="Ahmet"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Soyisim
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Yılmaz"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      E-posta
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="text-sm font-medium">
                      Telefon
                    </label>
                    <Input
                      id="phoneNumber"
                      placeholder="+905551234567"
                      {...register('phoneNumber')}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nationalId" className="text-sm font-medium">
                      TCKN
                    </label>
                    <Input
                      id="nationalId"
                      placeholder="12345678901"
                      maxLength={11}
                      {...register('nationalId')}
                    />
                    {errors.nationalId && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.nationalId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="taxNumber" className="text-sm font-medium">
                      Vergi Numarası (Opsiyonel)
                    </label>
                    <Input
                      id="taxNumber"
                      placeholder="1234567890"
                      {...register('taxNumber')}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Adres
                </h3>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Adres
                  </label>
                  <Input
                    id="address"
                    placeholder="İstanbul, Türkiye"
                    {...register('address')}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ek Bilgiler
                </h3>
                <div className="space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Etiketler (Virgülle ayırın)
                  </label>
                  <Input
                    id="tags"
                    placeholder="VIP, Kurumsal"
                    {...register('tags')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notlar
                  </label>
                  <textarea
                    id="notes"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Müvekkil hakkında notlar..."
                    {...register('notes')}
                  />
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
