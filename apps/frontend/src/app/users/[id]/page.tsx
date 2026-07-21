'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Save, Phone, Mail, Shield, Trash2, Check } from 'lucide-react';
import { usersApi, User } from '@/lib/api/users';
import { useAlert } from '@/components/ui/alert-dialog';

const AVAILABLE_ROLES = ['USER', 'ADMIN', 'LAWYER'];

export default function UserDetailPage() {
  const { showAlert } = useAlert();
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roles: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getById(params.id as string);
      setUser(data);
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        roles: data.roles || [],
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      await usersApi.update(user.id, editForm);
      await usersApi.updateRoles(user.id, editForm.roles);
      fetchUser();
      setIsEditing(false);
      showAlert('success', 'Kullanıcı başarıyla güncellendi.');
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'Kullanıcı güncellenirken bir hata oluştu.';
      showAlert('error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRole = (role: string) => {
    setEditForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleDelete = async () => {
    if (!user) return;

    try {
      await usersApi.delete(user.id);
      showAlert('success', 'Kullanıcı başarıyla silindi.');
      router.push('/users');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu.';
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

  if (!user) {
    return (
      <MainLayout showAIPanel={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Kullanıcı bulunamadı</div>
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
            <Button variant="ghost" size="icon" onClick={() => router.push('/users')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Kullanıcı Detayı
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {user.firstName} {user.lastName}
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

        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ad</label>
                    <Input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Soyad</label>
                    <Input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-posta</label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefon</label>
                  <Input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Roller</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          editForm.roles.includes(role)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {editForm.roles.includes(role) && <Check className="w-4 h-4 inline mr-1" />}
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">E-posta:</span>
                  <span className="text-gray-900 font-medium">{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-500">Telefon:</span>
                    <span className="text-gray-900 font-medium">{user.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">Roller:</span>
                  <span className="text-gray-900 font-medium">{user.roles.join(', ')}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kullanıcıyı Sil</h3>
              <p className="text-gray-600 mb-6">
                Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
