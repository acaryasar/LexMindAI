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
  MessageSquare, CheckCircle, XCircle, MoreVertical, Filter
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
  const [availableLawyers, setAvailableLawyers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
      
      const [clientData, casesData, documentsData, lawyersData, lawyersList] = await Promise.all([
        clientsApi.getById(params.id as string),
        casesApi.getByClient(params.id as string),
        documentsApi.getByClient(params.id as string),
        clientsApi.getLawyers(params.id as string),
        usersApi.getLawyers()
      ]);
      
      setClient(clientData);
      setCases(casesData);
      setDocuments(documentsData);
      setLawyers(lawyersData);
      
      // Filter out already assigned lawyers
      const assignedLawyerIds = lawyersData.map((l: ClientLawyer) => l.userId);
      const availableLawyersList = lawyersList.filter((lawyer: UserType) => !assignedLawyerIds.includes(lawyer.id));
      setAvailableLawyers(availableLawyersList);
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-6 lg:mr-80 md:mr-64 mr-0">
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
                  <p className="text-xs text-gray-500 mb-2 text-center">İlişki Puanı</p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">85</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-2 text-center">Açık Davalar</p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">3</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-2 text-center">Kapalı Davalar</p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">12</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-2 text-center">Toplam Gelir</p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">₺125K</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-2 text-center">Bakiye</p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">₺15K</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500 mb-2 text-center">Son İletişim</p>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">5g</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-8 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-1 flex-wrap">
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
                    <CardTitle className="text-lg">Müşteri Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Ad Soyad</label>
                        <p className="text-gray-900 font-medium">{client.firstName} {client.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">TC Kimlik No</label>
                        <p className="text-gray-900 font-medium">{client.nationalId}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">E-posta</label>
                        <p className="text-gray-900 font-medium">{client.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Telefon</label>
                        <p className="text-gray-900 font-medium">{client.phoneNumber}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-gray-500 mb-1 block">Adres</label>
                        <p className="text-gray-900 font-medium">{client.address}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Müşteri Türü</label>
                        <p className="text-gray-900 font-medium">{client.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Kayıt Tarihi</label>
                        <p className="text-gray-900 font-medium">{new Date(client.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
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
                            {availableLawyers.map((lawyer: UserType) => (
                              <option key={lawyer.id} value={lawyer.id}>
                                {lawyer.firstName} {lawyer.lastName}
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

            {/* Other tabs placeholder */}
            {activeTab !== 'overview' && activeTab !== 'cases' && activeTab !== 'documents' && activeTab !== 'lawyers' && (
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
    </MainLayout>
  );
}
