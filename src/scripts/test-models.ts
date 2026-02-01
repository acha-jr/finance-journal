
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No GEMINI_API_KEY found in .env.local');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Note: listModels is not on the main instance in some versions, or it is.
        // Actually the SDK might not expose listModels easily on the client? 
        // It seems SDK doesn't expose listModels directly on GoogleGenerativeAI instance in the node SDK sometimes.
        // But the error message SAID "Call ListModels".

        // Using the direct API if SDK fails, but let's try assuming SDK has it or we can use the ModelService.
        // For the JS SDK, commonly it's not straightforward. 
        // Let's try a simple fetch if we are unsure, but let's look at a simpler prompt first.
        // Actually, safer bet: The error message says "models/gemini-1.5-flash is not found". 
        // This often means we need to use 'gemini-1.5-flash-latest' or just 'gemini-pro'.

        // Let's try to just 'get' the model manager if possible.
        // If not, I will just try to run a simple generate on a few candidates.

        const candidates = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-flash-001',
            'gemini-1.5-pro',
            'gemini-pro'
        ];

        console.log('Testing models...');

        for (const modelName of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hi');
                console.log(`✅ ${modelName} IS AVAILABLE`);
                return; // Found one!
            } catch (e: any) {
                console.log(`❌ ${modelName} failed: ${e.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
