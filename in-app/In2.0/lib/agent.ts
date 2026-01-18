import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { prisma } from './db';
import { Event } from './types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// Cache expiration time (24 hours in milliseconds)
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Define the "Elite" Mood Schema for consistent JSON output
const moodSchema = {
    description: "Structured event data for the Social Coordinator app",
    type: SchemaType.OBJECT,
    properties: {
        title: {
            type: SchemaType.STRING,
            description: "Catchy title of the event"
        },
        mood_tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "3-4 luxury-style tags (e.g., 'Intimate', 'High-Energy', 'Sophisticated', 'Exclusive')"
        },
        image_suggestion: {
            type: SchemaType.STRING,
            description: "Descriptive prompt for finding a high-end cover image"
        },
        location_name: {
            type: SchemaType.STRING,
            description: "Full address or venue name"
        },
        suggested_time: {
            type: SchemaType.STRING,
            description: "Suggested date and time for the event"
        },
        description_summary: {
            type: SchemaType.STRING,
            description: "A 1-2 sentence 'hook' for the event that captures its essence"
        }
    },
    required: ["title", "mood_tags", "location_name"]
} as Schema;

// Verification Result Schema
const verificationSchema = {
    description: "Venue verification result and alternatives",
    type: SchemaType.OBJECT,
    properties: {
        verified: {
            type: SchemaType.BOOLEAN,
            description: "Whether the venue exists and is open"
        },
        venue_details: {
            type: SchemaType.OBJECT,
            properties: {
                name: { type: SchemaType.STRING },
                address: { type: SchemaType.STRING },
                rating: { type: SchemaType.NUMBER },
                status: { type: SchemaType.STRING, description: "e.g., Open, Closed, Busy" }
            }
        },
        alternatives: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING },
                    reason: { type: SchemaType.STRING, description: "Why this is a vibe-match" },
                    location: { type: SchemaType.STRING }
                }
            }
        }
    },
    required: ["verified", "alternatives"]
} as Schema;

/**
 * Parse mood and event details from a URL using Gemini 1.5 Flash
 * @param url - The URL to analyze for event details
 * @returns Structured event data matching the mood schema
 */
export async function parseMoodFromUrl(url: string) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: moodSchema,
            },
        });

        const prompt = `Analyze this URL: ${url}. 

Extract the event details and summarize the 'mood' of the gathering for a premium social coordination app. 

Guidelines:
- Use elite, lifestyle-focused language that appeals to discerning social coordinators
- Mood tags should evoke atmosphere and energy (e.g., "Intimate", "High-Energy", "Sophisticated", "Exclusive", "Vibrant", "Chill", "Upscale")
- The description should be compelling and make people want to attend
- Focus on what makes this event special and unique
- If specific details aren't available, make educated suggestions based on the context

Return structured JSON matching the mood schema.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return JSON.parse(responseText);
    } catch (error) {
        console.error("Error parsing mood from URL:", error);
        throw new Error(`Failed to parse mood from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Parse mood from raw text description (alternative to URL parsing)
 * @param description - Text description of the event
 * @returns Structured event data matching the mood schema
 */
export async function parseMoodFromText(description: string) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: moodSchema,
            },
        });

        const prompt = `Analyze this event description: "${description}"

Extract and enhance the event details for a premium social coordination app.

Guidelines:
- Use elite, lifestyle-focused language
- Create 3-4 mood tags that capture the atmosphere
- Suggest a compelling title if one isn't provided
- Write a captivating 1-2 sentence summary
- If location details are vague, note that in location_name

Return structured JSON matching the mood schema.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return JSON.parse(responseText);
    } catch (error) {
        console.error("Error parsing mood from text:", error);
        throw new Error(`Failed to parse mood from text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Main entry point: Generate event recommendation from natural language prompt
 * Checks cache first, then calls Google Gemini Flash if needed
 * 
 * Example: "Find a high-end cocktail bar in Soho for 4 people"
 */
