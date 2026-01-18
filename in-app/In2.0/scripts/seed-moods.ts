import { prisma } from '../lib/db';

async function seed() {
    console.log('🌱 Seeding friend moods...');

    const profiles = [
        {
            userId: 'friend-1',
            username: 'Alex Chen',
            mood: 'cocktails',
            avatar: 'https://i.pravatar.cc/150?img=2',
        },
        {
            userId: 'friend-2',
            username: 'Sarah Johnson',
            mood: 'cocktails',
            avatar: 'https://i.pravatar.cc/150?img=3',
        },
        {
            userId: 'friend-3',
            username: 'Michael Brown',
            mood: 'chill',
            avatar: 'https://i.pravatar.cc/150?img=4',
        }
    ];

    for (const profile of profiles) {
        await prisma.profile.upsert({
            where: { userId: profile.userId },
            update: profile,
            create: profile,
        });
    }

    // Also seed a cached event for 'cocktails'
    await prisma.mood.create({
        data: {
            prompt: 'Seed: High-end cocktail bar',
            location: 'Soho, London',
            guestCount: 4,
            response: {
                title: 'Sophisticated Soho Sip',
                location: 'The Blind Pig, 58 Poland St, London W1F 7NR',
                description: 'An elite evening of craft cocktails in a hidden Soho gem.',
                image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
                tags: ['cocktails', 'sophisticated', 'exclusive'],
                date: new Date('2026-01-23T19:00:00')
            }
        }
    });

    console.log('✅ Seeding complete!');
}

seed();
