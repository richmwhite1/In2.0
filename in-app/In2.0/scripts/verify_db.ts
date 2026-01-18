
import { prisma } from '../lib/db';

async function main() {
    try {
        console.log('Connecting to DB...');
        const moods = await prisma.mood.findMany({ take: 5 });
        console.log(`Successfully connected. Found ${moods.length} moods.`);
        if (moods.length > 0) {
            console.log('Sample mood:', moods[0]);
        } else {
            console.log('No moods found in database, but connection successful.');
        }
    } catch (e) {
        console.error('Error connecting to DB:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
