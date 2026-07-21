'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
  Mail,
  Brain,
  Edit,
  Trash2,
  Copy,
  Archive,
  Upload,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Save,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  List,
  Heading,
  Link,
  Image,
  Sparkles,
  Check,
  AlertTriangle,
  Lightbulb,
  Zap,
  Target,
  Scale,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Petition, AIPetitionAnalysis } from '@/types/petition';

// Dummy petition data
const dummyPetition: Petition = {
  id: '1',
  name: 'İş Kazası Tazminat Dilekçesi',
  type: 'TAZMINAT_DILEKCESI',
  status: 'COMPLETED',
  priority: 'HIGH',
  caseId: 'CASE-001',
  caseNumber: '2024/123',
  courtName: 'İstanbul 1. İş Mahkemesi',
  judge: 'Ahmet Yılmaz',
  department: '1. İş Mahkemesi',
  essenceNo: '2024/123 E.',
  decisionNo: '2024/456 K.',
  clientId: 'CLIENT-001',
  clientName: 'Mehmet Demir',
  subject: 'İş kazası nedeniyle maddi ve manevi tazminat talebi',
  content: `İSTANBUL 1. İŞ MAHKEMESİ HAKİMLİĞİNE

Davacı : Mehmet Demir
Adres : İstanbul
Vekili : Av. Ayşe Kaya

Davalı : ABC A.Ş.
Adres : İstanbul

DAVA : İş kazası nedeniyle maddi ve manevi tazminat talebi

AÇIKLAMALAR :

1. Davacı, 01.01.2023 tarihinde davalı şirkette işe başlamıştır.
2. 15.06.2023 tarihinde işyerinde meydana gelen iş kazası sonucu yaralanmıştır.
3. Adli Tıp Raporu'na göre %40 sürekli iş göremezlik raporu almıştır.
4. Davalı işverenin güvenlik önlemlerini almadığı tespit edilmiştir.

SONUÇ : Açıklanan nedenlerle;
- Maddi tazminat talebi
- Manevi tazminat talebi
- Yargılama giderleri talebi
kabulle davanın kabulüne karar verilmesini saygılarımla arz ve talep ederim.

Davacı Vekili
Av. Ayşe Kaya`,
  parties: [
    { id: '1', name: 'Mehmet Demir', type: 'PLAINTIFF', role: 'Davacı', lawyer: 'Av. Ayşe Kaya' },
    { id: '2', name: 'ABC A.Ş.', type: 'DEFENDANT', role: 'Davalı' },
  ],
  evidence: [
    { id: '1', type: 'Adli Tıp Raporu', description: '%40 sürekli iş göremezlik', date: '2023-06-20' },
    { id: '2', type: 'İşe Giriş Bildirgesi', description: '01.01.2023 işe giriş', date: '2023-01-01' },
    { id: '3', type: 'Kaza Raporu', description: 'İş kazası tutanağı', date: '2023-06-15' },
  ],
  claims: [
    { id: '1', description: 'Maddi tazminat', amount: 150000, currency: 'TL', legalBasis: 'İş Kanunu md. 76' },
    { id: '2', description: 'Manevi tazminat', amount: 50000, currency: 'TL', legalBasis: 'Borçlar Kanunu md. 56' },
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
    { id: '2', name: 'ise_giris_bildirgesi.pdf', type: 'application/pdf', size: 1234567, url: '', uploadedAt: '2024-07-15' },
  ],
  isAIGenerated: true,
  aiSuggestions: ['Hukuki dayanak güçlendirilebilir', 'Yargıtay kararı eklenebilir', 'Deliller güçlendirilebilir'],
  aiRiskAnalysis: 'Düşük risk',
  tags: ['İş Hukuku', 'Tazminat', 'Acil'],
  isElectronicallySigned: true,
  signedAt: '2024-07-18T16:00:00',
  signedBy: 'Av. Ayşe Kaya',
  isUYAPSubmitted: false,
  exportFormats: ['PDF', 'WORD', 'UYAP'],
};