export async function generateEventRecommendation(prompt: string): Promise<Event> {
    console.log('🎯 Agent received prompt:', prompt);

    // Extract location and guest count from prompt
    const location = extractLocationFromPrompt(prompt);
    const guestCount = extractGuestCountFromPrompt(prompt);
    const normalizedLocation = normalizeLocation(location);

    console.log('📍 Extracted location:', normalizedLocation);
    console.log('👥 Guest count:', guestCount);

    // Check cache first
    const cachedEvent = await checkCache(prompt);
    if (cachedEvent) {
        console.log('✅ Cache hit - returning cached result');
        return cachedEvent;
    }

    console.log('❌ Cache miss - calling Google Gemini Flash API');

    // Call Google Gemini Flash
    const event = await callGeminiFlash(prompt, normalizedLocation, guestCount);

    // Peak Value Upgrade: Verify the venue and get alternatives
    try {
        console.log('🔍 Verifying venue existence...');
        const verification = await verifyVenueAndSuggestAlternatives(event.location, normalizedLocation, event.tags || []);
        if (verification && verification.verified) {
            console.log('✅ Venue verified:', event.location);
            // We could add more info to the event here if needed
        } else if (verification && verification.alternatives?.length > 0) {
            console.log('⚠️ Venue verification failed or uncertain. Alternatives found.');
            // Optionally swap with the first alternative if the primary is definitively closed
            if (verification.venue_details?.status === 'Permanently Closed') {
                const alt = verification.alternatives[0];
                event.location = alt.name + ', ' + alt.address;
                event.description = `(Adjusted) ${event.description}`;
            }
        }
    } catch (ve) {
        console.error('Venue verification skipped:', ve);
    }

    // Save to cache
    await saveToCache(prompt, normalizedLocation, guestCount, event);

    return event;
}

/**
 * Check Railway DB for similar cached moods
 */
async function checkCache(prompt: string): Promise<Event | null> {
    try {
        // Find cached moods in the same location with similar guest count
        // We removed the strict 24h TTL on creation. Now we just check if it's relevant.
        // Find cached moods with the exact same prompt to ensure high relevance
        const cachedMood = await prisma.mood.findFirst({
            where: {
                prompt: prompt,
            },
            orderBy: {
                createdAt: 'desc', // Newest first
            },
        });

        if (!cachedMood) {
            return null;
        }

        // Parse the cached response
        const cachedResponse = cachedMood.response as any;
        const eventDate = new Date(cachedResponse.date);

        // Smart Caching: Only return if the event is still in the future
        if (eventDate < new Date()) {
            console.log('⚠️ Cache hit but event has passed - treating as miss');
            return null;
        }

        return {
            ...cachedResponse,
            date: eventDate,
            endDate: cachedResponse.endDate ? new Date(cachedResponse.endDate) : undefined,
        };
    } catch (error) {
        console.error('Error checking cache:', error);
        return null;
    }
}

/**
 * Call Google Gemini Flash API to generate event recommendation
 */
async function callGeminiFlash(
    prompt: string,
    location: string,
    guestCount: number
): Promise<Event> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const now = new Date();
        const systemPrompt = `You are an expert social coordinator and local guide. Generate a structured event recommendation based on the user's request.

Current Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

IMPORTANT: 
- Return ONLY valid JSON.
- The Date MUST be in the future relative to the Current Date. Avoid dates in the past.
- Suggest a specific, real date and time (e.g., next Friday at 7 PM) unless the user specifies otherwise.

The JSON must match this exact structure:
{
  "id": "unique-id",
  "title": "Event name",
  "description": "Brief description",
  "image": "https://images.unsplash.com/photo-relevant-image",
  "date": "ISO 8601 date string for suggested date/time",
  "location": "Venue name, Address",
  "organizer": {
    "id": "ai-assistant",
    "name": "In. Assistant",
    "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=assistant"
  },
  "guests": [],
  "guestCount": ${guestCount},
  "isPublic": false,
  "tags": ["tag1", "tag2"],
  "status": "upcoming",
  "size": "medium",
  "aiGenerated": true
}

For the image, use Unsplash with relevant search terms. For example:
- Cocktail bar: https://images.unsplash.com/photo-1514933651103-005eec06c04b
- Restaurant: https://images.unsplash.com/photo-1517248135467-4c7edcad34c4
- Jazz club: https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f

User request: ${prompt}`;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        const text = response.text();

        // Clean up the response - remove markdown code blocks if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
        }

        // Parse JSON response
        const eventData = JSON.parse(cleanedText);

        // Ensure dates are Date objects
        return {
            ...eventData,
            date: new Date(eventData.date),
            endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
        };
    } catch (error) {
        console.error('Error calling Gemini Flash:', error);

        // Return a fallback event if API fails
        return createFallbackEvent(prompt, location, guestCount);
    }
}

/**
 * Verify venue existence using Gemini and suggest alternatives (Knowledge-based)
 * @param venueName - Name of the venue to verify
 * @param location - General location context
 * @param moodTags - Tags to match for alternatives
 */
