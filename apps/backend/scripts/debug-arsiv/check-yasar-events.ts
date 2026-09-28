import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkYasarEvents() {
  console.log('Checking Yaşar Acar events...');

  try {
    // Find Yaşar Acar user
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
      console.log('Yaşar Acar user not found');
      return;
    }

    console.log(`User ID: ${user.id}`);
    console.log(`Roles: ${user.roles.map(ur => ur.role.name).join(', ')}`);

    // Get all events
    const allEvents = await prisma.calendarEvent.count({
      where: {
        deletedAt: null,
      },
    });

    console.log(`Total events in system: ${allEvents}`);

    // Get events where Yaşar Acar is a participant
    const participantEvents = await prisma.calendarEvent.count({
      where: {
        deletedAt: null,
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    console.log(`Events where Yaşar Acar is a participant: ${participantEvents}`);

    // Get events created by Yaşar Acar
    const createdByEvents = await prisma.calendarEvent.count({
      where: {
        deletedAt: null,
        createdBy: user.id,
      },
    });

    console.log(`Events created by Yaşar Acar: ${createdByEvents}`);

    // Get today's events for Yaşar Acar
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEvents = await prisma.calendarEvent.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: today,
          lt: tomorrow,
        },
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    console.log(`\nToday's events for Yaşar Acar (${todayEvents.length}):`);
    todayEvents.forEach(event => {
      console.log(`- ${event.title} at ${event.time || 'N/A'} (ID: ${event.id})`);
      console.log(`  Participants: ${event.participants.length}`);
    });

    // Get upcoming events (next 7 days) for Yaşar Acar
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    console.log(`\nUpcoming events for Yaşar Acar (next 7 days, ${upcomingEvents.length}):`);
    upcomingEvents.forEach(event => {
      console.log(`- ${event.title} on ${event.date.toISOString().split('T')[0]} at ${event.time || 'N/A'} (ID: ${event.id})`);
    });

    // Check if Yaşar Acar has LAWYER role
    const hasLawyerRole = user.roles.some(ur => ur.role.name === 'LAWYER');
    console.log(`\nHas LAWYER role: ${hasLawyerRole}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkYasarEvents()
  .then(() => {
    console.log('Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
