import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

  // Assign managing partner role to admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: managingPartnerRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: managingPartnerRole.id,
    },
  });

  // Create sample clients
  const client1 = await prisma.client.upsert({
    where: { nationalId: '12345678901' },
    update: {},
    create: {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      email: 'ahmet.yilmaz@example.com',
      phoneNumber: '+905551234567',
      nationalId: '12345678901',
      address: 'İstanbul, Türkiye',
      tags: ['VIP', 'Kurumsal'],
    },
  });

  const client2 = await prisma.client.upsert({
    where: { nationalId: '98765432109' },
    update: {},
    create: {
      firstName: 'Ayşe',
      lastName: 'Demir',
      email: 'ayse.demir@example.com',
      phoneNumber: '+905559876543',
      nationalId: '98765432109',
      address: 'Ankara, Türkiye',
      tags: ['Bireysel'],
    },
  });

  // Create sample cases
  const case1 = await prisma.case.upsert({
    where: { caseNumber: '2024/1234' },
    update: {},
    create: {
      caseNumber: '2024/1234',
      title: 'Tazminat Davası',
      description: 'Maddi tazminat talebi',
      status: 'ACTIVE',
      type: 'CIVIL',
      courtName: 'İstanbul 1. Asliye Hukuk Mahkemesi',
      courtCity: 'İstanbul',
      startDate: new Date('2024-01-15'),
    },
  });

  const case2 = await prisma.case.upsert({
    where: { caseNumber: '2024/1235' },
    update: {},
    create: {
      caseNumber: '2024/1235',
      title: 'Boşanma Davası',
      description: 'Aile hukuku kapsamında boşanma',
      status: 'ACTIVE',
      type: 'FAMILY',
      courtName: 'İstanbul 2. Aile Mahkemesi',
      courtCity: 'İstanbul',
      startDate: new Date('2024-02-01'),
    },
  });

  // Link clients to cases
  await prisma.caseClient.create({
    data: {
      caseId: case1.id,
      clientId: client1.id,
      role: 'CLIENT',
    },
  });

  await prisma.caseClient.create({
    data: {
      caseId: case2.id,
      clientId: client2.id,
      role: 'CLIENT',
    },
  });

  // Link lawyers to cases
  await prisma.caseLawyer.create({
    data: {
      caseId: case1.id,
      userId: adminUser.id,
      role: 'LAWYER',
    },
  });

  // Create sample hearings
  await prisma.caseHearing.create({
    data: {
      caseId: case1.id,
      date: new Date('2024-07-21'),
      time: '10:00',
      location: 'İstanbul 1. Asliye Hukuk Mahkemesi, Duruşma Salonu 1',
      notes: 'Tanıkların dinlenmesi',
    },
  });

  await prisma.caseHearing.create({
    data: {
      caseId: case2.id,
      date: new Date('2024-07-22'),
      time: '14:30',
      location: 'İstanbul 2. Aile Mahkemesi, Duruşma Salonu 3',
      notes: 'Uzlaşma görüşmesi',
    },
  });

  // Create sample tasks
  await prisma.task.create({
    data: {
      title: 'Dava dilekçesi hazırla',
      description: '2024/1234 numaralı dava için dilekçe hazırlanacak',
      dueDate: new Date('2024-07-25'),
      priority: 'HIGH',
      status: 'TODO',
      createdBy: adminUser.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Müvekkil görüşmesi',
      description: 'Ahmet Yılmaz ile ön görüşme',
      dueDate: new Date('2024-07-23'),
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdBy: adminUser.id,
    },
  });

  // Create sample calendar events
  await prisma.calendarEvent.create({
    data: {
      title: 'Duruşma - 2024/1234',
      date: new Date('2024-07-21'),
      time: '10:00',
      duration: 120,
      location: 'İstanbul 1. Asliye Hukuk',
      type: 'HEARING',
      createdBy: adminUser.id,
    },
  });

  await prisma.calendarEvent.create({
    data: {
      title: 'Müvekkil Toplantısı',
      date: new Date('2024-07-23'),
      time: '14:00',
      duration: 60,
      location: 'Ofis',
      type: 'MEETING',
      createdBy: adminUser.id,
    },
  });

  // Create sample AI prompts
  await prisma.aIPrompt.create({
    data: {
      name: 'Dilekçe Hazırlama',
      description: 'Hukuki dilekçe taslağı oluşturma',
      category: 'Dilekçe',
      content: 'Verilen bilgilerle hukuki dilekçe taslağı oluştur. Resmi dil kullan ve gerekli hukuki referansları ekle.',
      version: '1.0',
      status: 'ACTIVE',
    },
  });

  await prisma.aIPrompt.create({
    data: {
      name: 'Sözleşme Analizi',
      description: 'Sözleşme risk analizi',
      category: 'Analiz',
      content: 'Bu sözleşmedeki riskleri tespit et ve öneriler sun. Maddeleri dikkatlice incele.',
      version: '1.0',
      status: 'ACTIVE',
    },
  });

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
