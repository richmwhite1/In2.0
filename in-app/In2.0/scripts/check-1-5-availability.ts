import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function verify() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY!;
    console.log(`🔑 Testing variants with key: ${apiKey.substring(0, 8)}...`);

    const variants = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-flash-latest",
        "gemini-flash-latest" // Likely aliases to 1.5
    ];

    for (const modelName of variants) {
        process.stdout.write(`Testing ${modelName.padEnd(25)} ... `);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            console.log("✅ WORKING");
        } catch (e: any) {
            if (e.message.includes("404")) {
                console.log("❌ 404 (Not Found)");
            } else {
                console.log(`❌ Error: ${e.message.substring(0, 50)}...`);
            }
        }
    }
}

verify();
