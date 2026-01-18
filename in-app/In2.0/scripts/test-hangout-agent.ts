import { generateHangoutRecipe } from '../lib/agent';
import dotenv from 'dotenv';
dotenv.config();

async function testHangoutRecipe() {
    console.log('🧪 Testing Hangout Recipe Agent...');

    const activities = ['Hiking', 'Gaming', 'Movie Night'];
    const moods = ['Sunset vibes', 'Competitive', 'Chill evening'];

    for (let i = 0; i < activities.length; i++) {
        console.log(`\n📝 Generating recipe for: ${activities[i]} (${moods[i]})`);

        try {
            const recipe = await generateHangoutRecipe(activities[i], moods[i]);
            console.log('✅ AI Result:');
            console.log(`- Title: ${recipe.title}`);
            console.log(`- Location: ${recipe.location}`);
            console.log(`- Suggestion: ${recipe.description}`);
            console.log(`- Type: ${recipe.type}`);
        } catch (error) {
            console.error(`❌ Failed for ${activities[i]}:`, error);
        }
    }
}

testHangoutRecipe();
