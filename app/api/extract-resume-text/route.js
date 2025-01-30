import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Create tmp directory if it doesn't exist
        const tmpDir = join(process.cwd(), 'tmp');
        try {
            await mkdir(tmpDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error('Error creating tmp directory:', error);
                throw error;
            }
        }

        // Save the file temporarily
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(tmpDir, file.name);
        await writeFile(filePath, buffer);

        // Execute the Python script with quoted paths
        const scriptPath = join(process.cwd(), 'scripts', 'teswords.py');
        const command = `python "${scriptPath}" "${filePath}"`;
        
        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            console.error('Python script error:', stderr);
            return NextResponse.json(
                { error: 'Failed to extract text' },
                { status: 500 }
            );
        }

        return NextResponse.json({ extractedText: stdout.trim() });

    } catch (error) {
        console.error('Error processing file:', error);
        return NextResponse.json(
            { error: 'Failed to process file' },
            { status: 500 }
        );
    }
} 