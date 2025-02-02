'use client';
import React from 'react';

const PDFViewer = ({ url, onClose }) => {
    return (
        <div className="fixed inset-0 z-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="fixed inset-4 bg-white rounded-lg">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 p-2 text-gray-600 hover:text-gray-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <iframe
                    src={`${url}#toolbar=0`}
                    className="w-full h-full rounded-lg"
                    title="PDF Viewer"
                    style={{ border: 'none' }}
                />
            </div>
        </div>
    );
};

export default PDFViewer; 