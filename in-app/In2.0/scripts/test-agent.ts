
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Try .env.local first
dotenv.config({ path: '.env' });       // Fallback

import { generateEventRecommendation } from '@/lib/agent';

async function main() {
    try {
        console.log('🧪 Testing Gemini Flash Agent...');

        const prompt = `A quiet place for coffee and reading in Brooklyn for 1 person ${Date.now()}`;
        console.log(`\n📝 Prompt: "${prompt}"`);

        const startTime = Date.now();
        const event = await generateEventRecommendation(prompt);
        const duration = Date.now() - startTime;

        console.log(`\n✅ Result received in ${duration}ms`);
        console.log('----------------------------------------');
        console.log(JSON.stringify(event, null, 2));
        console.log('----------------------------------------');

        if (event.aiGenerated) {
            console.log('🤖 Response was AI generated.');
        }

    } catch (error) {
        console.error('\n❌ Error testing agent:', error);
    }
}

main();
