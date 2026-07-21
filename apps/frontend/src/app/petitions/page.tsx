'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  MoreVertical,
  ScrollText,
  FileText,
  Download,
  Mail,
  Printer,
  Brain,
  TrendingUp,
  TrendingDown,
  Filter,
  X,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Copy,
  Star,
  Archive,
  Upload,
  Download as DownloadIcon,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Petition, PetitionKPI, PetitionFilter } from '@/types/petition';

// Dummy Data
const dummyKPI: PetitionKPI = {
  total: 156,
  draft: 23,
  inReview: 18,
  completed: 89,
  todayCreated: 5,
  awaitingSignature: 12,
  awaitingUYAP: 8,
  aiGenerated: 67,
  trend: {
    total: 12,
    draft: -5,
    inReview: 8,
    completed: 15,
    aiGenerated: 22,
  },
};

const dummyPetitions: Petition[] = [
  {
    id: '1',
    name: 'İş Kazası Tazminat Dilekçesi',
    type: 'TAZMINAT_DILEKCESI',
    status: 'COMPLETED',
    priority: 'HIGH',
    caseId: 'CASE-001',
    caseNumber: '2024/123',
    courtName: 'İstanbul 1. İş Mahkemesi',
    judge: 'Ahmet Yılmaz',
    essenceNo: '2024/123 E.',
    decisionNo: '2024/456 K.',
    clientId: 'CLIENT-001',
    clientName: 'Mehmet Demir',
    subject: 'İş kazası nedeniyle maddi ve manevi tazminat talebi',
    content: 'Dilekçe içeriği...',
    parties: [
      { id: '1', name: 'Mehmet Demir', type: 'PLAINTIFF', role: 'Davacı' },
      { id: '2', name: 'ABC A.Ş.', type: 'DEFENDANT', role: 'Davalı' },
    ],
    evidence: [
      { id: '1', type: 'Rapor', description: 'Adli Tıp Raporu' },
      { id: '2', type: 'Belge', description: 'İşe giriş bildirgesi' },
    ],
    claims: [
      { id: '1', description: 'Maddi tazminat', amount: 150000, currency: 'TL' },
      { id: '2', description: 'Manevi tazminat', amount: 50000, currency: 'TL' },
    ],
    preparedBy: 'Av. Ayşe Kaya',
    preparedAt: '2024-07-15T10:00:00',
    updatedAt: '2024-07-18T14:30:00',
    dueDate: '2024-07-25',
    currentVersion: 'v2.1',
    versions: [
      { id: '1', version: 'v1.0', createdAt: '2024-07-15', createdBy: 'Av. Ayşe Kaya', changes: 'İlk versiyon', fileUrl: '' },
      { id: '2', version: 'v2.0', createdAt: '2024-07-17', createdBy: 'Av. Ayşe Kaya', changes: 'Deliller eklendi', fileUrl: '' },
      { id: '3', version: 'v2.1', createdAt: '2024-07-18', createdBy: 'Av. Ayşe Kaya', changes: 'Talepler güncellendi', fileUrl: '' },
    ],
    attachments: [
      { id: '1', name: 'adli_tip_raporu.pdf', type: 'application/pdf', size: 2456789, url: '', uploadedAt: '2024-07-15' },
    ],
    isAIGenerated: true,
    aiSuggestions: ['Hukuki dayanak güçlendirilebilir', 'Yargıtay kararı eklenebilir'],
    aiRiskAnalysis: 'Düşük risk',
    tags: ['İş Hukuku', 'Tazminat', 'Acil'],
    isElectronicallySigned: true,
    signedAt: '2024-07-18T16:00:00',
    signedBy: 'Av. Ayşe Kaya',
    isUYAPSubmitted: false,
    exportFormats: ['PDF', 'WORD', 'UYAP'],
  },
  {
    id: '2',
    name: 'Boşanma Davası Cevap Dilekçesi',
    type: 'CEVAP_DILEKCESI',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    caseId: 'CASE-002',
    caseNumber: '2024/456',
    courtName: 'İstanbul 2. Aile Mahkemesi',
    judge: 'Fatma Şahin',
    essenceNo: '2024/456 E.',
    decisionNo: '',
    clientId: 'CLIENT-002',
    clientName: 'Ayşe Yılmaz',
    subject: 'Boşanma davasına cevap dilekçesi',
    content: 'Dilekçe içeriği...',
    parties: [
      { id: '1', name: 'Ayşe Yılmaz', type: 'DEFENDANT', role: 'Davalı' },
      { id: '2', name: 'Ali Yılmaz', type: 'PLAINTIFF', role: 'Davacı' },
    ],
    evidence: [],
    claims: [],
    preparedBy: 'Av. Mehmet Öz',
    preparedAt: '2024-07-19T09:00:00',
    updatedAt: '2024-07-20T11:15:00',
    dueDate: '2024-07-28',
    currentVersion: 'v1.0',
    versions: [
      { id: '1', version: 'v1.0', createdAt: '2024-07-19', createdBy: 'Av. Mehmet Öz', changes: 'İlk versiyon', fileUrl: '' },
    ],
    attachments: [],
    isAIGenerated: false,
    tags: ['Aile Hukuku', 'Boşanma'],
    isElectronicallySigned: false,
    isUYAPSubmitted: false,
    exportFormats: ['PDF', 'WORD'],
  },
  {
    id: '3',
    name: 'İstinaf Dilekçesi',
    type: 'ISTINAF_DILEKCESI',
    status: 'DRAFT',
    priority: 'URGENT',
    caseId: 'CASE-003',
    caseNumber: '2023/789',
    courtName: 'İstanbul Bölge Adliye Mahkemesi 1. Hukuk Dairesi',
    judge: 'Mustafa Çelik',
    essenceNo: '2023/789 E.',
    decisionNo: '2023/1234 K.',
    clientId: 'CLIENT-003',
    clientName: 'Şirket A.Ş.',
    subject: 'Ticari davaya karşı istinaf dilekçesi',
    content: 'Dilekçe içeriği...',
    parties: [
      { id: '1', name: 'Şirket A.Ş.', type: 'PLAINTIFF', role: 'İstinaf Eden' },
      { id: '2', name: 'Şirket B.Ş.', type: 'DEFENDANT', role: 'Karşı Taraf' },
    ],
    evidence: [],
    claims: [],
    preparedBy: 'Av. Zeynep Ak',
    preparedAt: '2024-07-20T14:00:00',
    updatedAt: '2024-07-21T09:30:00',
    dueDate: '2024-07-22',
    currentVersion: 'v0.5',
    versions: [
      { id: '1', version: 'v0.5', createdAt: '2024-07-20', createdBy: 'Av. Zeynep Ak', changes: 'Taslak', fileUrl: '' },
    ],
    attachments: [],
    isAIGenerated: true,
    aiSuggestions: ['Eksik hukuki dayanak bulundu', 'Deliller güçlendirilebilir'],
    aiRiskAnalysis: 'Orta risk',
    tags: ['Ticaret Hukuku', 'İstinaf', 'Acil'],
    isElectronicallySigned: false,
    isUYAPSubmitted: false,
    exportFormats: ['PDF', 'WORD', 'UYAP'],
  },
  {
    id: '4',
    name: 'Temyiz Dilekçesi',
    type: 'TEMYIZ_DILEKCESI',
    status: 'SIGNED',
    priority: 'HIGH',
    caseId: 'CASE-004',
    caseNumber: '2022/345',
    courtName: 'Yargıtay 1. Hukuk Dairesi',
    judge: 'Hüseyin Demir',
    essenceNo: '2022/345 E.',
    decisionNo: '2023/567 K.',
    clientId: 'CLIENT-004',
    clientName: 'Ahmet Kaya',
    subject: 'Tapu iptal ve tescil davası temyizi',
    content: 'Dilekçe içeriği...',
    parties: [
      { id: '1', name: 'Ahmet Kaya', type: 'PLAINTIFF', role: 'Temyiz Eden' },
      { id: '2', name: 'Belediye', type: 'DEFENDANT', role: 'Karşı Taraf' },
    ],
    evidence: [],
    claims: [],
    preparedBy: 'Av. Selin Yıldız',
    preparedAt: '2024-07-10T10:00:00',
    updatedAt: '2024-07-15T16:00:00',
    dueDate: '2024-07-20',
    currentVersion: 'v1.0',
    versions: [
      { id: '1', version: 'v1.0', createdAt: '2024-07-10', createdBy: 'Av. Selin Yıldız', changes: 'İlk versiyon', fileUrl: '' },
    ],
    attachments: [],
    isAIGenerated: true,
    tags: ['Gayrimenkul', 'Temyiz'],
    isElectronicallySigned: true,
    signedAt: '2024-07-18T10:00:00',
    signedBy: 'Av. Selin Yıldız',
    isUYAPSubmitted: true,
    uyapSubmittedAt: '2024-07-18T11:00:00',
    uyapReference: 'UYAP-2024-789456',
    exportFormats: ['PDF', 'WORD', 'UYAP'],
  },
  {
    id: '5',
    name: 'İcra Takibi Başvurusu',
    type: 'ICRA_DILEKCESI',
    status: 'SUBMITTED',
    priority: 'MEDIUM',
    caseId: 'CASE-005',
    caseNumber: '2024/567',
    courtName: 'İstanbul 15. İcra Dairesi',
    judge: '',
    essenceNo: '',
    decisionNo: '',
    clientId: 'CLIENT-005',
    clientName: 'Firma X Ltd.',
    subject: 'Alacak icra takibi başlatma',
    content: 'Dilekçe içeriği...',
    parties: [
      { id: '1', name: 'Firma X Ltd.', type: 'PLAINTIFF', role: 'Alacaklı' },
      { id: '2', name: 'Firma Y Ltd.', type: 'DEFENDANT', role: 'Borçlu' },
    ],
    evidence: [],
    claims: [],
    preparedBy: 'Av. Can Erkin',
    preparedAt: '2024-07-18T11:00:00',
    updatedAt: '2024-07-18T11:00:00',
    dueDate: '2024-07-25',
    currentVersion: 'v1.0',
    versions: [
      { id: '1', version: 'v1.0', createdAt: '2024-07-18', createdBy: 'Av. Can Erkin', changes: 'İlk versiyon', fileUrl: '' },
    ],
    attachments: [],
    isAIGenerated: false,
    tags: ['İcra', 'Alacak'],
    isElectronicallySigned: false,
    isUYAPSubmitted: false,
    exportFormats: ['PDF', 'WORD'],
  },
];

