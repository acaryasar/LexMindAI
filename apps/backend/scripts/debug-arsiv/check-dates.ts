import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDates() {
  try {
    // Get current date
    const now = new Date();
    console.log('Şu anki tarih (sistem):', now.toISOString());
    console.log('Şu anki tarih (local):', now.toLocaleDateString('tr-TR'));

    // Get today's date range (as dashboard does)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('\nDashboard bugün aralığı:');
    console.log('Bugün başlangıç:', today.toISOString());
    console.log('Yarın başlangıç:', tomorrow.toISOString());

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

    // Get all events created by Yaşar Acar
    const allEvents = await prisma.calendarEvent.findMany({
      where: {
        createdBy: user.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log(`\nYaşar Acar'ın toplam ${allEvents.length} etkinliği:\n`);

    allEvents.forEach((event, index) => {
      const eventDate = new Date(event.date);
      const isToday = eventDate >= today && eventDate < tomorrow;
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   DB Tarih: ${event.date}`);
      console.log(`   JS Tarih: ${eventDate.toISOString()}`);
      console.log(`   Bugün mü?: ${isToday ? 'EVET' : 'HAYIR'}`);
      console.log('');
    });
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDates();
