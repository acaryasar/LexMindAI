'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, Scale, Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { hearingsApi, Hearing } from '@/lib/api/hearings';

export default function HearingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null);
  const [formData, setFormData] = useState({
    caseId: '',
    date: '',
    time: '',
    location: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHearings();
  }, []);

  const fetchHearings = async () => {
    try {
      const response = await hearingsApi.getAll(1, 50);
      setHearings(response.data);
    } catch (error) {
      console.error('Error fetching hearings:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    POSTPONED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  };

  const statusLabels = {
    SCHEDULED: 'Planlandı',
    COMPLETED: 'Tamamlandı',
    POSTPONED: 'Ertelendi',
    CANCELLED: 'İptal',
  };

  const filteredHearings = Array.isArray(hearings) ? hearings.filter(
    (hearing) =>
      hearing.caseId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hearing.location?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleCreate = async () => {
    if (!formData.caseId || !formData.date) {
      alert('Dava ID ve tarih zorunludur');
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
      setShowCreateDialog(false);
      setFormData({ caseId: '', date: '', time: '', location: '', notes: '' });
      fetchHearings();
    } catch (error) {
      console.error('Error creating hearing:', error);
      alert('Duruşma oluşturulurken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (hearing: Hearing) => {
    setSelectedHearing(hearing);
    setFormData({
      caseId: hearing.caseId,
      date: hearing.date,
      time: hearing.time || '',
      location: hearing.location || '',
      notes: hearing.notes || '',
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedHearing) return;
    
    setSubmitting(true);
    try {
      await hearingsApi.update(selectedHearing.id, {
        date: formData.date,
        time: formData.time,
        location: formData.location,
        notes: formData.notes,
      });
      setShowEditDialog(false);
      setSelectedHearing(null);
      setFormData({ caseId: '', date: '', time: '', location: '', notes: '' });
      fetchHearings();
    } catch (error) {
      console.error('Error updating hearing:', error);
      alert('Duruşma güncellenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (hearing: Hearing) => {
    setSelectedHearing(hearing);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedHearing) return;
    
    try {
      await hearingsApi.delete(selectedHearing.id);
      setShowDeleteDialog(false);
      setSelectedHearing(null);
      fetchHearings();
    } catch (error) {
      console.error('Error deleting hearing:', error);
      alert('Duruşma silinirken hata oluştu');
      setShowDeleteDialog(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Duruşmalar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Duruşma takibi ve yönetimi
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Duruşma
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Duruşma ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Hearing List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredHearings.map((hearing) => (
              <Card key={hearing.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => console.log('Hearing clicked:', hearing.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          Dava ID: {hearing.caseId}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(hearing.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{hearing.time || 'Saat belirtilmemiş'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{hearing.location || 'Konum belirtilmemiş'}</span>
                        </div>
                      </div>
                      {hearing.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                          Not: {hearing.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(hearing); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(hearing); }}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredHearings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz duruşma eklenmemiş'}
            </p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yeni Duruşma</h3>
            <div className="space-y-4">
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
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {showEditDialog && selectedHearing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Duruşma Düzenle</h3>
            <div className="space-y-4">
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
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                İptal
              </Button>
              <Button onClick={handleSaveEdit} disabled={submitting}>
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedHearing && (
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
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Evet, Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
