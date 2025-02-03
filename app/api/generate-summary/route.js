import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Initialize Google AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function POST(req) {
    try {
        const { text } = await req.json();
        
        // Initialize the model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `Create a concise, 40-second summary (approximately 100 words) of the following information. Make it professional and highlight the key points:

${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        return NextResponse.json({ summary }, { status: 200 });
    } catch (error) {
        console.error('Error generating summary:', error);
        return NextResponse.json(
            { error: 'Failed to generate summary' },
            { status: 500 }
        );
    }
} 