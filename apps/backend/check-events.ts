import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTodayEvents() {
  try {
    // Find Yaşar Acar user
    const user = await prisma.user.findFirst({
      where: {
        firstName: 'Yaşar',
        lastName: 'Acar',
      },
    });

    if (!user) {
      console.log('Yaşar Acar kullanıcısı bulunamadı');
      return;
    }

    console.log(`Kullanıcı bulundu: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get events created by Yaşar Acar for today
    const events = await prisma.calendarEvent.findMany({
      where: {
        createdBy: user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        time: 'asc',
      },
    });

    console.log(`\nBugün (${today.toISOString().split('T')[0]}) için ${events.length} etkinlik bulundu:\n`);

    if (events.length === 0) {
      console.log('Bugün için etkinlik yok.');
    } else {
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title}`);
        console.log(`   Tür: ${event.type}`);
        console.log(`   Saat: ${event.time || 'Belirtilmemiş'}`);
        console.log(`   Konum: ${event.location || 'Belirtilmemiş'}`);
        console.log(`   Notlar: ${event.notes || 'Yok'}`);
        console.log(`   Süre: ${event.duration || 'Belirtilmemiş'} dakika`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTodayEvents();
