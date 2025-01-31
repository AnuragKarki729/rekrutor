'use client';
import { useState } from 'react';

export default function TestDocker() {
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const API_URL = 'https://resume-parser-903918110499.us-east1.run.app';

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
        setError(null);
        setResult(null);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);
        
        try {
            const reader = new FileReader();
            reader.onload = async function(e) {
                const base64Content = e.target.result.split(',')[1];
                
                try {
                    console.log('Sending request...');
                    const response = await fetch(`${API_URL}/parse-resume`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                            
                        },
                        body: JSON.stringify({
                            body: base64Content
                        })
                    });

                    const text = await response.text();
                    console.log('Raw response:', text);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = JSON.parse(text);
                    console.log('Parsed response:', data);

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    setResult(data);
                } catch (error) {
                    console.error('Request error:', error);
                    setError(error.message);
                }
            };
            
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error('File reading error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-4 space-y-4">
                <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
                <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isLoading}
                    className={`px-4 py-2 rounded-full text-sm font-semibold
                        ${!selectedFile || isLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                >
                    {isLoading ? 'Processing...' : 'Upload and Parse Resume'}
                </button>
            </div>
            
            {error && (
                <div className="text-red-600 mt-4 p-2 bg-red-50 rounded">
                    Error: {error}
                </div>
            )}
            {result && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold mb-4">Resume Information</h2>
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Name</h3>
                            <p>{result.name}</p>
                        </div>
                        {result.skills && result.skills.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.skills.map((skill, index) => (
                                        <span 
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <pre className="mt-4 p-4 bg-gray-50 rounded overflow-auto text-sm">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}