'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Sparkles,
  Check,
  FileText,
  Scale,
  User,
  Calendar,
  Download,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
} from 'lucide-react';
import { Petition, PetitionType, PetitionPriority } from '@/types/petition';

type WizardStep = 'template' | 'basic' | 'parties' | 'evidence' | 'claims' | 'review' | 'generate';

const petitionTypes: { value: PetitionType; label: string; description: string }[] = [
  { value: 'CEVAP_DILEKCESI', label: 'Cevap Dilekçesi', description: 'Dava dilekçesine cevap hazırlama' },
  { value: 'ISTINAF_DILEKCESI', label: 'İstinaf Dilekçesi', description: 'Bölge Adliye Mahkemesine istinaf' },
  { value: 'TEMYIZ_DILEKCESI', label: 'Temyiz Dilekçesi', description: 'Yargıtay temyiz başvurusu' },
  { value: 'ICRA_DILEKCESI', label: 'İcra Dilekçesi', description: 'İcra takibi başlatma' },
  { value: 'CEZA_DILEKCESI', label: 'Ceza Dilekçesi', description: 'Ceza davası dilekçesi' },
  { value: 'IS_HUKUKU_DILEKCESI', label: 'İş Hukuku Dilekçesi', description: 'İş davası dilekçesi' },
  { value: 'BOSANMA_DILEKCESI', label: 'Boşanma Dilekçesi', description: 'Boşanma davası dilekçesi' },
  { value: 'TICARET_DILEKCESI', label: 'Ticaret Dilekçesi', description: 'Ticari dava dilekçesi' },
  { value: 'TAZMINAT_DILEKCESI', label: 'Tazminat Dilekçesi', description: 'Tazminat talebi dilekçesi' },
  { value: 'IHTIATI_TEDBIR_DILEKCESI', label: 'İhtiyati Tedbir', description: 'İhtiyati tedbir talebi' },
  { value: 'AYM_DILEKCESI', label: 'AYM Dilekçesi', description: 'Anayasa Mahkemesi başvurusu' },
  { value: 'AIHM_DILEKCESI', label: 'AİHM Dilekçesi', description: 'İnsan Haqları Mahkemesi' },
  { value: 'OFIS_DILEKCESI', label: 'Ofis Dilekçesi', description: 'Ofis içi dilekçe' },
  { value: 'UYAP_DILEKCESI', label: 'UYAP Dilekçesi', description: 'UYAP formatında dilekçe' },
  { value: 'DIGER', label: 'Diğer', description: 'Diğer dilekçe türleri' },
];

const templates = [
  { id: 'blank', name: 'Boş Şablon', icon: FileText, description: 'Sıfırdan başlayın' },
  { id: 'icra', name: 'İcra', icon: Scale, description: 'İcra takibi şablonu' },
  { id: 'ceza', name: 'Ceza', icon: Scale, description: 'Ceza davası şablonu' },
  { id: 'is', name: 'İş Hukuku', icon: User, description: 'İş davası şablonu' },
  { id: 'bosanma', name: 'Boşanma', icon: User, description: 'Boşanma davası şablonu' },
  { id: 'ticaret', name: 'Ticaret', icon: Scale, description: 'Ticari dava şablonu' },
  { id: 'tazminat', name: 'Tazminat', icon: FileText, description: 'Tazminat şablonu' },
  { id: 'ihtiyati', name: 'İhtiyati Tedbir', icon: Scale, description: 'İhtiyati tedbir şablonu' },
  { id: 'istinaf', name: 'İstinaf', icon: Scale, description: 'İstinaf şablonu' },
  { id: 'temyiz', name: 'Temyiz', icon: Scale, description: 'Temyiz şablonu' },
  { id: 'aym', name: 'AYM', icon: Scale, description: 'AYM şablonu' },
  { id: 'aihm', name: 'AİHM', icon: Scale, description: 'AİHM şablonu' },
];

