import { findSocialGaps } from '../lib/gapFinder';
import { Event } from '../lib/types';

const mockEvents: Event[] = [
    {
        id: '1',
        title: 'Friday Work',
        description: 'Work meeting',
        image: '',
        date: new Date('2026-01-16T09:00:00'),
        endDate: new Date('2026-01-16T17:00:00'),
        location: 'Office',
        organizer: { id: '1', name: 'Me', avatar: '' },
        guests: [],
        guestCount: 0,
        isPublic: false,
        tags: [],
        status: 'upcoming'
    },
    {
        id: '2',
        title: 'Saturday Brunch',
        description: 'Brunch with family',
        image: '',
        date: new Date('2026-01-17T11:00:00'),
        endDate: new Date('2026-01-17T13:00:00'),
        location: 'Cafe',
        organizer: { id: '1', name: 'Me', avatar: '' },
        guests: [],
        guestCount: 0,
        isPublic: false,
        tags: [],
        status: 'upcoming'
    }
];

async function runTest() {
    console.log('🔍 Testing Social Gap Finder...');

    // Set current time for test context
    // We expect a gap on Friday night (after 17:00) and Saturday afternoon (after 13:00)

    try {
        const suggestions = await findSocialGaps(mockEvents);
        console.log(`✅ Found ${suggestions.length} suggestions.`);

        suggestions.forEach((s, i) => {
            console.log(`\nSuggestion ${i + 1}:`);
            console.log(`Time: ${s.startTime.toLocaleString()} - ${s.endTime.toLocaleString()}`);
            console.log(`Mood: ${s.suggestion.eventType}`);
            console.log(`Venue: ${s.suggestion.venue}`);
            console.log(`Friends: ${s.friends.map(f => f.name).join(', ')}`);
        });

        if (suggestions.length > 0) {
            console.log('\n✨ Test passed!');
        } else {
            console.log('\n❌ No suggestions found. Check if Social Windows and Friend Moods match.');
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

runTest();
