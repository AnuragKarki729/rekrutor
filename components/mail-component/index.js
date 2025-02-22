'use client';

import React, { useState } from 'react';
import CommonCard from '../common-card';
import { Concert_One } from 'next/font/google';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import toast from 'react-hot-toast';

export default function MailComponent({
    selectedData,
    rejectedData,
    appliedData,
    role,
    userEmail,
    userName,
    jobId,
    hiredFlag
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
                toast.success('Interest email sent successfully!');
            } else {
                toast.error(`Failed to send email: ${result.message}`);
            }

        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('An error occurred while sending the email.');
        }
    };

    const [activeTab, setActiveTab] = useState('selected');
    const [disabledButtons, setDisabledButtons] = useState({});
    const [isPDFOpen, setIsPDFOpen] = useState(false);
    const [currentPDFUrl, setCurrentPDFUrl] = useState('');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [selectedReason, setSelectedReason] = useState('');
    const [currentRecruiterId, setCurrentRecruiterId] = useState(null);

    const lowRatingReasons = [
        "Does not acknowledge applications",
        "Slow response time",
        "Unprofessional communication",
        "Misleading job description",
        "Ghost after initial contact",
        "Asks for personal information",
    ];

    const highRatingReasons = [
        "Quick response time",
        "Professional communication",
        "Accurate job description",
        "Follows up on applications",
        "Provides helpful feedback",
    ];


    const handleRatingClick = async (email, jobId) => {
        try {
            // Fetch recruiter details using the email
            const response = await fetch(`/api/jobs/${jobId}`);
            if (!response.ok) throw new Error('Failed to fetch job details');

            const jobData = await response.json();
            //console.log(jobData, "jobData")
            setCurrentRecruiterId(jobData.recruiterId);
            setShowRatingModal(true);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load recruiter details');
        }
    };


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
                toast.error('Please wait 60 seconds before sending another email for this job application.');
                return;
            }


            if (data.success) {
                window.open(data.gmailUrl, '_blank');

                // Set a timeout to re-enable the button after 60 seconds
                setTimeout(() => {
                    setDisabledButtons(prev => ({ ...prev, [jobId]: false }));
                }, 60000);
            } else {
                toast.error(data.error || 'Failed to generate email link');
                // Re-enable the button if there's an error
                setDisabledButtons(prev => ({ ...prev, [jobId]: false }));
            }

        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to process request');
            // Re-enable the button if there's an error
            setDisabledButtons(prev => ({ ...prev, [jobId]: false }));

        }
    };

    // console.log(selectedData, "selectedData")
    //console.log(rejectedData, "rejectedData")
    //console.log(appliedData, "appliedData")
    return (
        <div className='mt-4 bg-transparent' >

            {role === 'candidate' ? (
                <>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-baseline justify-between border-b pb-6">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Application Status
                        </h1>
                        <TabsList className="grid grid-cols-3 gap-4 bg-transparent">
                            <TabsTrigger
                                value="selected"
                                className="text-gray-900 rounded-full hover:scale-105 transition-all duration-300 data-[state=active]:bg-blue-300 text-lg font-bold transition-all"
                                style={{
                                    boxShadow: "0px 5px 10px rgba(53, 53, 53, 0.5)", // All-around shadow
                                }}
                            >
                                Selected
                            </TabsTrigger>

                            <TabsTrigger
                                value="applied"
                                className="rounded-full text-gray-900 hover:scale-105 transition-all duration-300 data-[state=active]:bg-blue-300 text-lg font-bold transition-all"
                                style={{
                                    boxShadow: "0px 5px 10px rgba(53, 53, 53, 0.5)", // All-around shadow
                                }}
                            >
                                Applied
                            </TabsTrigger>

                            <TabsTrigger
                                value="rejected"
                                className="text-gray-900 hover:text-gray-900 rounded-full data-[state=active]:bg-blue-300 text-lg font-bold transition-all hover:scale-105 duration-300"
                                style={{
                                    boxShadow: "0px 5px 10px rgba(53, 53, 53, 0.5)", // All-around shadow
                                }}
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
                                    {selectedData.map(([email, title, companyName, jobId, hiredFlag], index) => (
                                        <div 
                                            key={index}
                                            className="bg-white p-6 rounded-[20px] shadow-lg border-[3px] border-gray-900 hover:scale-[1.02] transition-all duration-200"
                                        >
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                                                <p className="text-gray-600">at {companyName}</p>
                                                
                                                <div className='flex flex-wrap gap-3'>
                                                    <button
                                                        onClick={() => handleEmailSend(email, title, companyName, jobId, 'Selected')}
                                                        disabled={disabledButtons[jobId] || hiredFlag}
                                                        className={`px-4 py-2 hover:scale-105 transition-all duration-200 rounded-xl ${
                                                            disabledButtons[jobId] || hiredFlag
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-green-600 to-green-900 hover:from-green-700 hover:to-green-900'
                                                            } text-white transition-all duration-200`}
                                                    >
                                                        {disabledButtons[jobId]
                                                            ? 'Mail already sent'
                                                            : hiredFlag
                                                                ? 'Already Hired'
                                                                : 'Nudge Mail'
                                                        }
                                                    </button>

                                                    <div className="relative group inline-block">
                                                        <button className="border-[3px] border-gray-900 rounded-xl px-4 py-2">
                                                            {hiredFlag ? 'No longer Hiring' : 'Position still open'}
                                                        </button>

                                                        {hiredFlag && (
                                                            <div className="absolute opacity-0 hover:opacity-100 
                                                                transition-opacity duration-300 text-gray-900 text-xs font-bold 
                                                                rounded-xl p-2 bg-white border-[3px] border-gray-900 transform -translate-x-0 -translate-y-14">
                                                                This Vacancy is Closed
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleRatingClick(email, jobId)}
                                                        className="px-4 py-2 hover:scale-105 transition-all duration-200 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                                    >
                                                        Rate Recruiter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
                                        <div 
                                            key={index}
                                            className="bg-white p-6 rounded-[20px] shadow-lg border-[3px] border-gray-900 hover:scale-[1.02] transition-all duration-200"
                                        >
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                                                <p className="text-gray-600">at {companyName}</p>
                                                
                                                <div className='flex flex-wrap gap-3'>
                                                    <button
                                                        onClick={() => handleEmailSend(email, title, companyName, jobId, 'Applied')}
                                                        disabled={disabledButtons[jobId]}
                                                        className={`px-4 py-2 hover:scale-105 transition-all duration-200 rounded-xl ${
                                                            disabledButtons[jobId]
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-900'
                                                            } text-white transition-all duration-200`}
                                                    >
                                                        {disabledButtons[jobId] ? 'Mail already sent' : 'Nudge for Acknowledgement'}
                                                    </button>

                                                    <div className="relative group inline-block">
                                                        <button className="border-[3px] border-gray-900 rounded-xl px-4 py-2">
                                                            {hiredFlag ? 'No longer Hiring' : 'Position still open'}
                                                        </button>

                                                        {hiredFlag && (
                                                            <div className="absolute opacity-0 hover:opacity-100 
                                                                transition-opacity duration-300 text-gray-900 text-xs font-bold 
                                                                rounded-xl p-2 bg-white border-[3px] border-gray-900 transform -translate-x-0 -translate-y-14">
                                                                This Vacancy is Closed
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleRatingClick(email, jobId)}
                                                        className="px-4 py-2 hover:scale-105 transition-all duration-200 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                                    >
                                                        Rate Recruiter
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
            <div 
                key={index}
                className="bg-white p-6 rounded-[20px] shadow-lg border-[3px] border-gray-900 hover:scale-[1.02] transition-all duration-200"
            >
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <p className="text-gray-600">at {companyName}</p>
                    
                    <div className='flex flex-wrap gap-3'>
                        <button
                            onClick={() => handleEmailSend(email, title, companyName, jobId, 'Rejected')}
                            disabled={disabledButtons[jobId]}
                            className={`px-4 py-2 hover:scale-105 transition-all duration-200 rounded-xl ${
                                disabledButtons[jobId]
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-red-600 to-red-900 hover:from-red-700 hover:to-red-900'
                                } text-white transition-all duration-200`}
                        >
                            {disabledButtons[jobId] ? 'Appeal already sent' : 'Appeal to Company HR'}
                        </button>

                        <div className="relative group inline-block">
                            <button className="border-[3px] border-gray-900 rounded-xl px-4 py-2">
                                {hiredFlag ? 'No longer Hiring' : 'Position still open'}
                            </button>

                            {hiredFlag && (
                                <div className="absolute opacity-0 hover:opacity-100 
                                    transition-opacity duration-300 text-gray-900 text-xs font-bold 
                                    rounded-xl p-2 bg-white border-[3px] border-gray-900 transform -translate-x-0 -translate-y-14">
                                    This Vacancy is Closed
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleRatingClick(email, jobId)}
                            className="px-4 py-2 hover:scale-105 transition-all duration-200 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                        >
                            Rate Recruiter
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>                            ) : (
                                <p className="text-gray-500 text-center mt-10">No recruiters found for rejected candidates.</p>
                            )}
                        </div>
                    </TabsContent>

                </Tabs>

<Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
<DialogContent className="border-[5px] border-gray-900 rounded-2xl bg-gradient-to-r from-blue-200 to-purple-200
     sm:max-w-[425px] border-[5px] border-gray-900 rounded-[30px] bg-gradient-to-r from-blue-200 to-purple-200">
    <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center">
            Rate this Recruiter
        </DialogTitle>
    </DialogHeader>
    
    {/* Star Rating */}
    <div className="flex justify-center space-x-4 my-4">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                onClick={() => setSelectedRating(star)}
                className={`text-3xl transition-colors duration-200 ${
                    star <= selectedRating 
                        ? 'text-yellow-600 hover:text-yellow-500' 
                        : 'text-gray-400 hover:text-yellow-400'
                }`}
            >
                ★
            </button>
        ))}
    </div>
    
    {/* Rating Label */}
    <p className="text-center text-gray-900 font-bold mb-4 border-[2px] border-gray-900 rounded-2xl w-[100px] mx-auto">
        {selectedRating === 1 && "Poor"}
        {selectedRating === 2 && "Fair"}
        {selectedRating === 3 && "Good"}
        {selectedRating === 4 && "Very Good"}
        {selectedRating === 5 && "Excellent"}
    </p>

    {/* Reasons Selection */}
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
    {selectedRating < 3 ? (
        // Show low rating reasons for ratings < 3
        lowRatingReasons.map((reason) => (
            <label
                key={reason}
                className="flex items-center border-[2px] border-gray-900 rounded-2xl space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
            >
                <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{reason}</span>
            </label>
        ))
    ) : selectedRating >= 3 ? (
        // Show high rating reasons for ratings >= 3
        highRatingReasons.map((reason) => (
            <label
                key={reason}
                className="flex items-center border-[2px] border-gray-900 rounded-2xl space-x-2 p-2 hover:bg-gray-100 cursor-pointer"
            >
                <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{reason}</span>
            </label>
        ))
    ) : null}
</div>

    <DialogFooter className="mt-4">
        <div className="flex gap-4">
        <Button 
            onClick={() => setShowRatingModal(false)}
            
            className="border-[2px] border-gray-900 bg-red-600 hover:bg-red-700 text-white w-[100px] mx-auto hover:scale-105 transition-all duration-200 rounded-2xl"
        >
            Cancel
        </Button>
        <Button
            onClick={async () => {
                if (!selectedRating) {
                    toast.error('Please select a rating');
                    return;
                }
                if (!selectedReason) {
                    toast.error('Please select a reason');
                    return;
                }
                
                try {
                    const response = await fetch('/api/recruiter-ratings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            recruiterId: currentRecruiterId,
                            candidateId: userEmail,
                        
                            rating: selectedRating,
                            review: selectedReason
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to submit rating');
                    }

                    toast.success('Rating submitted successfully');
                    setShowRatingModal(false);
                    setSelectedRating(0);
                    setSelectedReason('');
                } catch (error) {
                    console.error('Error:', error);
                    toast.error('Failed to submit rating');
                }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white w-[100px] mx-auto hover:scale-105 transition-all duration-200 rounded-2xl border-[2px] border-gray-900"
        >
            Submit Rating
        </Button>
        
        </div>
    </DialogFooter>
</DialogContent>
</Dialog>
</>
            ) : (
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-950 mb-6">
                        Selected Candidates
                    </h1>
                    {selectedData?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                            {selectedData.map(([candidateEmail, candidateName, jobName, companyName, jobID, hiredFlag], index) => (
                                <CommonCard
                                    key={index}

                                    title={candidateName}
                                    description={
                                        <div className="text-center">
                                            <p>Applied for <span className="font-semibold">{jobName}</span></p>
                                            <p>at {companyName} {hiredFlag === Boolean(true) ? "Hired" : "Not Hired"}</p>
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
                                                        toast.error('Failed to generate email link');
                                                    }

                                                } catch (error) {
                                                    console.error('Error:', error);
                                                    toast.error('Failed to process request');
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
