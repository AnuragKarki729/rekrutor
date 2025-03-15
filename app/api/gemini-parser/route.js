import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    const formData = await req.formData();
    const uploadedFile = formData.get('file');

    if (!uploadedFile || !(uploadedFile instanceof File)) {
        return NextResponse.json({ error: "No file uploaded or invalid file format" }, { status: 400 });
    }

    try {
        // Extract text from PDF
        const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
        const extractedText = await extractTextFromPDF(fileBuffer);
        
        console.log("Extracted text length:", extractedText.length);
        console.log("Sample text:", extractedText.substring(0, 200));

        // Send to Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Extract the following information from this resume and format it as a JSON object with these exact fields:
        {
            "name": "full name of the candidate",
            "college": "most recent college/university name",
            "collegeLocation": "ONLY the country name from the following list: REMOTE, Afghanistan, Albania, Algeria, ... etc.",
            "experienceLevel": "either Fresher or Experienced",
            "preferedJobLocation": "ONLY the country name from the following list: REMOTE, Afghanistan, Albania, Algeria, ... etc.",
            "skills": ["array of technical and soft skills"],
            "profileLinks": ["array of LinkedIn, GitHub, portfolio URLs"],
            
            "currentCompany": "if any job has end date as 'present' or 'current', use that company name, otherwise use 'Unemployed'",
            "currentPosition": "if any job has end date as 'present' or 'current', use that position, otherwise use '-'",
            "currentJobLocation": "if any job has end date as 'present' or 'current', use that location from country list, otherwise use '-'",
            "currentSalary": "current salary in USD if mentioned, otherwise use '-'",
            "noticePeriod": "notice period if mentioned, otherwise use 'Immediate'",
            "industry": "MUST be one of: Technology, Healthcare, Finance, Education, Manufacturing, Retail, Agriculture, Construction, Transportation, Entertainment, Real Estate, Insurance, Law & Law Enforcement, Public Administration, Aerospace and Engineering, Fashion, Food and Beverage, Other",
            "otherIndustry": "If industry is 'Other', provide specific industry, otherwise null",
            "previousCompanies": [
                {
                    "companyName": "previous company name (exclude any current/present job)",
                    "position": "job title",
                    "startDate": "start date in YYYY-MM format",
                    "endDate": "end date in YYYY-MM format (must be a past date, not 'present')"
                }
            ]
        }

        Resume text:
        ${extractedText}

        Rules:
        1. Strictly maintain the JSON format
        2. For experienceLevel, use only "Fresher" or "Experienced"
        3. For ALL location fields, use EXACTLY these country names as provided in the list
        4. For industry:
           - Choose the MOST appropriate industry from the provided list based on experience, skills, and education
           - If no clear match, or if industry is very specific/niche, use "Other" and provide details in otherIndustry
           - Example: If resume shows software development experience, use "Technology"
           - Example: If resume shows medical experience, use "Healthcare"
        5. For current employment:
           - If any job entry has end date as "present" or "current", use that as current job
           - Move all details of the present/current job to current job fields
           - Do NOT include the current job in previousCompanies array
        6. Format dates as YYYY-MM where possible
        7. If a field is not found, use appropriate default values as specified`;

        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const parsedText = response.text();
        
        console.log("Gemini response:", parsedText);

        // Clean and parse the response
        const cleanedResponse = parsedText.replace(/```json|```/g, '').trim();
        
        try {
            const parsedData = JSON.parse(cleanedResponse);
            return NextResponse.json({
                success: true,
                data: parsedData
            });
        } catch (error) {
            console.error("JSON Parsing Error:", error);
            return NextResponse.json({ 
                error: "Failed to parse AI response",
                rawResponse: cleanedResponse 
            }, { status: 422 });
        }

    } catch (error) {
        console.error("Processing Error:", error);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}

function extractTextFromPDF(fileBuffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
        pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser.getRawTextContent()));

        pdfParser.parseBuffer(fileBuffer);
    });
} 