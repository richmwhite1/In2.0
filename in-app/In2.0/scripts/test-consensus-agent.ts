import { generateConsensusOptions } from '../lib/agent';
import dotenv from 'dotenv';
dotenv.config();

async function testConsensusAgent() {
    console.log('🧪 Testing Consensus Options Agent...');

    const activities = ['Hiking', 'Gaming', 'Upscale Dinner'];
    const moods = ['Sunset vibes', 'Competitive', 'Celebratory'];

    for (let i = 0; i < activities.length; i++) {
        console.log(`\n📝 Generating options for: ${activities[i]} (${moods[i]})`);

        try {
            const options = await generateConsensusOptions(activities[i], moods[i]);
            console.log('✅ AI Result:');
            options.forEach((opt, idx) => {
                console.log(`Option ${idx + 1}:`);
                console.log(`- Title: ${opt.title}`);
                console.log(`- Location: ${opt.location}`);
                console.log(`- Description: ${opt.description}`);
            });
        } catch (error) {
            console.error(`❌ Failed for ${activities[i]}:`, error);
        }
    }
}

testConsensusAgent();
