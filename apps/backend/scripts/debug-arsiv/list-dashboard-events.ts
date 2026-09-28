import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listDashboardEvents() {
  console.log('Listing Dashboard events for Yaşar Acar...\n');

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

    console.log(`User: ${user.firstName} ${user.lastName} (${user.id})`);
    console.log(`Roles: ${user.roles.map(ur => ur.role.name).join(', ')}\n`);

    // Get user roles
    const roles = user.roles.map(ur => ur.role.name);
    const isAdminOrPartner = roles.includes('ADMIN') || roles.includes('MANAGING_PARTNER');

    // Dashboard: getEvents for today only
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    console.log('=== DASHBOARD EVENTS (Bugünün Ajandası) ===');
    console.log(`Date range: ${today.toISOString().split('T')[0]} to ${endOfToday.toISOString().split('T')[0]}\n`);

    const dashboardEvents = await prisma.calendarEvent.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: today,
          lte: endOfToday,
        },
        ...(isAdminOrPartner ? {} : {
          participants: {
            some: {
              userId: user.id,
            },
          },
        }),
      },
      include: {
        participants: true,
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
    });

    console.log(`Total events: ${dashboardEvents.length}\n`);

    dashboardEvents.forEach(event => {
      console.log(`${event.time || 'N/A'} - ${event.title}`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Type: ${event.type}`);
      console.log(`  Location: ${event.location || 'N/A'}`);
      console.log(`  Participants: ${event.participants.length}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listDashboardEvents()
  .then(() => {
    console.log('List completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('List failed:', error);
    process.exit(1);
  });