export async function verifyVenueAndSuggestAlternatives(
    venueName: string,
    location: string,
    moodTags: string[] = []
): Promise<any> {
    const cacheKey = `verify:${venueName}:${location}`;

    // Check cache first (using prompt field as key)
    const cached = await prisma.mood.findFirst({
        where: {
            prompt: cacheKey,
            createdAt: {
                gte: new Date(Date.now() - CACHE_TTL)
            }
        }
    });

    if (cached) {
        console.log('✅ Verification cache hit');
        return cached.response;
    }

    try {
        // Use Gemini 1.5 Flash model for cost-efficient verification
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: verificationSchema,
            }
        });

        const prompt = `Verify if the venue "${venueName}" in "${location}" exists and is currently open/operating.
        
        If it exists, provide its details.
        
        Regardless of status, suggest 3 alternatives that match these vibes: ${moodTags.join(', ')}.
        If the primary venue is permanently closed or very crowded/popular, finding alternatives is critical.
        
        Return structured JSON.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        // Save to cache
        await prisma.mood.create({
            data: {
                prompt: cacheKey,
                location: location,
                guestCount: 0, // Not relevant for verification
                response: data,
            }
        });

        return data;
    } catch (error) {
        console.error("Error verifying venue:", error);
        // Fallback response
        return {
            verified: false,
            venue_details: { name: venueName, status: "Unknown" },
            alternatives: []
        };
    }
}


/**
 * Save AI response to cache
 */
async function saveToCache(
    prompt: string,
    location: string,
    guestCount: number,
    event: Event
): Promise<void> {
    try {
        await prisma.mood.create({
            data: {
                prompt,
                location,
                guestCount,
                response: event as any, // Store as JSON
            },
        });
        console.log('💾 Saved to cache');
    } catch (error) {
        console.error('Error saving to cache:', error);
        // Don't throw - caching failure shouldn't break the flow
    }
}

/**
 * Extract location from natural language prompt
 */
function extractLocationFromPrompt(prompt: string): string {
    // Simple regex patterns to extract location
    const patterns = [
        /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+for\b|\s*$)/i, // "in Soho for", "in New York"
        /\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+for\b|\s*$)/i, // "at Brooklyn"
        /\bnear\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+for\b|\s*$)/i, // "near Manhattan"
    ];

    for (const pattern of patterns) {
        const match = prompt.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    // Default location if not found
    return 'Downtown';
}

/**
 * Extract guest count from prompt
 */
function extractGuestCountFromPrompt(prompt: string): number {
    // Look for patterns like "for 4 people", "4 guests", "party of 6"
    const patterns = [
        /for\s+(\d+)\s+(?:people|person|guests?)/i,
        /party\s+of\s+(\d+)/i,
        /(\d+)\s+(?:people|person|guests?)/i,
    ];

    for (const pattern of patterns) {
        const match = prompt.match(pattern);
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
    }

    // Default to 2 if not specified
    return 2;
}

/**
 * Normalize location string for consistent cache lookups
 */
function normalizeLocation(location: string): string {
    // Convert to title case and trim
    return location
        .trim()
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Create a fallback event if API fails
 */
function createFallbackEvent(prompt: string, location: string, guestCount: number): Event {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0); // 7 PM tomorrow

    return {
        id: `fallback-${Date.now()}`,
        title: `Event in ${location}`,
        description: `We're working on finding the perfect spot for your request: "${prompt}"`,
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        date: tomorrow,
        location: location,
        organizer: {
            id: 'ai-assistant',
            name: 'In. Assistant',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=assistant',
        },
        guests: [],
        guestCount,
        isPublic: false,
        tags: ['ai-generated', 'fallback'],
        status: 'upcoming',
        size: 'medium',
        aiGenerated: true,
    };
}

/**
 * Generate a "Hangout Recipe" for spontaneous activities (Hiking, Gaming, etc.)
 */
export async function generateHangoutRecipe(activityName: string, userMood?: string): Promise<Event> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const now = new Date();
        const systemPrompt = `You are a spontaneous social coordinator. Generate a "Hangout Recipe" for the activity: "${activityName}".
        
        The user's specific mood/vibe: "${userMood || 'Just looking to do something fun'}".
        Current Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

        A "Hangout Recipe" is an informal but specific plan. 
        - If it's a physical activity like Hiking, find 2-3 real local trails (general search) and pick the best one. 
        - If it's Digital (Gaming), suggest a specific game and a setup (Discord, Twitch, etc.).
        - Suggest a "Who's down?" broadcast message that is catchy and informal.

        Return ONLY valid JSON matching this structure:
        {
            "id": "hangout-recipe-${Date.now()}",
            "title": "A catchy name for the plan",
            "description": "The 'Who's down?' message + a brief 'why' this is a good idea",
            "image": "https://images.unsplash.com/photo-relevant-image",
            "date": "Suggested ISO string for the next logical window (e.g. this evening or Saturday morning)",
            "location": "A specific venue, trail name, or 'Discord / Digital'",
            "organizer": {
                "id": "ai-assistant",
                "name": "Social Agent",
                "avatar": "https://api.dicebear.com/7.x/bottts/svg?seed=agent"
            },
            "guests": [],
            "guestCount": 0,
            "isPublic": false,
            "tags": ["${activityName.toLowerCase()}", "spontaneous", "chill"],
            "status": "upcoming",
            "type": "HANGOUT",
            "aiGenerated": true
        }`;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        const text = response.text();

        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
        }

        const eventData = JSON.parse(cleanedText);

        return {
            ...eventData,
            date: new Date(eventData.date),
        };
    } catch (error) {
        console.error('Error generating hangout recipe:', error);
        return createFallbackEvent(activityName, "Various", 2);
    }
}

