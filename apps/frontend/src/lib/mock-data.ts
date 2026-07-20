// Mock data generators for Turkish legal system

const turkishNames = {
  firstNames: [
    'Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Veli', 'Zeynep', 'Elif', 'Mustafa', 'Hüseyin',
    'Ömer', 'İbrahim', 'Hasan', 'Hüseyin', 'İsmail', 'Murat', 'Can', 'Emre', 'Burak', 'Arda',
    'Deniz', 'Ece', 'Selin', 'Ceren', 'Buse', 'Elif', 'Zeynep', 'Sümeyye', 'Havva', 'Rabia',
    'Yusuf', 'Yasin', 'Kerem', 'Mert', 'Ege', 'Baran', 'Kağan', 'Doğa', 'Aras', 'Rüzgar',
    'Defne', 'Nil', 'Leyla', 'Şirin', 'Gülşah', 'Merve', 'Seda', 'Gamze', 'Begüm', 'Esra'
  ],
  lastNames: [
    'Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Öztürk', 'Aydın', 'Yıldız', 'Kılıç', 'Koç',
    'Arslan', 'Doğan', 'Özdemir', 'Yıldırım', 'Keskin', 'Koçak', 'Aksoy', 'Şimşek', 'Kurt', 'Polat',
    'Bulut', 'Taş', 'Kara', 'Erdoğan', 'Yavuz', 'Sönmez', 'Uçar', 'Kaya', 'Avcı', 'Özkan',
    'Güneş', 'Şen', 'Çetin', 'Yılmaz', 'Kara', 'Demir', 'Akgün', 'Akyüz', 'Aktaş', 'Akyıldız'
  ]
};

const turkishCities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Mersin', 'Gaziantep', 'Şanlıurfa',
  'Eskişehir', 'Diyarbakır', 'Samsun', 'Kayseri', 'Malatya', 'Denizli', 'Trabzon', 'Erzurum', 'Van', 'Sakarya'
];

const courtTypes = [
  'Asliye Hukuk Mahkemesi', 'İş Mahkemesi', 'Ticaret Mahkemesi', 'Aile Mahkemesi', 'İdare Mahkemesi',
  'Ceza Mahkemesi', 'Ağır Ceza Mahkemesi', 'Tüketici Mahkemesi', 'Fikri Mülkiyet Mahkemesi', 'Bölge Adliye Mahkemesi'
];

const caseTypes = [
  'Tazminat Davası', 'Boşanma Davası', 'İş Davası', 'Kira Davası', 'Ticari Davası',
  'Ceza Davası', 'İdari Davası', 'Tüketici Davası', 'Fikri Mülkiyet Davası', 'İcra Takibi'
];

const caseDescriptions = [
  'Müşteriye ödenmemiş tazminat talebi',
  'Boşanma ve velayet davası',
  'Haksız işten çıkarma tazminatı',
  'Kira bedeli tahsili davası',
  'Ticari sözleşme ihlali',
  'Hırsızlık suçlaması',
  'İdari karar iptali',
  'Ayıplı mal iadesi',
  'Marka ihlali davası',
  'Alacak tahsili icra takibi'
];

const documentCategories = [
  'Dava Dilekçesi', 'Delil Belgesi', 'Sözleşme', 'Mahkeme Kararı', 'Uzman Raporu',
  'Tanıklık Beyanı', 'Mektup', 'Fatura', 'Banka Dekontu', 'Resmi Belge'
];

