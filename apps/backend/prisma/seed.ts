import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Turkish data generators
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

async function main() {
  console.log('Starting seed...');

  // Create roles
  const managingPartnerRole = await prisma.role.upsert({
    where: { name: 'MANAGING_PARTNER' },
    update: {},
    create: {
      name: 'MANAGING_PARTNER',
      description: 'Managing Partner - Full access',
    },
  });

  const partnerRole = await prisma.role.upsert({
    where: { name: 'PARTNER' },
    update: {},
    create: {
      name: 'PARTNER',
      description: 'Partner - Team management access',
    },
  });

  const lawyerRole = await prisma.role.upsert({
    where: { name: 'LAWYER' },
    update: {},
    create: {
      name: 'LAWYER',
      description: 'Lawyer - Case management access',
    },
  });

  const secretaryRole = await prisma.role.upsert({
    where: { name: 'SECRETARY' },
    update: {},
    create: {
      name: 'SECRETARY',
      description: 'Secretary - Calendar and document access',
    },
  });

  const accountantRole = await prisma.role.upsert({
    where: { name: 'ACCOUNTANT' },
    update: {},
    create: {
      name: 'ACCOUNTANT',
      description: 'Accountant - Finance access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'User - Basic access',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Admin - System administration access',
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lexmind.ai' },
    update: {},
    create: {
      email: 'admin@lexmind.ai',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+905555555555',
      isActive: true,
      emailVerified: true,
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create additional users with different roles
  const commonPassword = await bcrypt.hash('password123', 10);

  // Partner user
  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@lexmind.ai' },
    update: {},
    create: {
      email: 'partner@lexmind.ai',
      password: commonPassword,
      firstName: 'Mehmet',
      lastName: 'Yılmaz',
      phoneNumber: '+905555555556',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: partnerUser.id,
        roleId: partnerRole.id,
      },
    },
    update: {},
    create: {
      userId: partnerUser.id,
      roleId: partnerRole.id,
    },
  });

  // Lawyer user 1
  const lawyerUser1 = await prisma.user.upsert({
    where: { email: 'lawyer1@lexmind.ai' },
    update: {},
    create: {
      email: 'lawyer1@lexmind.ai',
      password: commonPassword,
      firstName: 'Ayşe',
      lastName: 'Demir',
      phoneNumber: '+905555555557',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: lawyerUser1.id,
        roleId: lawyerRole.id,
      },
    },
    update: {},
    create: {
      userId: lawyerUser1.id,
      roleId: lawyerRole.id,
    },
  });

  // Lawyer user 2
  const lawyerUser2 = await prisma.user.upsert({
    where: { email: 'lawyer2@lexmind.ai' },
    update: {},
    create: {
      email: 'lawyer2@lexmind.ai',
      password: commonPassword,
      firstName: 'Ali',
      lastName: 'Kaya',
      phoneNumber: '+905555555558',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: lawyerUser2.id,
        roleId: lawyerRole.id,
      },
    },
    update: {},
    create: {
      userId: lawyerUser2.id,
      roleId: lawyerRole.id,
    },
  });

  // Secretary user
  const secretaryUser = await prisma.user.upsert({
    where: { email: 'secretary@lexmind.ai' },
    update: {},
    create: {
      email: 'secretary@lexmind.ai',
      password: commonPassword,
      firstName: 'Fatma',
      lastName: 'Şahin',
      phoneNumber: '+905555555559',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: secretaryUser.id,
        roleId: secretaryRole.id,
      },
    },
    update: {},
    create: {
      userId: secretaryUser.id,
      roleId: secretaryRole.id,
    },
  });

  // Accountant user
  const accountantUser = await prisma.user.upsert({
    where: { email: 'accountant@lexmind.ai' },
    update: {},
    create: {
      email: 'accountant@lexmind.ai',
      password: commonPassword,
      firstName: 'Mustafa',
      lastName: 'Öztürk',
      phoneNumber: '+905555555560',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: accountantUser.id,
        roleId: accountantRole.id,
      },
    },
    update: {},
    create: {
      userId: accountantUser.id,
      roleId: accountantRole.id,
    },
  });

  // Create sample clients (50+ records)
  console.log('Creating clients...');
  const clients = [];
  for (let i = 0; i < 50; i++) {
    const firstName = getRandomItem(turkishNames.firstNames);
    const lastName = getRandomItem(turkishNames.lastNames);
    const city = getRandomItem(turkishCities);
    const nationalId = generateTurkishNationalId();
    
    const client = await prisma.client.upsert({
      where: { nationalId },
      update: {},
      create: {
        firstName,
        lastName,
        email: generateEmail(firstName, lastName),
        phoneNumber: generatePhoneNumber(),
        nationalId,
        address: generateAddress(city),
        tags: getRandomItem([['VIP'], ['Kurumsal'], ['Bireysel'], ['Yüksek Risk'], []]),
      },
    });
    clients.push(client);

    // Assign client to a random lawyer
    const assignedLawyer = getRandomItem([lawyerUser1, lawyerUser2]);
    await prisma.clientLawyer.create({
      data: {
        clientId: client.id,
        userId: assignedLawyer.id,
        isPrimary: Math.random() > 0.5,
        status: 'ACTIVE',
      },
    }).catch(() => {
      // Ignore duplicate errors
    });
  }

  // Create sample cases (50+ records)
  console.log('Creating cases...');
  const cases = [];
  for (let i = 0; i < 50; i++) {
    const client = getRandomItem(clients);
    const city = getRandomItem(turkishCities);
    const caseNumber = `${getRandomNumber(2020, 2024)}/${getRandomNumber(1000, 9999)}`;
    const assignedLawyer = getRandomItem([lawyerUser1, lawyerUser2]);
    
    const caseData = await prisma.case.upsert({
      where: { caseNumber },
      update: {},
      create: {
        caseNumber,
        title: `${getRandomItem(caseTypes)} - ${client.firstName} ${client.lastName}`,
        description: getRandomItem(caseDescriptions),
        status: getRandomItem(['ACTIVE', 'PENDING', 'CLOSED', 'ARCHIVED']),
        type: getRandomItem(['CIVIL', 'CRIMINAL', 'FAMILY', 'COMMERCIAL', 'ADMINISTRATIVE']),
        courtName: `${city} ${getRandomItem(courtTypes)}`,
        courtCity: city,
        startDate: getRandomDate(2020, 2024),
      },
    });
    cases.push(caseData);

    // Link client to case
    await prisma.caseClient.create({
      data: {
        caseId: caseData.id,
        clientId: client.id,
        role: 'CLIENT',
      },
    });

    // Assign lawyer to case
    await prisma.caseLawyer.create({
      data: {
        caseId: caseData.id,
        userId: assignedLawyer.id,
        role: getRandomItem(['LEAD_LAWYER', 'ASSOCIATE', 'OBSERVER']),
      },
    });
  }

  // Create sample hearings (50+ records)
  console.log('Creating hearings...');
  for (let i = 0; i < 50; i++) {
    const caseData = getRandomItem(cases);
    const hearingDate = getRandomDate(2024, 2026);
    
    await prisma.caseHearing.create({
      data: {
        caseId: caseData.id,
        date: hearingDate,
        time: `${getRandomNumber(9, 17)}:00`,
        location: `${caseData.courtName}, Duruşma Salonu ${getRandomNumber(1, 10)}`,
        notes: getRandomItem(['Tanıkların dinlenmesi', 'Uzlaşma görüşmesi', 'Delil sunumu', 'Son savunma', '']),
      },
    });
  }

  // Create sample documents (50+ records)
  console.log('Creating documents...');
  for (let i = 0; i < 50; i++) {
    const caseData = getRandomItem(cases);
    const category = getRandomItem(documentCategories);
    const fileName = `${category.toLowerCase().replace(/ /g, '_')}_${getRandomNumber(1000, 9999)}.pdf`;
    
    const document = await prisma.document.create({
      data: {
        name: `${category} - ${caseData.caseNumber}`,
        fileName,
        mimeType: 'application/pdf',
        size: getRandomNumber(1024, 10485760),
        path: `/uploads/${fileName}`,
        hash: `hash_${getRandomNumber(100000, 999999)}`,
        bucket: 'documents',
        category,
      },
    });

    // Link document to case
    await prisma.caseDocument.create({
      data: {
        caseId: caseData.id,
        documentId: document.id,
      },
    });

    // Link document to client
    const caseClient = await prisma.caseClient.findFirst({
      where: { caseId: caseData.id },
    });
    if (caseClient) {
      await prisma.clientDocument.create({
        data: {
          clientId: caseClient.clientId,
          documentId: document.id,
        },
      });
    }
  }

  // Create sample tasks (50+ records)
  console.log('Creating tasks...');
  for (let i = 0; i < 50; i++) {
    const caseData = getRandomItem(cases);
    
    await prisma.task.create({
      data: {
        title: getRandomItem([
          'Dava dilekçesi hazırla',
          'Müvekkil görüşmesi',
          'Delil toplama',
          'Mahkeme kararı inceleme',
          'Uzman raporu talep etme',
          'Tanıklık beyanı al',
          'Sözleşme hazırla',
          'İtiraz dilekçesi yaz',
          'Durum raporu hazırla',
          'Son teslim tarihi kontrolü'
        ]),
        description: `${caseData.caseNumber} numaralı dava için ilgili işlem yapılacak`,
        dueDate: getRandomDate(2024, 2025),
        priority: getRandomItem(['HIGH', 'MEDIUM', 'LOW']),
        status: getRandomItem(['TODO', 'IN_PROGRESS', 'COMPLETED']),
        createdBy: adminUser.id,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
