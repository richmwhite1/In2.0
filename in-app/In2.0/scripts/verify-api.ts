import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function verify() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No API key found in GOOGLE_GEMINI_API_KEY");
        return;
    }

    console.log(`🔑 Testing API Key: ${apiKey.substring(0, 8)}...`);

    // 1. Try gemini-1.5-flash
    console.log("\n📡 Attempt 1: gemini-1.5-flash");
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test connection");
        console.log("✅ Success! gemini-1.5-flash is working.");
        return;
    } catch (e: any) {
        console.log(`❌ Failed: ${e.message}`);
    }

    // 2. Try gemini-pro
    console.log("\n📡 Attempt 2: gemini-pro");
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Test connection");
        console.log("✅ Success! gemini-pro is working.");
        console.log("ℹ️ Please update lib/agent.ts to use 'gemini-pro'");
        return;
    } catch (e: any) {
        console.log(`❌ Failed: ${e.message}`);
    }

    // 3. Try REST API to list models (bypass SDK)
    console.log("\n📡 Attempt 3: Listing models via REST API...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ API Key is valid! Available models:");
        if (data.models) {
            data.models.forEach((m: any) => console.log(` - ${m.name}`));
        } else {
            console.log("No models found in response.");
        }
    } catch (e: any) {
        console.log(`❌ Failed to list models: ${e.message}`);
        console.log("\n⚠️ DIAGNOSIS: If this failed, your API Key is invalid or the 'Generative Language API' is NOT enabled in Google Cloud Console.");
    }
}

verify();