export default function NewPetitionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('template');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Basic Info
    type: '' as PetitionType,
    subject: '',
    priority: 'MEDIUM' as PetitionPriority,
    dueDate: '',
    
    // Case Info
    caseId: '',
    caseNumber: '',
    courtName: '',
    judge: '',
    department: '',
    essenceNo: '',
    decisionNo: '',
    
    // Client Info
    clientId: '',
    clientName: '',
    
    // Parties
    parties: [] as Array<{ name: string; type: string; role: string }>,
    
    // Evidence
    evidence: [] as Array<{ type: string; description: string; date: string }>,
    
    // Claims
    claims: [] as Array<{ description: string; amount?: number; currency?: string }>,
    
    // Content
    content: '',
    
    // Tags
    tags: [] as string[],
  });

  const steps: { id: WizardStep; title: string; icon: any }[] = [
    { id: 'template', title: 'Şablon', icon: FileText },
    { id: 'basic', title: 'Temel Bilgiler', icon: FileText },
    { id: 'parties', title: 'Taraflar', icon: User },
    { id: 'evidence', title: 'Deliller', icon: Scale },
    { id: 'claims', title: 'Talepler', icon: FileText },
    { id: 'review', title: 'İnceleme', icon: Check },
    { id: 'generate', title: 'Oluştur', icon: Sparkles },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
    // Navigate to petitions list
    router.push('/petitions');
  };

  const addParty = () => {
    setFormData({
      ...formData,
      parties: [...formData.parties, { name: '', type: 'PLAINTIFF', role: '' }],
    });
  };

  const removeParty = (index: number) => {
    setFormData({
      ...formData,
      parties: formData.parties.filter((_, i) => i !== index),
    });
  };

  const addEvidence = () => {
    setFormData({
      ...formData,
      evidence: [...formData.evidence, { type: '', description: '', date: '' }],
    });
  };

  const removeEvidence = (index: number) => {
    setFormData({
      ...formData,
      evidence: formData.evidence.filter((_, i) => i !== index),
    });
  };

  const addClaim = () => {
    setFormData({
      ...formData,
      claims: [...formData.claims, { description: '', amount: undefined, currency: 'TL' }],
    });
  };

  const removeClaim = (index: number) => {
    setFormData({
      ...formData,
      claims: formData.claims.filter((_, i) => i !== index),
    });
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Brain className="w-8 h-8 mr-3" />
                AI ile Yeni Dilekçe
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Yapay zeka asistanı ile adım adım dilekçe oluşturun
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                      </div>
                      <p
                        className={`text-xs mt-2 text-center ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400 font-medium'
                            : isCompleted
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 'template' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Şablon Seçin
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Başlamak için bir şablon seçin veya sıfırdan başlayın
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {templates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedTemplate === template.id
                            ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {template.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {template.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 'basic' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Temel Bilgiler
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Dilekçenin temel bilgilerini girin
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dilekçe Türü</Label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as PetitionType })}
                    >
                      <option value="">Seçin</option>
                      {petitionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Konu</Label>
                    <Input
                      placeholder="Dilekçe konusu"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Öncelik</Label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as PetitionPriority })}
                    >
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                      <option value="URGENT">Acil</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Teslim Tarihi</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dosya No</Label>
                    <Input
                      placeholder="2024/123"
                      value={formData.caseNumber}
                      onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mahkeme</Label>
                    <Input
                      placeholder="Mahkeme adı"
                      value={formData.courtName}
                      onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hakim</Label>
                    <Input
                      placeholder="Hakim adı"
                      value={formData.judge}
                      onChange={(e) => setFormData({ ...formData, judge: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Daire</Label>
                    <Input
                      placeholder="Daire"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Esas No</Label>
                    <Input
                      placeholder="2024/123 E."
                      value={formData.essenceNo}
                      onChange={(e) => setFormData({ ...formData, essenceNo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Karar No</Label>
                    <Input
                      placeholder="2024/456 K."
                      value={formData.decisionNo}
                      onChange={(e) => setFormData({ ...formData, decisionNo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Müvekkil</Label>
                    <Input
                      placeholder="Müvekkil adı"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'parties' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Taraflar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Dava taraflarını ekleyin
                  </p>
                </div>
                {formData.parties.map((party, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Taraf {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParty(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Ad</Label>
                          <Input
                            placeholder="Ad Soyad"
                            value={party.name}
                            onChange={(e) => {
                              const newParties = [...formData.parties];
                              newParties[index].name = e.target.value;
                              setFormData({ ...formData, parties: newParties });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tür</Label>
                          <select
                            className="w-full px-3 py-2 rounded-md border border-input bg-background"
                            value={party.type}
                            onChange={(e) => {
                              const newParties = [...formData.parties];
                              newParties[index].type = e.target.value;
                              setFormData({ ...formData, parties: newParties });
                            }}
                          >
                            <option value="PLAINTIFF">Davacı</option>
                            <option value="DEFENDANT">Davalı</option>
                            <option value="THIRD_PARTY">Üçüncü Kişi</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Rol</Label>
                          <Input
                            placeholder="Rol"
                            value={party.role}
                            onChange={(e) => {
                              const newParties = [...formData.parties];
                              newParties[index].role = e.target.value;
                              setFormData({ ...formData, parties: newParties });
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addParty} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Taraf Ekle
                </Button>
              </div>
            )}

            {currentStep === 'evidence' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Deliller
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Delilleri ekleyin
                  </p>
                </div>
                {formData.evidence.map((evidence, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Delil {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEvidence(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Tür</Label>
                          <Input
                            placeholder="Rapor, Belge vb."
                            value={evidence.type}
                            onChange={(e) => {
                              const newEvidence = [...formData.evidence];
                              newEvidence[index].type = e.target.value;
                              setFormData({ ...formData, evidence: newEvidence });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Açıklama</Label>
                          <Input
                            placeholder="Delil açıklaması"
                            value={evidence.description}
                            onChange={(e) => {
                              const newEvidence = [...formData.evidence];
                              newEvidence[index].description = e.target.value;
                              setFormData({ ...formData, evidence: newEvidence });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tarih</Label>
                          <Input
                            type="date"
                            value={evidence.date}
                            onChange={(e) => {
                              const newEvidence = [...formData.evidence];
                              newEvidence[index].date = e.target.value;
                              setFormData({ ...formData, evidence: newEvidence });
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addEvidence} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Delil Ekle
                </Button>
              </div>
            )}

            {currentStep === 'claims' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Talepler
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Taleplerinizi ekleyin
                  </p>
                </div>
                {formData.claims.map((claim, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Talep {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeClaim(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label>Açıklama</Label>
                          <Input
                            placeholder="Talep açıklaması"
                            value={claim.description}
                            onChange={(e) => {
                              const newClaims = [...formData.claims];
                              newClaims[index].description = e.target.value;
                              setFormData({ ...formData, claims: newClaims });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tutar</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              placeholder="0"
                              value={claim.amount || ''}
                              onChange={(e) => {
                                const newClaims = [...formData.claims];
                                newClaims[index].amount = parseFloat(e.target.value) || undefined;
                                setFormData({ ...formData, claims: newClaims });
                              }}
                            />
                            <select
                              className="px-3 py-2 rounded-md border border-input bg-background w-20"
                              value={claim.currency}
                              onChange={(e) => {
                                const newClaims = [...formData.claims];
                                newClaims[index].currency = e.target.value;
                                setFormData({ ...formData, claims: newClaims });
                              }}
                            >
                              <option value="TL">TL</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addClaim} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Talep Ekle
                </Button>
              </div>
            )}

            {currentStep === 'review' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    İnceleme
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Bilgilerinizi gözden geçirin
                  </p>
                </div>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Temel Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-500">Tür:</span>
                        <span className="font-medium">{formData.type || '-'}</span>
                        <span className="text-gray-500">Konu:</span>
                        <span className="font-medium">{formData.subject || '-'}</span>
                        <span className="text-gray-500">Öncelik:</span>
                        <span className="font-medium">{formData.priority}</span>
                        <span className="text-gray-500">Teslim Tarihi:</span>
                        <span className="font-medium">{formData.dueDate || '-'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Dava Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-gray-500">Dosya No:</span>
                        <span className="font-medium">{formData.caseNumber || '-'}</span>
                        <span className="text-gray-500">Mahkeme:</span>
                        <span className="font-medium">{formData.courtName || '-'}</span>
                        <span className="text-gray-500">Hakim:</span>
                        <span className="font-medium">{formData.judge || '-'}</span>
                        <span className="text-gray-500">Esas No:</span>
                        <span className="font-medium">{formData.essenceNo || '-'}</span>
                        <span className="text-gray-500">Karar No:</span>
                        <span className="font-medium">{formData.decisionNo || '-'}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Taraflar ({formData.parties.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {formData.parties.map((party, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="font-medium">{party.name || '-'}</span>
                          <span className="text-gray-500">{party.role || '-'}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Deliller ({formData.evidence.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {formData.evidence.map((evidence, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="font-medium">{evidence.type || '-'}</span>
                          <span className="text-gray-500">{evidence.description || '-'}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Talepler ({formData.claims.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {formData.claims.map((claim, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="font-medium">{claim.description || '-'}</span>
                          <span className="text-gray-500">
                            {claim.amount ? `${claim.amount} ${claim.currency}` : '-'}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 'generate' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Dilekçe Oluştur
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yapay zeka dilekçenizi hazırlayacak
                  </p>
                </div>
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <CardContent className="p-6 text-center">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      AI Dilekçe Oluşturucu
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Girdiğiniz bilgilere göre profesyonel bir dilekçe oluşturulacak
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-1 text-green-600" />
                        PDF formatında
                      </div>
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-1 text-green-600" />
                        Word formatında
                      </div>
                      <div className="flex items-center">
                        <Check className="w-4 h-4 mr-1 text-green-600" />
                        UYAP formatında
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Önceki
          </Button>
          {currentStep === 'generate' ? (
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Dilekçe Oluştur
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Sonraki
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
