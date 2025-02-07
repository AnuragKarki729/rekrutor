'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CommonCard from "../common-card";
import JobIcon from "../job-icon";

const ApplicantList = ({ userId }) => {
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [candidateProfile, setCandidateProfile] = useState(null);
    const [openCardKey, setOpenCardKey] = useState(null);
    const [thisJob, setThisJob] = useState(null);
    const [promptOpen, setPromptOpen] = useState(false);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [rejectionPromptOpen, setRejectionPromptOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch jobs posted by this recruiter
                const jobsResponse = await fetch(`/api/jobs?recruiterId=${userId}`);
                const jobsData = await jobsResponse.json();
                setJobs(jobsData);

                console.log(jobsData)

                // Fetch all applicants for these jobs
                const jobIds = jobsData.map(job => job._id);
                console.log(jobIds, "jobIds")
                const applicantsPromises = jobIds.map(jobId =>
                    fetch(`/api/applications/job/${jobId}`).then(res => res.json())
                );
                const applicantsData = await Promise.all(applicantsPromises);
                const allApplicants = applicantsData.flat();
                setApplicants(allApplicants);
                console.log(allApplicants, "allApplicants")
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleConfirmReconsider = async () => {
        try {
            const currentStatus = applicants.find(app => app.candidateUserID === selectedCandidateId)?.status.slice(-1)[0];
            const newStatus = currentStatus === "Selected" ? "Rejected" : "Selected";
            
            if (currentStatus === "Selected") {
                // If changing from Selected to Rejected, show rejection reason prompt
                setPromptOpen(false);
                setRejectionPromptOpen(true);
                return;
            }

            // If changing from Rejected to Selected, proceed with empty rejection reason
            const response = await fetch(`/api/applications/candidate/${selectedCandidateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    rejectionReason: "" 
                })
            });
            
            if (response.ok) {
                const updatedApplicants = applicants.map(app => {
                    if (app.candidateUserID === selectedCandidateId) {
                        return {
                            ...app,
                            status: [...app.status, newStatus],
                            rejectionReason: ""
                        };
                    }
                    return app;
                });
                setApplicants(updatedApplicants);
                setPromptOpen(false);
            }
        } catch (error) {
            console.error('Error updating candidate status:', error);
        }
    };

    const handleReconsider = async (applicantId) => {
        const currentStatus = applicants.find(app => app.candidateUserID === applicantId)?.status.slice(-1)[0];
        const newStatus = currentStatus === "Selected" ? "Rejected" : "Selected";
        setSelectedCandidateId(applicantId);
        setPromptOpen(true);
    };

    const fetchCandidateProfile = async (candidateId, jobId) => {
        const cardKey = `${candidateId}-${jobId}`;
        
        if (openCardKey === cardKey) {
            // If clicking the same card, close it
            setOpenCardKey(null);
            setCandidateProfile(null);
        } else {
            // If clicking a different card, fetch and open it
            const response = await fetch(`/api/profiles/${candidateId}`);
            const data = await response.json();
            setCandidateProfile(data);
            setOpenCardKey(cardKey);
        }
    };

    const selectedApplicants = applicants.filter(
        applicant => applicant.status.slice(-1)[0] === "Selected"
    );

    const appliedApplicants = applicants.filter(
        applicant => applicant.status.slice(-1)[0] === "Applied"
    );

    const rejectedApplicants = applicants.filter(
        applicant => applicant.status.slice(-1)[0] === "Rejected"

    );

    if (loading) {
        return <div className="text-center p-4">Loading...</div>;
    }

    const renderApplicantCard = (applicant) => {
        const relatedJob = jobs.find(job => job._id === applicant.jobID);
        const isThisCardOpen = openCardKey === `${applicant.candidateUserID}-${applicant.jobID}`;

        return (
            <div key={applicant._id}>
                <CommonCard
                    className="h-25 w-25"
                    icon={
                        <div className='w-full sm:mb-2 flex flex-col items-center justify-center gap-2'>
                            {isThisCardOpen && candidateProfile && (
                                <div className="w-[300px] p-4 space-y-2 ">
                                    <h2 className="text-lg font-semibold text-center">{relatedJob.title}</h2>
                                    <h2 className="text-lg font-semibold mb-[0px] text-center">{candidateProfile.candidateInfo.name}</h2>
                                    <p className="text-gray-600 text-center">
                                        Graduated from {candidateProfile.candidateInfo.college}, {candidateProfile.candidateInfo.collegeLocation}
                                        <br />
                                    </p>
                                    <p className = "text-center ">
                                        {candidateProfile.candidateInfo.experienceLevel === "Fresher" ? <span className="font-bold">Fresher</span> 
                                        : <span className="font-bold">{candidateProfile.candidateInfo.totalExperience} years</span>} 
                                        {candidateProfile.candidateInfo.experienceLevel === "Experienced" ? <span className="text-gray-500"> (work experience)</span> : ""}

                                    </p>





                                    <div className="flex flex-wrap gap-2 mb-4"> {candidateProfile.candidateInfo.skills.split(',').map((skill, index) => ( <span key={index} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm" > {skill.trim()} </span> ))} </div>
                                    <div className="mt-4">
                                        {applicant.status.slice(-1)[0] === "Rejected" ? (
                                            <div className="text-red-600 border-2 border-gray-900 w-fit px-2 py-1 rounded-2xl font-semibold">
                                                Rejected due to: {applicant.rejectionReason || "Reason Not Specified"}
                                            </div>
                                        ) : applicant.status.slice(-1)[0] === "Selected" ? (

                                            <div className="text-green-600 border-2 border-gray-900 w-fit px-2 py-1 rounded-2xl font-semibold">
                                                Currently Selected
                                            </div>
                                        ):(
                                            <div className="text-blue-600 border-2 border-gray-900 w-fit px-2 py-1 rounded-2xl font-semibold">
                                                Applied For the Job
                                            </div>
                                        )}

            
                                        <div className="mt-4 flex flex-col sm:flex-row gap-1 overflow:hidden">
                                            

                                            {applicant.status.slice(-1)[0] === "Selected" || applicant.status.slice(-1)[0] === "Rejected" ? (
                                                <div>
                                                <p className="text-gray-700 px-1 py-1 font-bold">Change status </p>
                                                <button 
                                                    onClick={() => handleReconsider(applicant.candidateUserID)} 
                                                    className="px-1 py-1 border-2 border-gray-900 bg-blue-300 hover:scale-105 transition-all duration-300 ease-in-out text-blue-900 hover:text-blue-800 font-semibold rounded-lg"
                                                >
                                                {applicant.status.slice(-1)[0] === "Selected" ? "Reject Candidate" : "Select Candidate"}
                                            </button>
                                            </div>
                                            ) : (
                                                <button 
                                                onClick={() => handleReconsider(applicant.candidateUserID)}
                                                className="text-gray-700 px-1 py-1"></button>

                                            )}



                                        </div>
                                    </div>
                                </div>
                            )}
                            {!isThisCardOpen && (
                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full p-2">
                                    <JobIcon
                                        industry={relatedJob?.industry}

                                    />
                                    <span className={`${
                                        applicant.status.slice(-1)[0] === "Selected"
                                            ? "bg-green-500"
                                            :applicant.status.slice(-1)[0] === "Applied"
                                            ? "bg-blue-500"
                                            : "bg-red-500"

                                        } text-white px-3 py-1 rounded-full text-medium border-[3px] border-gray-900`}
                                    >
                                        {applicant.status.slice(-1)[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    }
                    title={
                        <div>
                            {!isThisCardOpen && (
                                <div className='flex flex-col items-center sm:items-start p-4 space-y-2'>
                                    <h3 className='text-xl font-bold'>
                                        {applicant.name}
                                    </h3>
                                    <p className='text-lg text-gray-600'>
                                        {relatedJob?.title}
                                    </p>
                                    <p className='text-sm text-gray-500'>
                                        Applied on: {applicant.JobAppliedOnDate}
                                    </p>
                                    {applicant.status.slice(-1)[0] === "Rejected" && (
                                        <p className="text-red-600 font-semibold text-sm">
                                            Reason: {applicant.rejectionReason || "Reason Not Specified"}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    }
                    description={
                        <div className="p-4 flex justify-end">
                            <button 
                                onClick={() => fetchCandidateProfile(applicant.candidateUserID, applicant.jobID)}
                                className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:scale-105 transition-all duration-300 ease-in-out text-white text-lg rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
                            >
                                {isThisCardOpen ? "Close Profile" : "View Profile"}
                            </button>
                        </div>
                    }
                />
            </div>
        );
    };

    const handleRejectionSubmit = async () => {
        try {
            const response = await fetch(`/api/applications/candidate/${selectedCandidateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    status: "Rejected",
                    rejectionReason: rejectionReason 
                })
            });
            
            if (response.ok) {
                const updatedApplicants = applicants.map(app => {
                    if (app.candidateUserID === selectedCandidateId) {
                        return {
                            ...app,
                            status: [...app.status, "Rejected"],
                            rejectionReason: rejectionReason
                        };
                    }
                    return app;
                });
                setApplicants(updatedApplicants);
                setRejectionPromptOpen(false);
                setRejectionReason("");
            }
        } catch (error) {
            console.error('Error updating candidate status:', error);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="selected" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b pb-6 pt-16 sm:pt-24">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 mb-4 sm:mb-0">
                        Applicants Overview
                    </h1>
                    <TabsList className="w-full sm:w-auto bg-transparent ">
                        <TabsTrigger value="selected" className="font-bold border-2 border-gray-900 text-base sm:text-lg rounded-3xl data-[state=active]:bg-blue-300 data-[state=active]:text-black">
                            Selected <span className="text-white ml-1 bg-blue-900 px-2 rounded-3xl">{selectedApplicants.length}</span>
                        </TabsTrigger>

                        <TabsTrigger value="applied" className="font-bold border-2 border-gray-900 text-base sm:text-lg data-[state=active]:bg-blue-300 data-[state=active]:text-black rounded-3xl">

                            Applied <span className="text-white ml-1 bg-blue-900 px-2 rounded-3xl">{appliedApplicants.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="rejected" className="font-bold border-2 border-gray-900 data-[state=active]:bg-blue-300 data-[state=active]:text-white text-base sm:text-lg rounded-3xl">
                            Rejected <span className="text-white ml-1 bg-blue-900 px-2 rounded-3xl">{rejectedApplicants.length}</span>


                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="pb-24 pt-6">
                    <TabsContent value="selected">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedApplicants.length === 0 ? (
                                <p className="text-gray-500 text-center col-span-full">No selected candidates yet</p>
                            ) : (
                                selectedApplicants.map(renderApplicantCard)
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="applied">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {appliedApplicants.length === 0 ? (
                                <p className="text-gray-500 text-center col-span-full">No applied candidates</p>
                            ) : (
                                appliedApplicants.map(renderApplicantCard)
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="rejected">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rejectedApplicants.length === 0 ? (
                                <p className="text-gray-500 text-center col-span-full">No rejected candidates</p>
                            ) : (
                                rejectedApplicants.map(renderApplicantCard)
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            {promptOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            {applicants.find(app => app.candidateUserID === selectedCandidateId)?.status.slice(-1)[0] === "Selected"
                                ? "Mark this candidate as Rejected?"
                                : "Reconsider and Select this Candidate?"
                            }
                        </h2>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setPromptOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReconsider}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rejectionPromptOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">
                            Please provide a reason for rejection
                        </h2>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-2 border rounded-md mb-4"
                            rows="3"
                            placeholder="Enter rejection reason..."
                        />
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => {
                                    setRejectionPromptOpen(false);
                                    setRejectionReason("");
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRejectionSubmit}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                disabled={!rejectionReason.trim()}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantList;
