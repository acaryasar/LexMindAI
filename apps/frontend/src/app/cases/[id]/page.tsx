'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { casesApi, Case, CaseLawyer, CaseLawyerRole } from '@/lib/api/cases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Save, XCircle, Plus, User, Mail, Phone, Calendar, Search } from 'lucide-react';
import { useAlert } from '@/components/ui/alert-dialog';

export default function CaseDetailPage() {
  const { showAlert } = useAlert();
  const params = useParams();
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [lawyers, setLawyers] = useState<CaseLawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignLawyerDialog, setShowAssignLawyerDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    { id: 'details', label: 'Dava Bilgileri' },
    { id: 'lawyers', label: 'Avukatlar' },
  ];

  useEffect(() => {
    fetchCaseData();
  }, [params.id]);

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      const [data, lawyersData] = await Promise.all([
        casesApi.getById(params.id as string),
        casesApi.getLawyers(params.id as string)
      ]);
      setCaseData(data);
      setEditForm(data);
      setLawyers(lawyersData);
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
      <MainLayout showAIPanel={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse text-gray-500">Yükleniyor...</div>
        </div>
      </MainLayout>
    );
  }

  if (!caseData) {
    return (
      <MainLayout showAIPanel={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Dava bulunamadı</div>
        </div>
      </MainLayout>
    );
  }

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
              {caseData.caseNumber}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {caseData.title}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Case Details Tab */}
        {activeTab === 'details' && (
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
        )}

        {/* Lawyers Tab */}
        {activeTab === 'lawyers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Avukat ara..."
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowAssignLawyerDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Avukat Ata
              </Button>
            </div>

            <div className="space-y-4">
              {lawyers.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Avukat Atanmadı</h3>
                    <p className="text-sm text-gray-500 mb-4">Bu davaya avukat atamak için yukarıdaki butonu kullanın.</p>
                    <Button onClick={() => setShowAssignLawyerDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Avukatı Ata
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                lawyers.map((lawyer) => (
                  <Card key={lawyer.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {lawyer.user.firstName} {lawyer.user.lastName}
                            </h4>
                            {lawyer.isPrimary && (
                              <Badge className="bg-blue-100 text-blue-700">Ana Avukat</Badge>
                            )}
                            <Badge className="bg-purple-100 text-purple-700">
                              {lawyer.role}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {lawyer.user.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{lawyer.user.email}</span>
                              </div>
                            )}
                            {lawyer.user.phoneNumber && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{lawyer.user.phoneNumber}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Atama Tarihi: {new Date(lawyer.assignedAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Kaldırma nedeni:');
                            if (reason) {
                              casesApi.removeLawyer(params.id as string, lawyer.userId, reason).then(() => {
                                fetchCaseData();
                                showAlert('success', 'Avukat başarıyla kaldırıldı.');
                              });
                            }
                          }}
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Assign Lawyer Dialog */}
            {showAssignLawyerDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Avukat Ata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Avukat Seç</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        id="lawyer-select"
                      >
                        <option value="">Avukat seçin...</option>
                        <option value="lawyer1">Av. Ahmet Yılmaz</option>
                        <option value="lawyer2">Av. Ayşe Demir</option>
                        <option value="lawyer3">Av. Mehmet Kaya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        id="role-select"
                      >
                        <option value="LEAD_LAWYER">Baş Avukat</option>
                        <option value="ASSOCIATE">Yardımcı Avukat</option>
                        <option value="OBSERVER">Gözlemci</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ana Avukat</label>
                      <input
                        type="checkbox"
                        id="is-primary"
                        className="w-4 h-4"
                      />
                      <span className="ml-2 text-sm text-gray-600">Bu avukatı ana avukat olarak işaretle</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Atama Nedeni</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Atama nedenini girin..."
                        id="reason-input"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowAssignLawyerDialog(false)}
                      >
                        İptal
                      </Button>
                      <Button
                        onClick={async () => {
                          const lawyerId = (document.getElementById('lawyer-select') as HTMLSelectElement).value;
                          const role = (document.getElementById('role-select') as HTMLSelectElement).value as CaseLawyerRole;
                          const isPrimary = (document.getElementById('is-primary') as HTMLInputElement).checked;
                          const reason = (document.getElementById('reason-input') as HTMLTextAreaElement).value;
                          
                          if (!lawyerId) {
                            showAlert('error', 'Lütfen bir avukat seçin.');
                            return;
                          }

                          try {
                            await casesApi.assignLawyer(params.id as string, {
                              userId: lawyerId,
                              role,
                              isPrimary,
                              reason
                            });
                            fetchCaseData();
                            setShowAssignLawyerDialog(false);
                            showAlert('success', 'Avukat başarıyla atandı.');
                          } catch (error) {
                            showAlert('error', 'Avukat atanırken bir hata oluştu.');
                          }
                        }}
                      >
                        Ata
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
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
