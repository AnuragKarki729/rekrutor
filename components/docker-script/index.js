import React, { useState } from 'react';

const ResumeUploadButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Get the base64 string without the data URL prefix
          const base64String = reader.result?.toString().split(',')[1];
          resolve(base64String || '');
        };
        reader.readAsDataURL(file);
      });

      // Send to Lambda
      const response = await fetch('http://localhost:8080/2015-03-31/functions/function/invocations', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: base64
        })
      });

      const data = await response.json();
      console.log(data);
      setResult(JSON.parse(data.body));
      console.log('Parsed Resume:', JSON.parse(data.body));

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      handleFileUpload(file);
    } else {
      alert('Please select a PDF file');
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