export default function PetitionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPetitions, setSelectedPetitions] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<PetitionFilter>({});
  const [petitions, setPetitions] = useState<Petition[]>(dummyPetitions);
  const [kpi, setKPI] = useState<PetitionKPI>(dummyKPI);
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    IN_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    SIGNED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    SUBMITTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
  };

  const statusLabels = {
    DRAFT: 'Taslak',
    IN_REVIEW: 'İncelemede',
    COMPLETED: 'Tamamlandı',
    SIGNED: 'İmzalandı',
    SUBMITTED: 'Gönderildi',
    REJECTED: 'Reddedildi',
    ARCHIVED: 'Arşiv',
  };

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  const priorityLabels = {
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek',
    URGENT: 'Acil',
  };

  const typeLabels = {
    CEVAP_DILEKCESI: 'Cevap Dilekçesi',
    ISTINAF_DILEKCESI: 'İstinaf Dilekçesi',
    TEMYIZ_DILEKCESI: 'Temyiz Dilekçesi',
    ICRA_DILEKCESI: 'İcra Dilekçesi',
    CEZA_DILEKCESI: 'Ceza Dilekçesi',
    IS_HUKUKU_DILEKCESI: 'İş Hukuku Dilekçesi',
    BOSANMA_DILEKCESI: 'Boşanma Dilekçesi',
    TICARET_DILEKCESI: 'Ticaret Dilekçesi',
    TAZMINAT_DILEKCESI: 'Tazminat Dilekçesi',
    IHTIATI_TEDBIR_DILEKCESI: 'İhtiyati Tedbir Dilekçesi',
    AYM_DILEKCESI: 'AYM Dilekçesi',
    AIHM_DILEKCESI: 'AİHM Dilekçesi',
    OFIS_DILEKCESI: 'Ofis Dilekçesi',
    UYAP_DILEKCESI: 'UYAP Dilekçesi',
    DIGER: 'Diğer',
  };

  const filteredPetitions = petitions.filter((petition) => {
    const matchesSearch =
      petition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petition.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petition.courtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petition.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !filters.status || petition.status === filters.status;
    const matchesType = !filters.type || petition.type === filters.type;
    const matchesAIGenerated = filters.isAIGenerated === undefined || petition.isAIGenerated === filters.isAIGenerated;

    return matchesSearch && matchesStatus && matchesType && matchesAIGenerated;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPetitions(filteredPetitions.map((p) => p.id));
    } else {
      setSelectedPetitions([]);
    }
  };

  const handleSelectPetition = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPetitions([...selectedPetitions, id]);
    } else {
      setSelectedPetitions(selectedPetitions.filter((p) => p !== id));
    }
  };

  const handleRowClick = (petition: Petition) => {
    setSelectedPetition(petition);
    setShowPreviewPanel(true);
  };

  const KPICard = ({ title, value, subtitle, trend, icon: Icon }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>
          <div className="flex flex-col items-end">
            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {trend !== undefined && (
              <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span className="text-sm font-medium">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout showAIPanel={true}>
      <div className="space-y-6 lg:mr-80 md:mr-64 mr-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <ScrollText className="w-8 h-8 mr-3" />
              Dilekçeler
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Dava dosyalarına ait tüm dilekçeleri yönetin.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              İçe Aktar
            </Button>
            <Button variant="outline" size="sm">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button onClick={() => router.push('/petitions/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Dilekçe
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Toplam Dilekçe"
            value={kpi.total}
            subtitle="Toplam kayıt"
            trend={kpi.trend.total}
            icon={FileText}
          />
          <KPICard
            title="Taslak"
            value={kpi.draft}
            subtitle="Hazırlanıyor"
            trend={kpi.trend.draft}
            icon={ScrollText}
          />
          <KPICard
            title="İncelemede"
            value={kpi.inReview}
            subtitle="İmza bekliyor"
            trend={kpi.trend.inReview}
            icon={Eye}
          />
          <KPICard
            title="Tamamlandı"
            value={kpi.completed}
            subtitle="Gönderildi"
            trend={kpi.trend.completed}
            icon={Check}
          />
          <KPICard
            title="Bugün Oluşturulan"
            value={kpi.todayCreated}
            subtitle="Yeni kayıt"
            icon={Plus}
          />
          <KPICard
            title="İmza Bekleyen"
            value={kpi.awaitingSignature}
            subtitle="E-imza bekliyor"
            icon={Star}
          />
          <KPICard
            title="UYAP Bekleyen"
            value={kpi.awaitingUYAP}
            subtitle="Gönderilecek"
            icon={Upload}
          />
          <KPICard
            title="AI ile Oluşturulan"
            value={kpi.aiGenerated}
            subtitle="Yapay zeka"
            trend={kpi.trend.aiGenerated}
            icon={Brain}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Dilekçe ara..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtreler
                {showFilterPanel && <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>
              {selectedPetitions.length > 0 && (
                <Badge variant="secondary">{selectedPetitions.length} seçildi</Badge>
              )}
            </div>

            {showFilterPanel && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Durum
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                      value={filters.status || ''}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                    >
                      <option value="">Tümü</option>
                      <option value="DRAFT">Taslak</option>
                      <option value="IN_REVIEW">İncelemede</option>
                      <option value="COMPLETED">Tamamlandı</option>
                      <option value="SIGNED">İmzalandı</option>
                      <option value="SUBMITTED">Gönderildi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Dilekçe Türü
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                      value={filters.type || ''}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                    >
                      <option value="">Tümü</option>
                      <option value="CEVAP_DILEKCESI">Cevap Dilekçesi</option>
                      <option value="ISTINAF_DILEKCESI">İstinaf Dilekçesi</option>
                      <option value="TEMYIZ_DILEKCESI">Temyiz Dilekçesi</option>
                      <option value="ICRA_DILEKCESI">İcra Dilekçesi</option>
                      <option value="TAZMINAT_DILEKCESI">Tazminat Dilekçesi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      AI ile Oluşturuldu
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                      value={filters.isAIGenerated === undefined ? '' : filters.isAIGenerated.toString()}
                      onChange={(e) => setFilters({ ...filters, isAIGenerated: e.target.value === 'true' })}
                    >
                      <option value="">Tümü</option>
                      <option value="true">Evet</option>
                      <option value="false">Hayır</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({})}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Filtreleri Temizle
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedPetitions.length === filteredPetitions.length && filteredPetitions.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Dilekçe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Müvekkil
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Dosya
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Mahkeme
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Tür
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Hazırlayan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Versiyon
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Son Güncelleme
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      AI
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPetitions.map((petition) => (
                    <tr
                      key={petition.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => handleRowClick(petition)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedPetitions.includes(petition.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectPetition(petition.id, e.target.checked);
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{petition.name}</p>
                            <p className="text-xs text-gray-500">{petition.subject}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {petition.clientName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {petition.caseNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {petition.courtName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {typeLabels[petition.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {petition.preparedBy}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {petition.currentVersion}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(petition.updatedAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[petition.status]}>
                          {statusLabels[petition.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {petition.isAIGenerated && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            <Brain className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/petitions/${petition.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/petitions/${petition.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Word
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="w-4 h-4 mr-2" />
                              Yazdır
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Brain className="w-4 h-4 mr-2" />
                              AI ile Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Şablona Kaydet
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Mail Gönder
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="w-4 h-4 mr-2" />
                              Arşivle
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPetitions.length === 0 && (
              <div className="text-center py-12">
                <ScrollText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || filters.status || filters.type
                    ? 'Arama sonucu bulunamadı'
                    : 'Henüz dilekçe eklenmemiş'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Preview Panel */}
      {showPreviewPanel && selectedPetition && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg overflow-y-auto z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dilekçe Önizleme
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowPreviewPanel(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Dilekçe Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Dilekçe Adı</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPetition.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Müvekkil</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPetition.clientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Dosya No</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPetition.caseNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Mahkeme</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPetition.courtName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Hakim</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPetition.judge || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Esas</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPetition.essenceNo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Karar</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPetition.decisionNo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Hazırlayan</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPetition.preparedBy}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Son Güncelleme</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedPetition.updatedAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Versiyon</p>
                    <Badge variant="outline">{selectedPetition.currentVersion}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Elektronik İmza</p>
                    {selectedPetition.isElectronicallySigned ? (
                      <Badge className="bg-green-100 text-green-700">İmzalandı</Badge>
                    ) : (
                      <Badge variant="outline">İmzalanmadı</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedPetition.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Ekler</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedPetition.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">{attachment.name}</span>
                        <span className="text-xs text-gray-500">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedPetition.isAIGenerated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Brain className="w-4 h-4 mr-2" />
                      Yapay Zeka Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedPetition.aiSuggestions?.map((suggestion, index) => (
                      <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-400">
                        {suggestion}
                      </div>
                    ))}
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-purple-700 dark:text-purple-400">
                      <p className="font-medium">Risk Analizi:</p>
                      <p>{selectedPetition.aiRiskAnalysis}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    PDF İndir
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Word İndir
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Printer className="w-4 h-4 mr-2" />
                    Yazdır
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Mail Gönder
                  </Button>
                  {!selectedPetition.isUYAPSubmitted && (
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      UYAP Paketi Oluştur
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
