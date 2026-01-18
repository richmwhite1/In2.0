
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
    const key = process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) {
        console.error("❌ No GOOGLE_GEMINI_API_KEY found in environment!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log(`Fetching models from ${url.replace(key, 'HIDDEN_KEY')}...`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`❌ Error fetching models: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response body:", text);
            return;
        }

        const data = await response.json();
        console.log("✅ Models found:");
        // @ts-ignore
        if (data.models) {
            // @ts-ignore
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.displayName})`);
                console.log(`  Supported methods: ${m.supportedGenerationMethods}`);
            });
        } else {
            console.log("No models array in response:", data);
        }

    } catch (error) {
        console.error("❌ Network error:", error);
    }
}

main();
