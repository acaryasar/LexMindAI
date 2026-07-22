import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function compareDashboardCalendar() {
  console.log('Comparing Dashboard vs Calendar events for Yaşar Acar...\n');

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
    console.log(`Is Admin or Partner: ${isAdminOrPartner}\n`);

    // --- DASHBOARD: getEvents for today only (matching new frontend behavior) ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    console.log('=== DASHBOARD EVENTS (getEvents - today only) ===');
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
      orderBy: { date: 'asc' },
    });

    console.log(`Total dashboard events: ${dashboardEvents.length}`);
    dashboardEvents.forEach(event => {
      console.log(`- ${event.title} at ${event.time || 'N/A'} (ID: ${event.id})`);
    });

    // --- CALENDAR: getEvents for July 2026 (matching calendar page behavior) ---
    const calendarStart = new Date(2026, 6, 1); // July 1, 2026
    const calendarEnd = new Date(2026, 7, 0); // July 31, 2026

    console.log('=== CALENDAR EVENTS (getEvents - July 2026) ===');
    console.log(`Date range: ${calendarStart.toISOString().split('T')[0]} to ${calendarEnd.toISOString().split('T')[0]}\n`);

    const calendarEvents = await prisma.calendarEvent.findMany({
      where: {
        deletedAt: null,
        date: {
          gte: calendarStart,
          lte: calendarEnd,
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
      orderBy: { date: 'asc' },
    });

    console.log(`Total calendar events: ${calendarEvents.length}`);
    
    // Filter to show only 22.07.2026 events for comparison
    const targetDate = new Date('2026-07-22');
    targetDate.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);
    
    const calendarEventsOnTargetDate = calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= targetDate && eventDate <= targetDateEnd;
    });

    console.log(`Calendar events on 22.07.2026: ${calendarEventsOnTargetDate.length}`);
    calendarEventsOnTargetDate.forEach(event => {
      console.log(`- ${event.title} at ${event.time || 'N/A'} (ID: ${event.id})`);
    });

    // --- COMPARISON ---
    console.log('\n=== COMPARISON (22.07.2026 only) ===');
    const dashboardIds = new Set(dashboardEvents.map(e => e.id));
    const calendarIds = new Set(calendarEventsOnTargetDate.map(e => e.id));

    const onlyInDashboard = dashboardEvents.filter(e => !calendarIds.has(e.id));
    const onlyInCalendar = calendarEventsOnTargetDate.filter(e => !dashboardIds.has(e.id));
    const inBoth = dashboardEvents.filter(e => calendarIds.has(e.id));

    console.log(`Events in both: ${inBoth.length}`);
    inBoth.forEach(event => {
      console.log(`  ✓ ${event.title} at ${event.time || 'N/A'}`);
    });

    console.log(`\nEvents only in Dashboard: ${onlyInDashboard.length}`);
    onlyInDashboard.forEach(event => {
      console.log(`  - ${event.title} at ${event.time || 'N/A'}`);
    });

    console.log(`\nEvents only in Calendar: ${onlyInCalendar.length}`);
    onlyInCalendar.forEach(event => {
      console.log(`  - ${event.title} at ${event.time || 'N/A'}`);
    });

    console.log(`\nMatch: ${onlyInDashboard.length === 0 && onlyInCalendar.length === 0 ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

compareDashboardCalendar()
  .then(() => {
    console.log('\nComparison completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Comparison failed:', error);
    process.exit(1);
  });
