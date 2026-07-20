'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { casesApi, Case } from '@/lib/api/cases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Save, XCircle } from 'lucide-react';
import { useAlert } from '@/components/ui/alert-dialog';

export default function CaseDetailPage() {
  const { showAlert } = useAlert();
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchCaseData();
  }, [params.id]);

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      const data = await casesApi.getById(params.id as string);
      setCaseData(data);
      setEditForm(data);
    } catch (error) {
      console.error('Error fetching case data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(caseData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(caseData);
  };

  const handleSaveEdit = async () => {
    try {
      const updateData = {
        caseNumber: editForm.caseNumber,
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        type: editForm.type,
        courtName: editForm.courtName,
        courtCity: editForm.courtCity,
        startDate: editForm.startDate,
      };
      await casesApi.update(params.id as string, updateData);
      setCaseData(editForm);
      setIsEditing(false);
      showAlert('success', 'Dava başarıyla güncellendi.');
    } catch (error: any) {
      console.error('Error updating case:', error);
      const errorMessage = error.response?.data?.message || 'Dava güncellenirken bir hata oluştu. Lütfen tekrar deneyiniz.';
      showAlert('error', errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await casesApi.delete(params.id as string);
      router.push('/cases');
      showAlert('success', 'Dava başarıyla silindi.');
    } catch (error: any) {
      console.error('Error deleting case:', error);
      const errorMessage = error.response?.data?.message || 'Dava silinirken bir hata oluştu. Lütfen tekrar deneyiniz.';
      showAlert('error', errorMessage);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse text-gray-500">Yükleniyor...</div>
        </div>
      </MainLayout>
    );
  }

  if (!caseData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Dava bulunamadı</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {caseData.caseNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {caseData.title}
            </p>
          </div>
        </div>

        {/* Case Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dava Bilgileri</CardTitle>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Sil
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      İptal
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Dava Numarası</label>
                    <Input
                      value={editForm.caseNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, caseNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Dava Başlığı</label>
                    <Input
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Durum</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="PENDING">Beklemede</option>
                      <option value="CLOSED">Kapalı</option>
                      <option value="ARCHIVED">Arşiv</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Dava Türü</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editForm.type || ''}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    >
                      <option value="CIVIL">Hukuk</option>
                      <option value="CRIMINAL">Ceza</option>
                      <option value="FAMILY">Aile</option>
                      <option value="LABOR">İş</option>
                      <option value="COMMERCIAL">Ticaret</option>
                      <option value="ADMINISTRATIVE">İdari</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Mahkeme Adı</label>
                    <Input
                      value={editForm.courtName || ''}
                      onChange={(e) => setEditForm({ ...editForm, courtName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Şehir</label>
                    <Input
                      value={editForm.courtCity || ''}
                      onChange={(e) => setEditForm({ ...editForm, courtCity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Başlangıç Tarihi</label>
                    <Input
                      type="date"
                      value={editForm.startDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Açıklama</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Dava Numarası</label>
                    <p className="text-gray-900 font-medium">{caseData.caseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Dava Başlığı</label>
                    <p className="text-gray-900 font-medium">{caseData.title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Durum</label>
                    <p className="text-gray-900 font-medium">{caseData.status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Dava Türü</label>
                    <p className="text-gray-900 font-medium">{caseData.type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Mahkeme Adı</label>
                    <p className="text-gray-900 font-medium">{caseData.courtName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Şehir</label>
                    <p className="text-gray-900 font-medium">{caseData.courtCity || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Başlangıç Tarihi</label>
                    <p className="text-gray-900 font-medium">
                      {caseData.startDate ? new Date(caseData.startDate).toLocaleDateString('tr-TR') : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Kayıt Tarihi</label>
                    <p className="text-gray-900 font-medium">{new Date(caseData.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
                {caseData.description && (
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Açıklama</label>
                    <p className="text-gray-900 font-medium">{caseData.description}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Davayı Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu davayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Evet, Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
