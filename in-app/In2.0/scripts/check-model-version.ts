import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function checkVersion() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    try {
        const result = await model.generateContent("What specific model version are you? (e.g. 1.0, 1.5, 2.0)");
        console.log("Response:", result.response.text());

        // Also try to list models again to see the description of gemini-flash-latest
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest?key=${apiKey}`);
        const data = await response.json();
        console.log("\nModel Metadata:");
        console.log(`Name: ${data.name}`);
        console.log(`Version: ${data.version}`); // Check if version field exists
        console.log(`Base Model: ${data.baseModelId}`); // Sometimes helpful
        console.log(`Description: ${data.description}`);
    } catch (e) {
        console.error(e);
    }
}

checkVersion();
