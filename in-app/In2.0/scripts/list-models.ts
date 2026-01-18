
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
        // Note: listModels is a method on the GoogleGenerativeAI instance? 
        // Or maybe strictly on the API?
        // The SDK might not expose listModels directly on the main class in all versions.
        // Let's try direct fetch if SDK fails, but SDK documentation says it should be there?
        // Actually inspecting the SDK via intellisense is hard.
        // I'll try to use the model manager if available.
        // Or better, just catch the error.

        // Wait, the SDK doesn't have listModels on the top level class in some versions.
        // But the error message said "Call ListModels".
        // Let's try a simple script that assumes it might be missing and handle gracefully.

        // Actually, let's just try to create a model that DEFINITELY works like 'gemini-pro' and see if it works.
        // If 'gemini-pro' works, then 'gemini-1.5-flash' might just be unavailable for this key/region.

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Testing gemini-pro...");
        const result = await model.generateContent("Hello");
        console.log("gemini-pro works:", result.response.text());

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