const documentTypes = [
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'text/plain', 'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const hearingStatuses = ['SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED'];
const caseStatuses = ['ACTIVE', 'PENDING', 'CLOSED', 'ARCHIVED'];

function getRandomItem(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(startYear: number, endYear: number) {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTurkishNationalId() {
  let id = '';
  for (let i = 0; i < 11; i++) {
    id += getRandomNumber(0, 9);
  }
  return id;
}

function generatePhoneNumber() {
  return `05${getRandomNumber(0, 9)}${getRandomNumber(0, 9)} ${getRandomNumber(100, 999)} ${getRandomNumber(10, 99)} ${getRandomNumber(10, 99)}`;
}

function generateEmail(firstName: string, lastName: string) {
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'yandex.com'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(domains)}`;
}

function generateAddress(city: string) {
  const districts = ['Merkez', 'Yenişehir', 'Kadıköy', 'Beşiktaş', 'Şişli', 'Çankaya', 'Keçiören', 'Karşıyaka', 'Nilüfer', 'Osmangazi'];
  const streets = ['Atatürk Cad.', 'Cumhuriyet Cad.', 'İstiklal Cad.', 'Bağdat Cad.', 'Barbaros Bulvarı'];
  return `${getRandomItem(districts)}, ${getRandomItem(streets)} No: ${getRandomNumber(1, 500)}, ${city}`;
}

// Generate 50+ mock clients
export function generateMockClients(count: number = 50) {
  const clients = [];
  for (let i = 0; i < count; i++) {
    const firstName = getRandomItem(turkishNames.firstNames);
    const lastName = getRandomItem(turkishNames.lastNames);
    const city = getRandomItem(turkishCities);
    
    clients.push({
      id: `client-${i + 1}`,
      firstName,
      lastName,
      nationalId: generateTurkishNationalId(),
      email: generateEmail(firstName, lastName),
      phoneNumber: generatePhoneNumber(),
      address: generateAddress(city),
      createdAt: getRandomDate(2018, 2024),
      type: Math.random() > 0.7 ? 'corporate' : 'individual'
    });
  }
  return clients;
}

// Generate 50+ mock cases
export function generateMockCases(count: number = 50) {
  const cases = [];
  const clients = generateMockClients(30);
  
  for (let i = 0; i < count; i++) {
    const client = getRandomItem(clients);
    const city = getRandomItem(turkishCities);
    
    cases.push({
      id: `case-${i + 1}`,
      caseNumber: `${getRandomNumber(2020, 2024)}/${getRandomNumber(1000, 9999)}`,
      title: `${getRandomItem(caseTypes)} - ${client.firstName} ${client.lastName}`,
      description: getRandomItem(caseDescriptions),
      type: getRandomItem(caseTypes),
      status: getRandomItem(caseStatuses),
      courtName: `${city} ${getRandomItem(courtTypes)}`,
      startDate: getRandomDate(2020, 2024),
      assignedLawyer: `${getRandomItem(turkishNames.firstNames)} ${getRandomItem(turkishNames.lastNames)}`,
      clients: [client],
      priority: getRandomItem(['critical', 'high', 'medium', 'low']),
      successProbability: getRandomNumber(30, 95),
      confidenceLevel: getRandomNumber(60, 98),
      riskLevel: getRandomItem(['Yüksek', 'Orta', 'Düşük']),
      riskFactors: getRandomItem([
        ['Delil eksikliği', 'Tanık bulunamaması'],
        ['Süre riski', 'Belge eksikliği'],
        ['Karşı taraf güçlü'],
        ['Yasal belirsizlik']
      ])
    });
  }
  return cases;
}

// Generate 50+ mock documents
export function generateMockDocuments(count: number = 50) {
  const documents = [];
  const cases = generateMockCases(30);
  
  for (let i = 0; i < count; i++) {
    const caseItem = getRandomItem(cases);
    const size = getRandomNumber(1024, 10485760); // 1KB to 10MB
    
    documents.push({
      id: `doc-${i + 1}`,
      name: `${getRandomItem(documentCategories)} - ${caseItem.caseNumber}`,
      fileName: `${getRandomItem(documentCategories).toLowerCase().replace(/ /g, '_')}_${getRandomNumber(1000, 9999)}.${getRandomItem(['pdf', 'docx', 'doc', 'jpg', 'png'])}`,
      category: getRandomItem(documentCategories),
      type: getRandomItem(documentTypes),
      size,
      mimeType: getRandomItem(documentTypes),
      createdAt: getRandomDate(2020, 2024),
      caseId: caseItem.id,
      uploadDate: getRandomDate(2020, 2024),
      riskLevel: Math.random() > 0.7 ? getRandomItem(['Yüksek', 'Orta', 'Düşük']) : null,
      riskFactors: Math.random() > 0.8 ? ['İmza eksik', 'Tarih uyumsuzluğu'] : null
    });
  }
  return documents;
}

// Generate 50+ mock hearings
export function generateMockHearings(count: number = 50) {
  const hearings = [];
  const cases = generateMockCases(30);
  const cities = turkishCities;
  
  for (let i = 0; i < count; i++) {
    const caseItem = getRandomItem(cases);
    const city = getRandomItem(cities);
    const date = getRandomDate(2024, 2025);
    
    hearings.push({
      id: `hearing-${i + 1}`,
      caseNumber: caseItem.caseNumber,
      caseTitle: caseItem.title,
      courtName: caseItem.courtName,
      courtRoom: `${getRandomNumber(1, 10)}. Duruşma Salonu`,
      date,
      time: `${getRandomNumber(9, 17)}:${getRandomNumber(0, 5)}${getRandomNumber(0, 9)}`,
      status: getRandomItem(hearingStatuses),
      notes: Math.random() > 0.5 ? getRandomItem([
        'Tanıklar dinlenecek',
        'Deliller sunulacak',
        'Uzman görüşü alınacak',
        'Son savunma',
        'Karar açıklanacak'
      ]) : null,
      judge: `${getRandomItem(turkishNames.firstNames)} ${getRandomItem(turkishNames.lastNames)}`,
      prosecutor: Math.random() > 0.3 ? `${getRandomItem(turkishNames.firstNames)} ${getRandomItem(turkishNames.lastNames)}` : null
    });
  }
  return hearings;
}

// Generate 50+ mock legal research results
export function generateMockLegalResearch(count: number = 50) {
  const research = [];
  const cities = turkishCities;
  
  for (let i = 0; i < count; i++) {
    const city = getRandomItem(cities);
    const year = getRandomNumber(2010, 2024);
    
    research.push({
      id: `research-${i + 1}`,
      title: `${getRandomItem(caseTypes)} - ${year}/${getRandomNumber(1, 500)}`,
      court: `${city} ${getRandomItem(courtTypes)}`,
      citation: `E.${year}/${getRandomNumber(1, 5000)}.K.${getRandomNumber(1, 50)}`,
      year,
      outcome: getRandomItem(['Kabul', 'Red', 'Kısmen Kabul', 'Kısmen Red']),
      relevance: getRandomNumber(60, 98),
      summary: getRandomItem(caseDescriptions),
      keyPoints: [
        'Önceki emsal karar',
        'Yasal dayanak',
        'Uygulanacak kanun maddesi'
      ]
    });
  }
  return research;
}

// Generate 50+ mock AI recommendations
export function generateMockRecommendations(count: number = 50) {
  const recommendations = [];
  const types = ['hearing', 'document', 'client', 'deadline', 'opportunity'];
  
  for (let i = 0; i < count; i++) {
    const type = getRandomItem(types);
    let title: string, description: string, reason: string;
    
    switch (type) {
      case 'hearing':
        title = 'Yaklaşan Duruşma';
        description = `${getRandomNumber(1, 7)} gün sonra duruşma var`;
        reason = 'Duruşma hazırlığı gerekli';
        break;
      case 'document':
        title = 'Yeni Belge Yüklendi';
        description = 'Uzman raporu eklendi';
        reason = 'İnceleme bekleniyor';
        break;
      case 'client':
        title = 'Müşteri Takibi';
        description = `${getRandomNumber(10, 60)} gündür iletişim yok`;
        reason = 'Müşteri ilişkisi güçlendirilmeli';
        break;
      case 'deadline':
        title = 'Son Tarih Yaklaşıyor';
        description = 'Cevap süresi doluyor';
        reason = 'Zamanında yanıt verilmeli';
        break;
      case 'opportunity':
        title = 'Yeni Fırsat';
        description = 'Potansiyel yeni dava';
        reason = 'Müşteri ilgisi var';
        break;
      default:
        title = 'Genel Öneri';
        description = 'İnceleme gerekiyor';
        reason = 'Sistem önerisi';
    }
    
    recommendations.push({
      id: `rec-${i + 1}`,
      type,
      priority: getRandomItem(['critical', 'high', 'medium', 'low']) as 'critical' | 'high' | 'medium' | 'low',
      title,
      description,
      reason,
      businessImpact: getRandomItem(['Yüksek', 'Orta', 'Düşük']),
      legalImpact: getRandomItem(['Kritik', 'Yüksek', 'Orta', 'Düşük']),
      estimatedTime: getRandomNumber(15, 120),
      confidenceScore: getRandomNumber(70, 98),
      actions: [
        { id: 'a1', type: 'summarize', label: 'AI Özeti Oku', requiresApproval: false },
        { id: 'a2', type: 'search', label: 'Araştır', requiresApproval: false }
      ]
    });
  }
  return recommendations;
}
