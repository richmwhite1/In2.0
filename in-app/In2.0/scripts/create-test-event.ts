
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Check if exists
    let events = await prisma.event.findMany();

    if (events.length === 0) {
        console.log('No events found. Creating one...');
        const newEvent = await prisma.event.create({
            data: {
                title: 'Chill Vibe',
                description: 'Testing the agent connection',
                date: new Date(Date.now() + 86400000), // Tomorrow
                location: 'The Matrix',
                image: '/images/event-placeholder.jpg'
            }
        });
        console.log('Created event:', newEvent);
    } else {
        console.log('Events exist:', events);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
