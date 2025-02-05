import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Initialize Google AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    try {
        const { text } = await req.json();
        
        // Initialize the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

       const prompt = `Create a concise, 40-second introduction video of the following information. 
       It is a Resume Introduction video.
       The response should be in first person.
       It should be as a paragraph.
       the parsedResponse is the Resume of the person that has been parsed. 
         Make it professional and highlight the most important points.
${text}`;


        const result = await model.generateContent([prompt]);
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