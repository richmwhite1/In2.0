export interface EvergreenActivity {
    id: string;
    label: string;
    icon: string;
    description: string;
    defaultDuration: number; // in hours
    tags: string[];
    category: 'OUTDOORS' | 'DIGITAL' | 'FOOD' | 'CULTURE' | 'FITNESS';
}

export const activities: EvergreenActivity[] = [
    {
        id: 'hiking',
        label: 'Hiking',
        icon: '🥾',
        description: 'Explore local trails and enjoy nature.',
        defaultDuration: 3,
        tags: ['nature', 'outdoors', 'fitness'],
        category: 'OUTDOORS'
    },
    {
        id: 'gaming',
        label: 'Gaming',
        icon: '🎮',
        description: 'Join a digital room for some co-op or competitive play.',
        defaultDuration: 2,
        tags: ['digital', 'indoors', 'chill'],
        category: 'DIGITAL'
    },
    {
        id: 'movie-night',
        label: 'Movie Night',
        icon: '🍿',
        description: 'Catch a new release or a classic.',
        defaultDuration: 2.5,
        tags: ['indoors', 'culture', 'chill'],
        category: 'CULTURE'
    },
    {
        id: 'coffee',
        label: 'Coffee',
        icon: '☕',
        description: 'A quick catch-up over caffeine.',
        defaultDuration: 1,
        tags: ['food', 'social', 'quick'],
        category: 'FOOD'
    },
    {
        id: 'dinner',
        label: 'Dinner Party',
        icon: '🍷',
        description: 'Good food and even better conversation.',
        defaultDuration: 3,
        tags: ['food', 'social', 'upscale'],
        category: 'FOOD'
    },
    {
        id: 'workout',
        label: 'Workout',
        icon: '💪',
        description: 'Hit the gym or a local park together.',
        defaultDuration: 1.5,
        tags: ['fitness', 'energy'],
        category: 'FITNESS'
    },
    {
        id: 'drinks',
        label: 'Drinks',
        icon: '🍸',
        description: 'Cocktails or a draft at a local spot.',
        defaultDuration: 2,
        tags: ['food', 'social', 'nightlife'],
        category: 'FOOD'
    }
];

export function getActivityById(id: string): EvergreenActivity | undefined {
    return activities.find(a => a.id === id);
}

export function getActivitiesByCategory(category: EvergreenActivity['category']): EvergreenActivity[] {
    return activities.filter(a => a.category === category);
}
