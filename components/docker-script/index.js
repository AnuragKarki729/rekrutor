import React, { useState } from 'react';

const ResumeUploadButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      try {
        // Get file extension
        const fileExt = selectedFile.name.split('.').pop();
        
        // Get user's first and last name from form data
        const firstName = candidateFormData.name?.split(' ')[0] || '';
        const lastName = candidateFormData.name?.split(' ').slice(1).join('') || '';
        
        // Create new filename
        const newFileName = `${firstName}_${lastName}_Resume.${fileExt}`;

        // Create new file with custom name
        const renamedFile = new File(
          [selectedFile],
          newFileName,
          { type: selectedFile.type }
        );

        // Create FormData for both APIs
        const formData = new FormData();
        formData.append('file', renamedFile);

        // First, send to text extraction API
        const textResponse = await fetch('/api/extract-resume-text', {
          method: 'POST',
          body: formData
        });

        if (!textResponse.ok) {
          throw new Error('Failed to extract text from resume');
        }

        const { extractedText } = await textResponse.json();
        console.log('Extracted text:', extractedText);

        // Then, send to resume parser API
        const parseResponse = await fetch('/api/parse-resume', {
          method: 'POST',
          body: formData
        });

        if (!parseResponse.ok) {
          throw new Error('Failed to parse resume');
        }

        const parsedData = await parseResponse.json();
        console.log('Parsed resume data:', parsedData);

        // Update form data with parsed skills
        if (parsedData.skills && parsedData.skills.length > 0) {
          setCandidateFormData(prev => ({
            ...prev,
            skills: parsedData.skills.join(', ') // Assuming skills should be comma-separated
          }));
        }

        setFile(renamedFile);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="resume-upload"
          disabled={loading}
        />
        <label
          htmlFor="resume-upload"
          className={`inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Processing...' : 'Upload Resume'}
        </label>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="font-bold text-lg">Parsed Results:</h3>
          <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadButton;