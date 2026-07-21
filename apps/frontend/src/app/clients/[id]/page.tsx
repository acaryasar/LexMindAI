'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, Mail, Video, Copy, Edit, Plus, FileText, Calendar, 
  TrendingUp, Clock, DollarSign, AlertCircle, ChevronRight,
  Search, Sparkles, Brain, User, MapPin, Building, CreditCard,
  MessageSquare, CheckCircle, XCircle, MoreVertical, Filter, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { clientsApi, Client, ClientLawyer } from '@/lib/api/clients';
import { casesApi, Case } from '@/lib/api/cases';
import { documentsApi, Document } from '@/lib/api/documents';
import { usersApi, User as UserType } from '@/lib/api/users';
import { useAlert } from '@/components/ui/alert-dialog';

export default function ClientDetailPage() {
  const { showAlert } = useAlert();
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [client, setClient] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<ClientLawyer[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignLawyerDialog, setShowAssignLawyerDialog] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Genel Bakış' },
    { id: 'cases', label: 'Davalar' },
    { id: 'documents', label: 'Belgeler' },
    { id: 'lawyers', label: 'Avukatlar' },
    { id: 'communications', label: 'İletişimler' },
    { id: 'meetings', label: 'Toplantılar' },
    { id: 'tasks', label: 'Görevler' },
    { id: 'financial', label: 'Finansal' },
    { id: 'timeline', label: 'Zaman Çizelgesi' },
    { id: 'notes', label: 'Notlar' },
    { id: 'ai-insights', label: 'AI İçgörüleri' },
  ];

  useEffect(() => {
    fetchClientData();
  }, [params.id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      const [clientData, casesData, documentsData, lawyersData, usersData] = await Promise.all([
        clientsApi.getById(params.id as string),
        casesApi.getByClient(params.id as string),
        documentsApi.getByClient(params.id as string),
        clientsApi.getLawyers(params.id as string),
        usersApi.getUsers()
      ]);
      
      setClient(clientData);
      setEditForm(clientData);
      setCases(casesData);
      setDocuments(documentsData);
      setLawyers(lawyersData);
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(client);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(client);
  };

  const handleSaveEdit = async () => {
    try {
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        nationalId: editForm.nationalId,
        taxNumber: editForm.taxNumber,
        address: editForm.address,
        notes: editForm.notes,
        tags: editForm.tags,
      };
      await clientsApi.update(params.id as string, updateData);
      setClient(editForm);
      setIsEditing(false);
      showAlert('success', 'Müvekkil başarıyla güncellendi.');
    } catch (error: any) {
      console.error('Error updating client:', error);
      const errorMessage = error.response?.data?.message || 'Müvekkil güncellenirken bir hata oluştu. Lütfen tekrar deneyiniz.';
      showAlert('error', errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await clientsApi.delete(params.id as string);
      router.push('/clients');
      showAlert('success', 'Müvekkil başarıyla silindi.');
    } catch (error: any) {
      console.error('Error deleting client:', error);
      const errorMessage = error.response?.data?.message || 'Müvekkil silinirken bir hata oluştu. Lütfen tekrar deneyiniz.';
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

  if (!client) {
    return (
      <MainLayout showAIPanel={true}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Müşteri bulunamadı</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showAIPanel={true}>
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:mr-80 md:mr-64 mr-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <button onClick={() => router.push('/clients')} className="hover:text-gray-900">
                Müvekkiller
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">Müvekkil Detay</span>
            </div>

            {/* Client Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Profile Photo */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {client.firstName[0]}{client.lastName[0]}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {client.firstName} {client.lastName}
                  </h1>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {client.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Aktif
                    </Badge>
                    <span className="text-sm text-gray-500">
                      TC: {client.nationalId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Ara
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  E-posta
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Kopyala
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Düzenle
                </Button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 mt-6">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Dava
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Görev Oluştur
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Belge Yükle
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Toplantı Planla
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Raporu Oluştur
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="px-8 py-6 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-500">İlişki Puanı</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">85</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-500">Açık Davalar</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-500">Kapalı Davalar</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-500">Toplam Gelir</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">₺125K</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-gray-500">Bakiye</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">₺15K</div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-500">Son İletişim</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">5g</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-8 py-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Müşteri Bilgileri</CardTitle>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-500">Ad</label>
                          <Input
                            value={editForm.firstName || ''}
                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-500">Soyad</label>
                          <Input
                            value={editForm.lastName || ''}
                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-500">E-posta</label>
                          <Input
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-500">Telefon</label>
                          <Input
                            value={editForm.phoneNumber || ''}
                            onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-500">TC Kimlik No</label>
                          <Input
                            value={editForm.nationalId || ''}
                            onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-500">Vergi No</label>
                          <Input
                            value={editForm.taxNumber || ''}
                            onChange={(e) => setEditForm({ ...editForm, taxNumber: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm text-gray-500">Adres</label>
                          <Input
                            value={editForm.address || ''}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-sm text-gray-500">Notlar</label>
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">Ad Soyad</label>
                          <p className="text-gray-900 font-medium">{client.firstName} {client.lastName}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">TC Kimlik No</label>
                          <p className="text-gray-900 font-medium">{client.nationalId || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">E-posta</label>
                          <p className="text-gray-900 font-medium">{client.email || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">Telefon</label>
                          <p className="text-gray-900 font-medium">{client.phoneNumber || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm text-gray-500 mb-1 block">Adres</label>
                          <p className="text-gray-900 font-medium">{client.address || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">Kayıt Tarihi</label>
                          <p className="text-gray-900 font-medium">{new Date(client.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Cases */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Son Davalar</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('cases')}>
                        Tümünü Gör
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cases.slice(0, 3).map((caseItem) => (
                        <div key={caseItem.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{caseItem.caseNumber}</span>
                                <Badge className={cn(
                                  'text-xs',
                                  caseItem.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                  caseItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                )}>
                                  {caseItem.status === 'ACTIVE' ? 'Aktif' : 
                                   caseItem.status === 'PENDING' ? 'Beklemede' : 'Kapalı'}
                                </Badge>
                              </div>
                              <h4 className="text-sm font-medium text-gray-900">{caseItem.title}</h4>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{caseItem.courtName}</span>
                            <span>•</span>
                            <span>{new Date(caseItem.startDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Documents */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Son Belgeler</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('documents')}>
                        Tümünü Gör
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                              <p className="text-xs text-gray-500">{doc.fileName}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {doc.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(doc.createdAt).toLocaleDateString('tr-TR')}</span>
                            <span>•</span>
                            <span>{(doc.size / 1024).toFixed(0)} KB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Cases Tab */}
            {activeTab === 'cases' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Dava ara..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrele
                  </Button>
                </div>

                <div className="space-y-3">
                  {cases.map((caseItem) => (
                    <Card key={caseItem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-semibold text-gray-900">{caseItem.caseNumber}</span>
                              <Badge className={cn(
                                'text-xs',
                                caseItem.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                caseItem.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              )}>
                                {caseItem.status === 'ACTIVE' ? 'Aktif' : 
                                 caseItem.status === 'PENDING' ? 'Beklemede' : 'Kapalı'}
                              </Badge>
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                {caseItem.priority === 'critical' ? 'Kritik' :
                                 caseItem.priority === 'high' ? 'Yüksek' :
                                 caseItem.priority === 'medium' ? 'Orta' : 'Düşük'}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{caseItem.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{caseItem.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="w-4 h-4" />
                                <span className="truncate">{caseItem.courtName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4" />
                                <span>{caseItem.assignedLawyer}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(caseItem.startDate).toLocaleDateString('tr-TR')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <TrendingUp className="w-4 h-4" />
                                <span>%{caseItem.successProbability} başarı</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Sparkles className="w-4 h-4 mr-2" />
                              AI Analizi
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Belge ara..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrele
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">{doc.name}</h4>
                            <p className="text-xs text-gray-500 mb-3 truncate">{doc.fileName}</p>
                            <Badge className="bg-blue-100 text-blue-700 text-xs mb-3">
                              {doc.category}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>{new Date(doc.createdAt).toLocaleDateString('tr-TR')}</span>
                          <span>{(doc.size / 1024).toFixed(0)} KB</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Özet
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            İndir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                        <p className="text-sm text-gray-500 mb-4">Bu müvekkile avukat atamak için yukarıdaki butonu kullanın.</p>
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
                                <Badge className={
                                  lawyer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }>
                                  {lawyer.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
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
                                  clientsApi.removeLawyer(params.id as string, lawyer.userId, reason).then(() => {
                                    fetchClientData();
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
                            {availableUsers
                              .filter(user => 
                                user.roles && 
                                user.roles.includes('LAWYER') &&
                                !lawyers.some(lawyer => lawyer.userId === user.id && lawyer.status === 'ACTIVE')
                              )
                              .map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.firstName} {user.lastName}
                                </option>
                              ))}
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
                              const isPrimary = (document.getElementById('is-primary') as HTMLInputElement).checked;
                              const reason = (document.getElementById('reason-input') as HTMLTextAreaElement).value;
                              
                              console.log('Assigning lawyer:', { lawyerId, isPrimary, reason, currentLawyers: lawyers });
                              
                              if (!lawyerId) {
                                showAlert('error', 'Lütfen bir avukat seçin.');
                                return;
                              }

                              try {
                                await clientsApi.assignLawyer(params.id as string, {
                                  userId: lawyerId,
                                  isPrimary,
                                  reason
                                });
                                fetchClientData();
                                setShowAssignLawyerDialog(false);
                                showAlert('success', 'Avukat başarıyla atandı.');
                              } catch (error: any) {
                                console.error('Assignment error:', error);
                                showAlert('error', error.response?.data?.message || 'Avukat atanırken bir hata oluştu.');
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

            {/* Communications Tab */}
            {activeTab === 'communications' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="İletişim ara..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Yeni İletişim
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, type: 'email', direction: 'incoming', subject: 'Dava Durumu Hakkında', content: 'Sayın müvekkilimiz, davanızın son durumu hakkında bilgi vermek istiyorum...', date: '2024-07-15', status: 'read' },
                    { id: 2, type: 'phone', direction: 'outgoing', subject: 'Telefon Görüşmesi', content: 'Müvekkil ile duruşma tarihi hakkında görüşme yapıldı...', date: '2024-07-14', status: 'completed' },
                    { id: 3, type: 'email', direction: 'outgoing', subject: 'Belge Talebi', content: 'Lütfen aşağıdaki belgeleri göndermenizi rica ederim...', date: '2024-07-13', status: 'sent' },
                    { id: 4, type: 'meeting', direction: 'incoming', subject: 'Ofis Görüşmesi', content: 'Ofisimize gelerek detayları görüşebiliriz...', date: '2024-07-12', status: 'scheduled' },
                  ].map((comm) => (
                    <Card key={comm.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            comm.type === 'email' ? 'bg-blue-100' :
                            comm.type === 'phone' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                            {comm.type === 'email' && <Mail className="w-5 h-5 text-blue-600" />}
                            {comm.type === 'phone' && <Phone className="w-5 h-5 text-green-600" />}
                            {comm.type === 'meeting' && <User className="w-5 h-5 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{comm.subject}</h4>
                              <Badge className={
                                comm.direction === 'incoming' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }>
                                {comm.direction === 'incoming' ? 'Gelen' : 'Giden'}
                              </Badge>
                              <Badge className={
                                comm.status === 'read' ? 'bg-gray-100 text-gray-700' :
                                comm.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                comm.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {comm.status === 'read' ? 'Okundu' :
                                 comm.status === 'sent' ? 'Gönderildi' :
                                 comm.status === 'completed' ? 'Tamamlandı' :
                                 'Planlandı'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{comm.content}</p>
                            <p className="text-xs text-gray-500">{new Date(comm.date).toLocaleDateString('tr-TR')}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Görev ara..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Görev
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, title: 'Dava dilekçesi hazırla', description: '2024/1234 numaralı dava için dilekçe hazırlanacak', dueDate: '2024-07-25', priority: 'high', status: 'pending' },
                    { id: 2, title: 'Müvekkil görüşmesi', description: 'Ahmet Yılmaz ile ön görüşme', dueDate: '2024-07-23', priority: 'medium', status: 'in_progress' },
                    { id: 3, title: 'Delil toplama', description: 'Tanıkların beyanları alınacak', dueDate: '2024-07-20', priority: 'high', status: 'completed' },
                    { id: 4, title: 'Mahkeme kararı inceleme', description: 'Temyiz kararı incelenecek', dueDate: '2024-07-28', priority: 'low', status: 'pending' },
                  ].map((task) => (
                    <Card key={task.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            task.status === 'completed' ? 'bg-green-500 border-green-500' :
                            task.status === 'in_progress' ? 'bg-blue-500 border-blue-500' :
                            'border-gray-300'
                          }`}>
                            {task.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{task.title}</h4>
                              <Badge className={
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }>
                                {task.priority === 'high' ? 'Yüksek' :
                                 task.priority === 'medium' ? 'Orta' : 'Düşük'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.status === 'completed' ? 'Tamamlandı' :
                                 task.status === 'in_progress' ? 'Devam Ediyor' : 'Beklemede'}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Toplam Fatura</span>
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">₺125,000</p>
                      <p className="text-xs text-gray-500 mt-1">Toplam fatura tutarı</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Ödenen</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">₺85,000</p>
                      <p className="text-xs text-gray-500 mt-1">Ödenen tutar</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Bekleyen</span>
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-orange-600">₺40,000</p>
                      <p className="text-xs text-gray-500 mt-1">Bekleyen tutar</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Fatura ara..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Fatura
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, invoiceNumber: 'INV-2024-001', amount: 25000, status: 'paid', dueDate: '2024-07-15', paidDate: '2024-07-10' },
                    { id: 2, invoiceNumber: 'INV-2024-002', amount: 35000, status: 'pending', dueDate: '2024-07-25', paidDate: null },
                    { id: 3, invoiceNumber: 'INV-2024-003', amount: 15000, status: 'paid', dueDate: '2024-07-05', paidDate: '2024-07-01' },
                    { id: 4, invoiceNumber: 'INV-2024-004', amount: 50000, status: 'overdue', dueDate: '2024-07-10', paidDate: null },
                  ].map((invoice) => (
                    <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              invoice.status === 'paid' ? 'bg-green-100' :
                              invoice.status === 'pending' ? 'bg-yellow-100' :
                              'bg-red-100'
                            }`}>
                              {invoice.status === 'paid' && <CheckCircle className="w-5 h-5 text-green-600" />}
                              {invoice.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                              {invoice.status === 'overdue' && <AlertCircle className="w-5 h-5 text-red-600" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h4>
                              <p className="text-sm text-gray-500">
                                Son Tarih: {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₺{invoice.amount.toLocaleString('tr-TR')}</p>
                            <Badge className={
                              invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {invoice.status === 'paid' ? 'Ödendi' :
                               invoice.status === 'pending' ? 'Beklemede' : 'Gecikmiş'}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Timeline ara..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrele
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6">
                    {[
                      { id: 1, action: 'Müşteri oluşturuldu', details: 'Yeni müşteri kaydı oluşturuldu', date: '2024-07-20', type: 'client' },
                      { id: 2, action: 'Dava oluşturuldu', details: '2024/1234 numaralı dava oluşturuldu', date: '2024-07-18', type: 'case' },
                      { id: 3, action: 'Belge yüklendi', details: 'Dava dilekçesi yüklendi', date: '2024-07-17', type: 'document' },
                      { id: 4, action: 'Görüşme yapıldı', details: 'Müşteri ile telefon görüşmesi', date: '2024-07-15', type: 'communication' },
                      { id: 5, action: 'Ödeme alındı', details: '₺15,000 ödeme alındı', date: '2024-07-10', type: 'financial' },
                      { id: 6, action: 'Duruşma planlandı', details: '21.07.2026 tarihinde duruşma', date: '2024-07-05', type: 'hearing' },
                    ].map((event, index) => (
                      <div key={event.id} className="relative pl-10">
                        <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                          event.type === 'client' ? 'bg-blue-500 border-blue-500' :
                          event.type === 'case' ? 'bg-purple-500 border-purple-500' :
                          event.type === 'document' ? 'bg-green-500 border-green-500' :
                          event.type === 'communication' ? 'bg-yellow-500 border-yellow-500' :
                          event.type === 'financial' ? 'bg-red-500 border-red-500' :
                          'bg-gray-500 border-gray-500'
                        }`}></div>
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">{event.action}</h4>
                                <p className="text-sm text-gray-600">{event.details}</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(event.date).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Not ara..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Not
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 1, title: 'Ön görüşme notları', content: 'Müşteri ile yapılan ön görüşmede dava detayları konuşuldu...', date: '2024-07-15', author: 'Admin' },
                    { id: 2, title: 'Dava stratejisi', content: 'Dava için belirlenen strateji: Önce tanıkların dinlenmesi...', date: '2024-07-14', author: 'Admin' },
                    { id: 3, title: 'Önemli hatırlatmalar', content: 'Müşterinin özel durumu: Tıbbi raporların güncellenmesi gerekiyor...', date: '2024-07-13', author: 'Admin' },
                    { id: 4, title: 'Sonraki adımlar', content: 'Duruşma öncesi yapılacaklar: Delillerin hazırlanması...', date: '2024-07-12', author: 'Admin' },
                  ].map((note) => (
                    <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900 mb-1">{note.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{note.author}</span>
                          <span>{new Date(note.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai-insights' && (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Müvekkil AI Analizi</h3>
                        <p className="text-sm text-gray-600">AI tarafından oluşturulan öngörüler</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">İlişki Skoru: 85/100</p>
                          <p className="text-xs text-gray-600">Güçlü ve uzun süreli ilişki</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Gelir Trendi: Artış</p>
                          <p className="text-xs text-gray-600">Son 6 ayda %25 artış</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Risk Faktörü: Düşük</p>
                          <p className="text-xs text-gray-600">Ödeme geçmişi düzenli</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Önerileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { id: 1, title: 'Dava öncesi hazırlık', description: 'Yaklaşan duruşma için ek delil toplanması önerilir', priority: 'high' },
                        { id: 2, title: 'Ödeme yapısı', description: 'Müşteriye esnek ödeme planı sunulabilir', priority: 'medium' },
                        { id: 3, title: 'İletişim sıklığı', description: 'Düzenli durum güncellemeleri müşteri memnuniyetini artırır', priority: 'low' },
                      ].map((recommendation) => (
                        <div key={recommendation.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                            <Badge className={
                              recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {recommendation.priority === 'high' ? 'Yüksek' :
                               recommendation.priority === 'medium' ? 'Orta' : 'Düşük'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{recommendation.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== 'overview' && activeTab !== 'cases' && activeTab !== 'documents' && activeTab !== 'communications' && activeTab !== 'tasks' && activeTab !== 'financial' && activeTab !== 'timeline' && activeTab !== 'notes' && activeTab !== 'ai-insights' && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <p className="text-gray-500">Bu özellik yakında eklenecek</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Müvekkili Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu müvekkili silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
