export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        // More detailed file type checking
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        const isDocx = fileType.includes('document') || fileName.endsWith('.docx') || fileName.endsWith('.doc');
        const isPdf = fileType.includes('pdf') || fileName.endsWith('.pdf');

        if (!isPdf && !isDocx) {
            return Response.json({ 
                error: 'Invalid file type. Please upload a PDF or DOCX file.' 
            }, { status: 400 });
        }

        //console.log('File type:', fileType, 'Is DOCX:', isDocx, 'Is PDF:', isPdf);

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Content = buffer.toString('base64');

        //console.log('Sending request to resume parser...');

        const parserPayload = {
            httpMethod: 'POST',
            path: '/parse-resume',
            body: base64Content,
            isBase64Encoded: true,
            fileType: isDocx ? 'docx' : 'pdf'  // Explicitly specify file type
        };
        try {
            await fetch('https://resume-parser-903918110499.us-east1.run.app/health', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout for health check
            });
            //console.log('Parser API warmed up successfully');
        } catch (error) {
            //console.log('Health check failed, proceeding with parse request anyway:', error);
        }        


        //console.log('Sending payload with file type:', parserPayload.fileType);


        const parserResponse = await fetch('https://resume-parser-903918110499.us-east1.run.app/parse-resume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(parserPayload),
            signal: AbortSignal.timeout(30000)
        });

        if (!parserResponse.ok) {
            const errorText = await parserResponse.text();
            console.error('Parser API error:', errorText);
            
            if (errorText.includes('timeout')) {
                return Response.json({ 
                    error: 'Resume parsing is taking longer than expected. Please try again.' 
                }, { status: 504 });
            }
            
            throw new Error(`Parser API error: ${errorText}`);
        }

        const data = await parserResponse.json();
        
        // Add more detailed logging
        //console.log('Raw parser response:', data);
        
        let parsedData;
        try {
            parsedData = data.body ? JSON.parse(data.body) : data;
            //console.log('Parsed data:', parsedData);

            // Validate parsed data
            if (!parsedData || (Array.isArray(parsedData.skills) && parsedData.skills.length === 0)) {
                //console.log('No skills found in parsed data');
                return Response.json({ 
                    error: 'No skills could be extracted from the resume. Please try a different file.' 
                }, { status: 422 });
            }
        } catch (parseError) {
            //console.error('Error parsing response:', parseError);
            return Response.json({ 
                error: 'Error processing parser response' 
            }, { status: 500 });
        }

        return Response.json(parsedData);
    } catch (error) {
        console.error('Resume parsing error:', error);
        
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            return Response.json({ 
                error: 'Resume parsing timed out. Please try again with a smaller file or try later.' 
            }, { status: 504 });
        }

        return Response.json({ error: error.message }, { status: 500 });
    }
} 