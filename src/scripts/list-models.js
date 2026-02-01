
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Read .env.local manually
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        const apiKey = match ? match[1].trim() : null;

        if (!apiKey) {
            console.error("Could not find GEMINI_API_KEY in .env.local");
            return;
        }

        console.log("Using API Key ending in:", apiKey.slice(-4));

        // Note: The SDK does not have a comprehensive listModels method on the client instance in all versions.
        // We will try to fetch the models directly via REST to be sure.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error("API Error:", data.error);
            } else {
                console.log("\nAVAILABLE MODELS:");
                if (data.models) {
                    data.models.forEach(m => {
                        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`- ${m.name.replace('models/', '')}`);
                        }
                    });
                } else {
                    console.log("No models found in response.");
                    console.log(data);
                }
            }
        } catch (fetchError) {
            console.error("Fetch Error:", fetchError);
        }

    } catch (e) {
        console.error("Script Error:", e);
    }
}

main();
