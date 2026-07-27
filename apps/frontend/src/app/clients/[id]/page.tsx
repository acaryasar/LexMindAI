'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  const [selectedLawyerId, setSelectedLawyerId] = useState('');
  const [isPrimaryLawyer, setIsPrimaryLawyer] = useState(false);
  const [assignmentReason, setAssignmentReason] = useState('');

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: User },
    { id: 'cases', label: 'Davalar', icon: FileText },
    { id: 'documents', label: 'Belgeler', icon: FileText },
    { id: 'lawyers', label: 'Avukatlar', icon: User },
    { id: 'communications', label: 'İletişimler', icon: MessageSquare },
    { id: 'meetings', label: 'Toplantılar', icon: Calendar },
    { id: 'tasks', label: 'Görevler', icon: CheckCircle },
    { id: 'financial', label: 'Finansal', icon: DollarSign },
    { id: 'timeline', label: 'Zaman Çizelgesi', icon: Clock },
    { id: 'notes', label: 'Notlar', icon: FileText },
    { id: 'ai-insights', label: 'AI İçgörüleri', icon: Brain },
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/clients')}>
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {client.firstName} {client.lastName}
                  </h1>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    {client.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Aktif
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  TC: {client.nationalId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Ara
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                E-posta
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
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

            <Card className="hover:shadow-lg transition-shadow">
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

            <Card className="hover:shadow-lg transition-shadow">
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

            <Card className="hover:shadow-lg transition-shadow">
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

            <Card className="hover:shadow-lg transition-shadow">
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

            <Card className="hover:shadow-lg transition-shadow">
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

          {/* Tabs */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center space-x-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle>Genel Bakış</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Bilgileri</h3>
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
                </div>

                {/* Recent Cases */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Son Davalar</h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('cases')}>
                      Tümünü Gör
                    </Button>
                  </div>
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
                </div>

                {/* Recent Documents */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Son Belgeler</h3>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('documents')}>
                      Tümünü Gör
                    </Button>
                  </div>
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cases Tab */}
          {activeTab === 'cases' && (
            <Card>
              <CardHeader>
                <CardTitle>Davalar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <Card>
              <CardHeader>
                <CardTitle>Belgeler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* Lawyers Tab */}
          {activeTab === 'lawyers' && (
            <Card>
              <CardHeader>
                <CardTitle>Avukatlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Dialog open={showAssignLawyerDialog} onOpenChange={setShowAssignLawyerDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Avukat Ata</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Avukat Seç</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={selectedLawyerId}
                          onChange={(e) => setSelectedLawyerId(e.target.value)}
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
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is-primary"
                            className="w-4 h-4"
                            checked={isPrimaryLawyer}
                            onChange={(e) => setIsPrimaryLawyer(e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-600">Bu avukatı ana avukat olarak işaretle</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Atama Nedeni</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Atama nedenini girin..."
                          value={assignmentReason}
                          onChange={(e) => setAssignmentReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAssignLawyerDialog(false);
                          setSelectedLawyerId('');
                          setIsPrimaryLawyer(false);
                          setAssignmentReason('');
                        }}
                      >
                        İptal
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!selectedLawyerId) {
                            showAlert('error', 'Lütfen bir avukat seçin.');
                            return;
                          }

                          try {
                            await clientsApi.assignLawyer(params.id as string, {
                              userId: selectedLawyerId,
                              isPrimary: isPrimaryLawyer,
                              reason: assignmentReason
                            });
                            fetchClientData();
                            setShowAssignLawyerDialog(false);
                            setSelectedLawyerId('');
                            setIsPrimaryLawyer(false);
                            setAssignmentReason('');
                            showAlert('success', 'Avukat başarıyla atandı.');
                          } catch (error) {
                            showAlert('error', 'Avukat atanırken bir hata oluştu.');
                          }
                        }}
                      >
                        Ata
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
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
      
    </MainLayout>
  );
}
