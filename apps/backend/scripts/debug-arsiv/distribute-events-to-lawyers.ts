import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function distributeEventsToLawyers() {
  console.log('Starting distribution: Distributing events among lawyers...');

  try {
    // Get all users with LAWYER role
    const lawyers = await prisma.user.findMany({
      where: {
        isActive: true,
        roles: {
          some: {
            role: {
              name: 'LAWYER',
            },
          },
        },
      },
    });

    console.log(`Found ${lawyers.length} lawyers`);

    if (lawyers.length === 0) {
      console.log('No lawyers found. Exiting.');
      return;
    }

    // Get all events
    const events = await prisma.calendarEvent.findMany({
      where: {
        deletedAt: null,
      },
    });

    console.log(`Found ${events.length} events to distribute`);

    let updatedCount = 0;

    for (const event of events) {
      // Get current participants
      const currentParticipants = await prisma.calendarEventParticipant.findMany({
        where: {
          eventId: event.id,
        },
      });

      const currentParticipantIds = currentParticipants.map(p => p.userId);

      // Get lawyers who are not already participants
      const availableLawyers = lawyers.filter(
        lawyer => !currentParticipantIds.includes(lawyer.id)
      );

      if (availableLawyers.length === 0) {
        console.log(`Event ${event.id}: All lawyers are already participants`);
        continue;
      }

      // Randomly select 1-2 additional lawyers to add as participants
      const numToAdd = Math.min(
        Math.floor(Math.random() * 2) + 1,
        availableLawyers.length
      );

      // Shuffle and pick random lawyers
      const shuffled = availableLawyers.sort(() => 0.5 - Math.random());
      const lawyersToAdd = shuffled.slice(0, numToAdd);

      // Add selected lawyers as participants
      for (const lawyer of lawyersToAdd) {
        await prisma.calendarEventParticipant.create({
          data: {
            eventId: event.id,
            userId: lawyer.id,
            status: 'ACCEPTED',
            responseAt: new Date(),
          },
        });
      }

      updatedCount++;
      console.log(
        `Event ${event.id}: Added ${lawyersToAdd.length} lawyer(s) as participant(s) ` +
        `(${lawyersToAdd.map(l => l.firstName + ' ' + l.lastName).join(', ')})`
      );
    }

    console.log('\nDistribution completed!');
    console.log(`Total events processed: ${events.length}`);
    console.log(`Events updated: ${updatedCount}`);
  } catch (error) {
    console.error('Distribution failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

distributeEventsToLawyers()
  .then(() => {
    console.log('Distribution script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Distribution script failed:', error);
    process.exit(1);
  });
