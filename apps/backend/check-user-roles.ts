import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserRoles() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        firstName: 'Yaşar',
        lastName: 'Acar',
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      console.log('Yaşar Acar kullanıcısı bulunamadı');
      return;
    }

    console.log(`Kullanıcı: ${user.firstName} ${user.lastName}`);
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Roller: ${user.roles.map(ur => ur.role.name).join(', ')}`);

    // Get today's events for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userEvents = await prisma.calendarEvent.findMany({
      where: {
        createdBy: user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    console.log(`\nYaşar Acar'ın bugün için kendi etkinlikleri: ${userEvents.length}`);

    // Get all events for today (if admin)
    const allEvents = await prisma.calendarEvent.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    console.log(`Bugün için toplam tüm etkinlikler: ${allEvents.length}`);

    // Count events by creator
    const eventsByCreator = allEvents.reduce((acc, event) => {
      if (event.createdBy) {
        acc[event.createdBy] = (acc[event.createdBy] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    console.log('\nEtkinlikler oluşturucuya göre:');
    for (const [creatorId, count] of Object.entries(eventsByCreator)) {
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
      const roleNames = creator?.roles.map(ur => ur.role.name).join(', ') || 'No roles';
      console.log(`  ${creator?.firstName} ${creator?.lastName} (${roleNames}): ${count} etkinlik`);
    }
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles();
