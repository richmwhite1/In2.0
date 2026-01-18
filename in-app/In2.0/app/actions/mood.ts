'use server';

import { parseMoodFromUrl, parseMoodFromText } from '@/lib/agent';

export async function parseUrlAction(url: string) {
    try {
        const result = await parseMoodFromUrl(url);
        return { success: true, data: result };
    } catch (error) {
        console.error('Action error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function parseTextAction(text: string) {
    try {
        const result = await parseMoodFromText(text);
        return { success: true, data: result };
    } catch (error) {
        console.error('Action error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