/**
 * Generate multiple candidate options for a spontaneous hangout to facilitate consensus.
 * Prioritizes partner venues when available in the target zip code.
 */
export async function generateConsensusOptions(
    activityName: string,
    userMood?: string,
    zipCode?: string
): Promise<EventOption[]> {
    try {
        // Check for partner venues in the zip code
        let partnerVenue: EventOption | null = null;
        if (zipCode) {
            const partner = await getPartnerVenue(activityName, zipCode);
            if (partner) {
                partnerVenue = {
                    id: `partner-${partner.id}`,
                    title: partner.name,
                    location: partner.name,
                    description: `Our top recommended partner venue for ${activityName}`,
                    image: '', // Partner should provide this
                    voteCount: 0,
                    isTopPick: true,
                    affiliateUrl: partner.affiliateUrl,
                    partnerId: partner.id,
                    flavorTag: 'Top Pick',
                    expertTip: 'Verified partner venue with exclusive perks'
                };
            }
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const optionsNeeded = partnerVenue ? 2 : 3;
        const systemPrompt = `You are an elite concierge social coordinator helping a group decide on a high-end plan for: "${activityName}".
        Vibe: "${userMood || 'Spontaneous fun'}"

        Generate ${optionsNeeded} distinct candidate options (Venues/Setups). 
        - For physical activities, pick ${optionsNeeded} real local spots with different "flavors".
        - For digital, pick ${optionsNeeded} different games or platforms.

        ADD EXPERT LAYER:
        - For each option, provide an "expertTip" (e.g., "The sunset view at 5:00 PM is incredible here" or "Best for groups who like heavy strategy").
        - Provide a "flavorTag" (e.g. "Scenic", "Intense", "Cozy").

        Return ONLY a JSON array of ${optionsNeeded} objects matching this structure:
        [
            {
                "id": "opt-1",
                "title": "Short catchy name",
                "location": "Specific venue or platform",
                "description": "1-sentence why this is a good choice",
                "image": "https://images.unsplash.com/photo-relevant",
                "expertTip": "The expert/timing advice here",
                "flavorTag": "One word tag",
                "voteCount": 0
            },
            ...
        ]`;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        const text = response.text();

        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/```\n?/g, '');
        }

        const options = JSON.parse(cleanedText);
        const aiOptions = options.map((opt: any, i: number) => ({
            ...opt,
            id: `opt-${Date.now()}-${i}`
        }));

        // If we have a partner venue, insert it as the first option
        return partnerVenue ? [partnerVenue, ...aiOptions] : aiOptions;
    } catch (error) {
        console.error('Error generating consensus options:', error);
        return [
            { id: 'fallback-1', title: 'Option A', location: 'Location A', voteCount: 0 },
            { id: 'fallback-2', title: 'Option B', location: 'Location B', voteCount: 0 },
            { id: 'fallback-3', title: 'Option C', location: 'Location C', voteCount: 0 },
        ];
    }
}

/**
 * Helper function to get partner venue for a given activity and zip code
 */
async function getPartnerVenue(activityName: string, zipCode: string) {
    try {
        const { prisma } = await import('@/lib/db');

        // Map activity name to category
        const categoryMap: Record<string, string> = {
            'dining': 'restaurant',
            'drinks': 'bar',
            'coffee': 'bar',
            'gaming': 'entertainment',
            'hiking': 'activity',
            'sports': 'activity'
        };

        const category = categoryMap[activityName.toLowerCase()] || 'activity';

        const partner = await prisma.partner.findFirst({
            where: {
                zipCode: zipCode,
                category: category,
                isActive: true
            },
            orderBy: {
                priority: 'desc'
            }
        });

        return partner;
    } catch (error) {
        console.error('Error fetching partner venue:', error);
        return null;
    }
}
