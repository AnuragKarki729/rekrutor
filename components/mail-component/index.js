'use client';

import React, { useState } from 'react';
import CommonCard from '../common-card';
import { Concert_One } from 'next/font/google';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../ui/dialog";


export default function MailComponent({
    selectedData,
    rejectedData,
    appliedData,
    role,
    userEmail,
    userName,
    jobId,
}) {
    const sendRecruiterInterestEmail = async (
        candidateEmail,
        candidateName,
        jobName,
        companyName,
        recruiterName,
        recruiterEmail
    ) => {
        try {
            const emailPayload = {
                candidateName,
                candidateEmail,
                jobName,
                companyName,
                recruiterName,
                recruiterEmail,
            };

            const response = await fetch('/api/send-recruiter-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailPayload),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Interest email sent successfully!');
            } else {
                alert(`Failed to send email: ${result.message}`);
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('An error occurred while sending the email.');
        }
    };

    const [activeTab, setActiveTab] = useState('selected');
    const [disabledButtons, setDisabledButtons] = useState({});
    const [isPDFOpen, setIsPDFOpen] = useState(false);
    const [currentPDFUrl, setCurrentPDFUrl] = useState('');


    const handleEmailSend = async (email, title, companyName, jobId, status) => {
        try {
            // Disable the button for this specific job
            setDisabledButtons(prev => ({ ...prev, [jobId]: true }));

            const response = await fetch('/api/send-candidate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recruiterEmail: email,
                    candidateName: userName,
                    candidateEmail: userEmail,
                    companyName: companyName,
                    jobTitle: title,
                    status: status,
                    jobId: jobId
                }),
            });

            const data = await response.json();

            if (response.status === 429) {
                alert('Please wait 60 seconds before sending another email for this job application.');
                return;
            }

            if (data.success) {
                window.open(data.gmailUrl, '_blank');

                // Set a timeout to re-enable the button after 60 seconds
                setTimeout(() => {
                    setDisabledButtons(prev => ({ ...prev, [jobId]: false }));
                }, 60000);
            } else {
                alert(data.error || 'Failed to generate email link');
                // Re-enable the button if there's an error
                setDisabledButtons(prev => ({ ...prev, [jobId]: false }));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to process request');
            // Re-enable the button if there's an error
            setDisabledButtons(prev => ({ ...prev, [jobId]: false }));
        }
    };
    return (
        <div>

            {role === 'candidate' ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-baseline justify-between border-b pb-6">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Application Status
                        </h1>
                        <TabsList className="grid grid-cols-3 gap-4">
                            <TabsTrigger 
                                value="selected" 
                                className="text-green-700 hover:text-green-800 data-[state=active]:text-green-700 data-[state=active]:bg-green-0 text-lg font-bold transition-all"
                            >
                                Selected
                            </TabsTrigger>
                            <TabsTrigger 
                                value="applied" 
                                className="text-purple-700 hover:text-purple-800 data-[state=active]:text-purple-700 data-[state=active]:bg-purple-0 text-lg font-bold transition-all"
                            >
                                Applied
                            </TabsTrigger>
                            <TabsTrigger 
                                value="rejected" 
                                className="text-red-700 hover:text-red-800 data-[state=active]:text-red-700 data-[state=active]:bg-red-0 text-lg font-bold transition-all"
                            >
                                Rejected
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="selected">
                        <div className="mt-6">
                            <div className="flex justify-center text-center items-center gap-2">
                            <p className="text-gray-500"><span className="font-bold">Selected but not yet Acknowledged? </span>

                                <span><br /><span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-purple-800 text-lg font-bold">Nudge </span> your recruiter with an Interest Email</span>
                                <span className="font-bold"><br />You can only mail the recruiter once every 6 hours</span></p>
                                </div>

                            {selectedData?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                    {selectedData.map(([email, title, companyName, jobId], index) => (


                                        <CommonCard
                                            key={index}
                                            title={title}
                                            description={`at ${companyName}`}
                                            footerContent={
                                                <button
                                                    onClick={() => handleEmailSend(email, title, companyName, jobId, 'Selected')}
                                                    disabled={disabledButtons[jobId]}
                                                    className={`px-4 py-2 rounded ${
                                                        disabledButtons[jobId]
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-green-600 to-green-900 hover:from-green-700 hover:to-green-900'
                                                        } text-white transition-all duration-200`}
                                                >
                                                    {disabledButtons[jobId] ? 'Mail already sent' : 'Nudge Mail'}
                                                </button>


                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center mt-10">No selected applications found.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="applied">
                        <div className="mt-6">
                            
                            <div className="flex justify-center text-center items-center gap-2">
                                <p className="text-gray-500"><span className="font-bold">Applied To Jobs but not yet Acknowledged? </span>
                                    <span><br /><span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-purple-800 text-lg font-bold">Nudge </span> your recruiter with a mail </span>
                                    <span className="font-bold"><br />You can only mail the recruiter once every 6 hours</span></p>
                            </div>
                            {appliedData?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">



                                    {appliedData.map(([email, title, companyName, jobId], index) => (
                                        <CommonCard
                                            key={index}
                                            title={title}
                                            description={`at ${companyName}`}
                                            footerContent={

                                                <button
                                                    onClick={() => handleEmailSend(email, title, companyName, jobId, 'Applied')}
                                                    disabled={disabledButtons[jobId]}
                                                    className={`px-4 py-2 rounded ${
                                                        disabledButtons[jobId]
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-900'
                                                        } text-white transition-all duration-200`}
                                                >
                                                    {disabledButtons[jobId] ? 'Mail already sent' : 'Nudge for Acknowledgement'}



                                                </button>

                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center mt-10">No applied applications found.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="rejected">
                        <div className="mt-6">
                        <div className="flex justify-center text-center items-center gap-2">
                                <p className="text-gray-500"><span className="font-bold">Rejected from a Job? </span>
                                    <span><br /><span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-purple-800 text-lg font-bold">Nudge </span> your recruiter to change his mind using an Appeal Email </span>
                                    <span className="font-bold"><br />You can only appeal once every 6 hours</span></p>


                            </div>
                            {rejectedData?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                    {rejectedData.map(([email, title, companyName, jobId], index) => (


                                        <CommonCard
                                            key={index}
                                            title={title}
                                            description={`at ${companyName}`}
                                            footerContent={
                                                <button
                                                    onClick={() => handleEmailSend(email, title, companyName, jobId, 'Rejected')}
                                                    disabled={disabledButtons[jobId]}
                                                    className={`px-4 py-2 rounded ${
                                                        disabledButtons[jobId]
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-red-600 to-red-900 hover:from-red-700 hover:to-red-900'
                                                        } text-white transition-all duration-200`}
                                                >
                                                    {disabledButtons[jobId] ? 'Appeal already sent' : 'Appeal to Company HR'}
                                                </button>
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center mt-10">No recruiters found for rejected candidates.</p>
                            )}
                        </div>
                    </TabsContent>

                </Tabs>
            ) : (
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-950 mb-6">
                        Selected Candidates
                    </h1>
                    {selectedData?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                            {selectedData.map(([candidateEmail, candidateName, jobName, companyName], index) => (
                                <CommonCard
                                    key={index}

                                    title={candidateName}
                                    description={
                                        <div className="text-center">
                                            <p>Applied for <span className="font-semibold">{jobName}</span></p>
                                            <p>at {companyName}</p>
                                        </div>
                                    }
                                    footerContent={
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch('/api/send-recruiter-email', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            candidateEmail,
                                                            candidateName,
                                                            jobTitle: jobName,
                                                            companyName,
                                                            recruiterEmail: userEmail,

                                                        }),
                                                    });
                                                    const data = await response.json();
                                                    if (data.success) {
                                                        window.open(data.gmailUrl, '_blank');
                                                    } else {
                                                        alert('Failed to generate email link');
                                                    }
                                                } catch (error) {
                                                    console.error('Error:', error);
                                                    alert('Failed to process request');
                                                }
                                            }}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                            Send Interest Email
                                        </button>
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-lg font-medium">No candidates have been selected yet.</p>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
