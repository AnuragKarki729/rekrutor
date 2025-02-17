import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import {GoogleGenerativeAI} from "@google/generative-ai";
import officeParser from 'officeparser';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
    const formData = await req.formData();
    const uploadedFile = formData.get('file');

    if (!uploadedFile || !(uploadedFile instanceof File)) {
        return NextResponse.json({ error: "No file uploaded or invalid file format" }, { status: 400 });
    }

    try {
        // ✅ Convert ArrayBuffer to Buffer
        const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
        const fileType = uploadedFile.type;
        let extractedText = '';

        console.log(`Processing File: ${uploadedFile.name} (Type: ${fileType})`);

        // ✅ Handle PDF Files
        if (fileType === "application/pdf") {
            extractedText = await extractTextFromPDF(fileBuffer);

        // ✅ Handle Office Documents (.docx, .pptx, .xlsx, .ods)
        } else if (fileType.includes("officedocument") || fileType.includes("msword") || fileType.includes("vnd.openxmlformats")) {
            extractedText = await extractTextFromOffice(fileBuffer);

        } else if (fileType.includes("text/plain")) {
            extractedText = await extractTextFromPlainText(fileBuffer);
        } else {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
        }

        console.log("Extracted Text:", extractedText);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Extract the following information from this job description and format it as a JSON object with these exact fields:
        {
            "title": "job title",
            "type": "one of: Full-time, Part-time, Contract, Internship, Freelance, Temporary",
            "location": "city, country or Remote",
            "experience": "either Fresher or Experienced",
            "yearsOfExperience": "if Experienced, one of: 0-1 year, 1-2 years, 2-3 years, 3-5 years, 5+ years",
            "industry": "one of: Technology, Healthcare, Finance, Education, Manufacturing, Retail, Agriculture, Construction, Transportation, Entertainment, Real Estate, Insurance, Law & Law Enforcement, Public Administration, Aerospace and Engineering, Fashion, Food and Beverage, Other",
            "description": "brief job description of no more than 50 words",
            "skills": "comma-separated list of required skills",
            "salary": "yearly salary in USD if mentioned, otherwise empty string"
        }

        Job Description:
        ${extractedText}

        Rules:
        1. Strictly maintain the JSON format
        2. Use only the predefined options for type, experience, yearsOfExperience, and industry
        3. If a field is not found, use an empty string
        4. Keep the description concise
        5. Extract only clearly stated skills`;
        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const jobData = response.text();
        console.log("jobData", jobData)
        // Parse the response to ensure valid JSON
        const cleanedJobData = jobData.replace(/```json|```/g, '').trim();

        try {
            const parsedJobData = JSON.parse(cleanedJobData);
            return NextResponse.json(parsedJobData, { status: 200 });
        } catch (error) {
            console.error("JSON Parsing Error:", error);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }
    } catch (error) {
        console.error("File Processing Error:", error);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}

// ✅ Function to extract text from PDF using pdf2json
function extractTextFromPDF(fileBuffer) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
        pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser.getRawTextContent()));

        pdfParser.parseBuffer(fileBuffer);
    });
}

// ✅ Function to extract text from Office Documents
function extractTextFromOffice(fileBuffer) {
    return new Promise((resolve, reject) => {
        officeParser.parseOfficeAsync(fileBuffer, { newlineDelimiter: " ", ignoreNotes: true })
            .then(data => {
                const newText = data + " - Successfully parsed an Office document.";
                resolve(newText);
            })
            .catch(err => reject(err));
    });
}