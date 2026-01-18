
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const events = await prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    console.log('Found events:', events);

    if (events.length > 0) {
        console.log('SUCCESS: Event exists.');
    } else {
        console.log('FAILURE: No events found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