const dummyAIAnalysis: AIPetitionAnalysis = {
  suggestions: [
    {
      id: '1',
      type: 'LEGAL_BASIS',
      message: 'Eksik hukuki dayanak bulundu',
      severity: 'MEDIUM',
      suggestion: 'İş Kazası Tazminatında 6331 sayılı İş Sağlığı ve Güvenliği Kanunu\'nun ilgili maddeleri eklenmelidir.',
    },
    {
      id: '2',
      type: 'PRECEDENT',
      message: 'Yargıtay kararı eklenebilir',
      severity: 'LOW',
      suggestion: 'Yargıtay 21. Hukuk Dairesi\'nin benzer davalarla ilgili kararları referans alınabilir.',
    },
    {
      id: '3',
      type: 'EVIDENCE',
      message: 'Deliller güçlendirilebilir',
      severity: 'MEDIUM',
      suggestion: 'Kesinleşmiş SGK tespit dosyası ve iş kazası tutanağı delillere eklenmelidir.',
    },
    {
      id: '4',
      type: 'LANGUAGE',
      message: 'Hukuki dil güçlendirilebilir',
      severity: 'LOW',
      suggestion: 'Talep bölümü daha net ve somut hale getirilebilir.',
    },
  ],
  summary: 'Dilekçe genel olarak iyi yapılandırılmış. İş kazası tazminat davası için gerekli temel unsurlar mevcut. Ancak hukuki dayanaklar ve deliller kısmında güçlendirmeler yapılabilir.',
  riskLevel: 'LOW',
  strengths: [
    'Olay akışı net bir şekilde anlatılmış',
    'Deliller listelenmiş',
    'Talepler belirtilmiş',
    'Yasal dayanak kısmen belirtilmiş',
  ],
  weaknesses: [
    'Hukuki dayanaklar eksik',
    'Yargıtay içtihatları referans alınmamış',
    'Deliller tamamlanmamış',
  ],
  recommendations: [
    '6331 sayılı kanun maddeleri eklenmeli',
    'Yargıtay kararları referans alınmalı',
    'SGK tespit dosyası eklenmeli',
    'Talepler daha somut hale getirilmeli',
  ],
};

