import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

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

    // Save the file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = `/tmp/${file.name}`;
    require('fs').writeFileSync(tempPath, buffer);

    // Run method3.py script
    const resumeData = await new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', ['method3.py', tempPath]);
      let result = '';

      pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Python script failed'));
          return;
        }
        // Clean up temp file
        require('fs').unlinkSync(tempPath);
        // Parse the JSON output from the Python script
        try {
          const parsedData = JSON.parse(result.trim());
          resolve(parsedData);
        } catch (e) {
          reject(new Error('Failed to parse Python script output'));
        }
      });
    });

    return NextResponse.json(resumeData);
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
} 