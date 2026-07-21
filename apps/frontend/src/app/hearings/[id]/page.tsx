'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Save, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { hearingsApi, Hearing } from '@/lib/api/hearings';
import { useAlert } from '@/components/ui/alert-dialog';

export default function HearingDetailPage() {
  const { showAlert } = useAlert();
  const params = useParams();
  const router = useRouter();
  const [hearing, setHearing] = useState<Hearing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    location: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchHearing();
  }, [params.id]);

  const fetchHearing = async () => {
    try {
      setLoading(true);
      const data = await hearingsApi.getById(params.id as string);
      setHearing(data);
      setEditForm({
        date: data.date,
        time: data.time || '',
        location: data.location || '',
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Error fetching hearing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hearing) return;

    setSubmitting(true);
    try {
      await hearingsApi.update(hearing.id, {
        date: editForm.date,
        time: editForm.time,
        location: editForm.location,
        notes: editForm.notes,
      });
      fetchHearing();
      setIsEditing(false);
      showAlert('success', 'Duruşma başarıyla güncellendi.');
    } catch (error: any) {
      console.error('Error updating hearing:', error);
      const errorMessage = error.response?.data?.message || 'Duruşma güncellenirken bir hata oluştu.';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!hearing) return;

    try {
      await hearingsApi.delete(hearing.id);
      showAlert('success', 'Duruşma başarıyla silindi.');
      router.push('/hearings');
    } catch (error: any) {
      console.error('Error deleting hearing:', error);
      const errorMessage = error.response?.data?.message || 'Duruşma silinirken bir hata oluştu.';
      showAlert('error', errorMessage);
    }
  };

  if (loading) {
    return (
      <MainLayout showAIPanel={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse text-gray-500">Yükleniyor...</div>
        </div>
      </MainLayout>
    );
  }

  if (!hearing) {
    return (
      <MainLayout showAIPanel={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Duruşma bulunamadı</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showAIPanel={true}>
      <div className="space-y-6 lg:mr-80 md:mr-64 mr-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/hearings')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Duruşma Detayı
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Dava ID: {hearing.caseId}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={submitting}>
                <Save className="w-4 h-4 mr-2" />
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            )}
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>

        {/* Hearing Details */}
        <Card>
          <CardHeader>
            <CardTitle>Duruşma Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tarih</label>
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Saat</label>
                  <Input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Konum</label>
                  <Input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notlar</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">Tarih:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(hearing.date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                {hearing.time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-500">Saat:</span>
                    <span className="text-gray-900 font-medium">{hearing.time}</span>
                  </div>
                )}
                {hearing.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-500">Konum:</span>
                    <span className="text-gray-900 font-medium">{hearing.location}</span>
                  </div>
                )}
                {hearing.notes && (
                  <div className="text-sm">
                    <span className="text-gray-500">Notlar:</span>
                    <p className="text-gray-900 mt-1">{hearing.notes}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Duruşmayı Sil</h3>
              <p className="text-gray-600 mb-6">
                Bu duruşmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
      </div>
    </MainLayout>
  );
}