export default function PetitionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [petition, setPetition] = useState<Petition>(dummyPetition);
  const [aiAnalysis, setAIAnalysis] = useState<AIPetitionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(petition.content);
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    setAIAnalysis(dummyAIAnalysis);
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAIAnalysis(dummyAIAnalysis);
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    setPetition({ ...petition, content, updatedAt: new Date().toISOString() });
    setIsEditing(false);
  };

  const handleExport = (format: 'PDF' | 'WORD' | 'UYAP') => {
    console.log(`Exporting as ${format}`);
  };

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

  const tabs = [
    { id: 'content', label: 'İçerik', icon: FileText },
    { id: 'info', label: 'Bilgiler', icon: Info },
    { id: 'parties', label: 'Taraflar', icon: User },
    { id: 'evidence', label: 'Deliller', icon: Scale },
    { id: 'claims', label: 'Talepler', icon: Target },
    { id: 'attachments', label: 'Ekler', icon: Upload },
    { id: 'versions', label: 'Versiyonlar', icon: Clock },
    { id: 'notes', label: 'Notlar', icon: FileText },
  ];

  return (
    <MainLayout showAIPanel={true}>
      <div className="space-y-6 lg:mr-80 md:mr-64 mr-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {petition.name}
                </h1>
                <Badge className={statusColors[petition.status]}>
                  {statusLabels[petition.status]}
                </Badge>
                {petition.isAIGenerated && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <Brain className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {petition.subject}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowAIPanel(!showAIPanel)}>
              <Brain className="w-4 h-4 mr-2" />
              AI Panel
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Dışa Aktar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('PDF')}>
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('WORD')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Word
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('UYAP')}>
                  <Upload className="w-4 h-4 mr-2" />
                  UYAP
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Yazdır
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Mail
            </Button>
            <Button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Düzenle
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-1 overflow-x-auto">
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

        {/* Content */}
        {activeTab === 'content' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dilekçe İçeriği</CardTitle>
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Undo className="w-4 h-4 mr-1" />
                      Geri Al
                    </Button>
                    <Button variant="outline" size="sm">
                      <Redo className="w-4 h-4 mr-1" />
                      İleri Al
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {/* Editor Toolbar */}
                  <div className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Button variant="ghost" size="sm">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Underline className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
                    <Button variant="ghost" size="sm">
                      <Heading className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <List className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-200 dark:border-gray-700" />
                    <Button variant="ghost" size="sm">
                      <Link className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Image className="w-4 h-4" />
                    </Button>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <Brain className="w-4 h-4 mr-1" />
                      AI ile İyileştir
                    </Button>
                  </div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                    placeholder="Dilekçe içeriğini yazın..."
                  />
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                    {content}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <Card>
            <CardHeader>
              <CardTitle>Dilekçe Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Dilekçe Türü</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.type}
                  </p>
                </div>
                <div>
                  <Label>Öncelik</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.priority}
                  </p>
                </div>
                <div>
                  <Label>Dosya No</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.caseNumber}
                  </p>
                </div>
                <div>
                  <Label>Mahkeme</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.courtName}
                  </p>
                </div>
                <div>
                  <Label>Hakim</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.judge}
                  </p>
                </div>
                <div>
                  <Label>Daire</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.department}
                  </p>
                </div>
                <div>
                  <Label>Esas No</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.essenceNo}
                  </p>
                </div>
                <div>
                  <Label>Karar No</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.decisionNo}
                  </p>
                </div>
                <div>
                  <Label>Müvekkil</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.clientName}
                  </p>
                </div>
                <div>
                  <Label>Hazırlayan</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.preparedBy}
                  </p>
                </div>
                <div>
                  <Label>Teslim Tarihi</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {petition.dueDate}
                  </p>
                </div>
                <div>
                  <Label>Versiyon</Label>
                  <Badge variant="outline">{petition.currentVersion}</Badge>
                </div>
              </div>
              <div>
                <Label>Etiketler</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {petition.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parties Tab */}
        {activeTab === 'parties' && (
          <Card>
            <CardHeader>
              <CardTitle>Taraflar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {petition.parties.map((party) => (
                  <div key={party.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{party.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{party.role}</p>
                      </div>
                      <Badge variant="outline">{party.type}</Badge>
                    </div>
                    {party.lawyer && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Vekil: {party.lawyer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <Card>
            <CardHeader>
              <CardTitle>Deliller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {petition.evidence.map((evidence) => (
                  <div key={evidence.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{evidence.type}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{evidence.description}</p>
                      </div>
                      {evidence.date && (
                        <Badge variant="outline">
                          {new Date(evidence.date).toLocaleDateString('tr-TR')}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <Card>
            <CardHeader>
              <CardTitle>Talepler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {petition.claims.map((claim) => (
                  <div key={claim.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{claim.description}</p>
                        {claim.legalBasis && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{claim.legalBasis}</p>
                        )}
                      </div>
                      {claim.amount && (
                        <Badge variant="outline">
                          {claim.amount} {claim.currency}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachments Tab */}
        {activeTab === 'attachments' && (
          <Card>
            <CardHeader>
              <CardTitle>Ekler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {petition.attachments.map((attachment) => (
                  <div key={attachment.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(attachment.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <Card>
            <CardHeader>
              <CardTitle>Versiyonlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {petition.versions.map((version) => (
                  <div key={version.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{version.version}</Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(version.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {version.changes}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {version.createdBy}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <Card>
            <CardHeader>
              <CardTitle>Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notlarınızı buraya yazın..."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right AI Panel */}
      {showAIPanel && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg overflow-y-auto z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                LexMind AI
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAIPanel(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Dilekçeyi Analiz Et
                  </>
                )}
              </Button>

              {aiAnalysis && (
                <>
                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Özet</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {aiAnalysis.summary}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Risk Level */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Risk Seviyesi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        className={
                          aiAnalysis.riskLevel === 'LOW'
                            ? 'bg-green-100 text-green-700'
                            : aiAnalysis.riskLevel === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {aiAnalysis.riskLevel === 'LOW' ? 'Düşük' : aiAnalysis.riskLevel === 'MEDIUM' ? 'Orta' : 'Yüksek'}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Öneriler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {aiAnalysis.suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className={`p-3 rounded-lg ${
                            suggestion.severity === 'HIGH'
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                              : suggestion.severity === 'MEDIUM'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {suggestion.severity === 'HIGH' ? (
                              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                            ) : suggestion.severity === 'MEDIUM' ? (
                              <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            ) : (
                              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {suggestion.message}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {suggestion.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Güçlü Yönler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                            <Check className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Weaknesses */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                        Zayıf Yönler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiAnalysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                            <AlertTriangle className="w-4 h-4 mr-2 text-red-600 mt-0.5" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                        Öneriler
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiAnalysis.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                            <Lightbulb className="w-4 h-4 mr-2 text-yellow-600 mt-0.5" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Hızlı İşlemler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Hukuki Dili Güçlendir
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Resmileştir
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Scale className="w-4 h-4 mr-2" />
                        İçtihat Ekle
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Target className="w-4 h-4 mr-2" />
                        Risk Analizi Yap
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

function Info({ width, height, className }: { width?: number; height?: number; className?: string }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
