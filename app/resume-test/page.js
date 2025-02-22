'use client';
import { useState } from 'react';

export default function ResumeTest() {
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      //console.log(response);
      const data = await response.json();
      //console.log(data);
      setResumeData(data);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Error analyzing resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resume Analysis</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="border p-2 rounded"
        />
      </div>

      {isLoading && <p>Analyzing resume...</p>}

      {resumeData && (
        <div className="mt-4 space-y-4">
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
            {/* {console.log(resumeData.personal_info)} */}
            <p>Email: {resumeData.personal_info.email}</p>
            <p>Phone: {resumeData.personal_info.phone}</p>
          </div>

          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Education</h2>
            <ul className="list-disc pl-4">
              {resumeData.education.map((edu, index) => (
                <li key={index}>{edu}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <ul className="list-disc pl-4">
              {resumeData.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
