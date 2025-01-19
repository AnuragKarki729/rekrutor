'use client';

import React, { useState } from 'react';
import CommonCard from '../common-card';
import { Concert_One } from 'next/font/google';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";


export default function MailComponent({
    selectedData,
    rejectedData,
    role,
    userEmail,
    userName,
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

    return (
        <div>

            {role === 'candidate' ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-baseline justify-between border-b pb-6">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Application Status
                        </h1>
                        <TabsList>
                            <TabsTrigger value="selected">Selected</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="selected">
                        <div className="mt-6">
                            {selectedData?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedData.map(([email, title, companyName], index) => (
                                        <CommonCard
                                            key={index}
                                            title={title}
                                            description={`at ${companyName}`}
                                            footerContent={
                                                <button
                                                    onClick={() =>
                                                        fetch('/api/send-candidate-email', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                recruiterEmail: email,
                                                                candidateName: userName,
                                                                candidateEmail: userEmail,
                                                                companyName: companyName,
                                                                jobTitle: title,
                                                                status: 'Selected'
                                                            }),
                                                        }).then(() => alert('Email sent to recruiter!'))
                                                    }
                                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Contact Recruiter
                                                </button>
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No selected applications found.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="rejected">
                        <div className="mt-6">
                            {rejectedData?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {rejectedData.map(([email, title, companyName], index) => (
                                        <CommonCard
                                            key={index}
                                            title={title}
                                            description={`at ${companyName}`}
                                            footerContent={
                                                <button
                                                    onClick={() =>
                                                        fetch('/api/send-candidate-email', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                recruiterEmail: email,
                                                                candidateName: userName,
                                                                candidateEmail: userEmail,
                                                                jobTitle: title,
                                                                companyName: companyName,
                                                                status: 'Rejected'
                                                            }),
                                                        }).then(() => alert('Email sent to recruiter!'))
                                                    }
                                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Appeal to Company HR
                                                </button>
                                            }
                                        />
                                    ))}
                                </div> 
                            ) : (
                                <p>No recruiters found for rejected candidates.</p>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedData.map(([candidateEmail, candidateName, jobName, companyName], index) => (
                                <CommonCard
                                    key={index}
                                    title={candidateName}
                                    description={`Applied for ${jobName} at ${companyName}`}
                                    footerContent={
                                        <button
                                            onClick={() =>
                                                fetch('/api/send-recruiter-email', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        candidateEmail: candidateEmail,
                                                         candidateName: candidateName,
                                                         jobTitle: jobName,
                                                         companyName: companyName,
                                                        recruiterEmail: userEmail,
                                                    }),
                                                }).then(() => alert('Email sent to candidate!'))
                                            
                                        //     {console.log("line170",candidateEmail, candidateName, jobName, companyName, userEmail)}    
                                        // 
                                        }
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            Send Interest Email
                                        </button>
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <p>No candidates have been selected yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
