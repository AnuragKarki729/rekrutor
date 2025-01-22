'use client'

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogTitle, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog"
import { createClient } from "@supabase/supabase-js"

const supabaseClient = createClient(
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnR0ZXpqZHdxaXhtYWZ0aXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0Mjc1MjksImV4cCI6MjA0ODAwMzUyOX0.giYTTB68BJchfDZdqnsMDpt7rhgVPOvPwYp90-Heo4c"
)

function CandidateList({ jobApplications }) {
    const [candidatesWithDetails, setCandidatesWithDetails] = useState([]);
    const [currentCandidateDetails, setCurrentCandidateDetails] = useState(null);
    const [showCurrentCandidateDetailsModal, setShowCurrentCandidateDetailsModal] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(null)
    const [showResumeModal, setShowResumeModal] = useState(false)
    const [videoUrl, setVideoUrl] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showRejectionForm, setShowRejectionForm] = useState(false); // State to show/hide rejection form
    const [rejectionReason, setRejectionReason] = useState(""); // State to hold the selected reason
    const [otherReason, setOtherReason] = useState("");
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportedVideos, setReportedVideos] = useState([]);

    // Fetch all candidate and job details once
    useEffect(() => {
        let isMounted = true;

        async function fetchAllDetails() {
            try {
                const detailedCandidates = await Promise.all(
                    jobApplications.map(async (jobApplicant) => {
                        const jobID = jobApplicant?.jobID;
                        const candidateID = jobApplicant?.candidateUserID;

                        // Fetch job and candidate details using REST API
                        const [jobResponse, candidateResponse] = await Promise.all([
                            fetch(`/api/jobs/${jobID}`),
                            fetch(`/api/profiles/${candidateID}`)
                        ]);

                        if (!jobResponse.ok || !candidateResponse.ok) {
                            throw new Error('Failed to fetch details');
                        }

                        const [jobData, candidateData] = await Promise.all([
                            jobResponse.json(),
                            candidateResponse.json()
                        ]);

                        // Rest of your scoring logic remains the same
                        const candidateExperience = candidateData?.candidateInfo?.totalExperience || 0;
                        const requiredExperience = parseFloat(jobData?.experience?.match(/[\d.]+/)?.[0]) || 0;

                        const candidateSkills = candidateData?.candidateInfo?.skills?.split(",").map((skill) => skill.trim().toLowerCase()) || [];
                        const requiredSkills = jobData?.skills?.split(",").map((skill) => skill.trim().toLowerCase()) || [];

                        const matchingSkillsCount = requiredSkills.filter((skill) => candidateSkills.includes(skill)).length;
                        const experienceScore = candidateExperience >= requiredExperience ? 1 : 0;
                        const totalScore = matchingSkillsCount + experienceScore;

                        return {
                            ...jobApplicant,
                            candidateDetails: candidateData?.candidateInfo,
                            jobDetails: jobData,
                            totalScore,
                            experienceScore,
                            skillsMatchScore: requiredSkills.length > 0 ? matchingSkillsCount / requiredSkills.length : 0,
                        };
                    })
                );

                if (isMounted) {
                    setCandidatesWithDetails(detailedCandidates);
                }
            } catch (error) {
                console.error('Error fetching candidate details:', error);
                // Handle error (maybe show a toast notification)
            }
        }

        fetchAllDetails();

        return () => {
            isMounted = false;
        };
    }, [jobApplications]);

    // Add this near your other useEffect hooks
    useEffect(() => {
        async function fetchReportedVideos() {
            try {
                const response = await fetch('/api/video-reports');
                if (!response.ok) throw new Error('Failed to fetch reports');
                
                const data = await response.json();
                const reportedUrls = data.reports
                    .filter(report => report.status === 'pending')
                    .map(report => report.videoUrl);
                    
                setReportedVideos(reportedUrls);
            } catch (error) {
                console.error('Error fetching video reports:', error);
            }
        }

        fetchReportedVideos();
    }, []);

    // Handle showing candidate details in the modal
    async function handleUpdateJobStatus(candidateUserID, getCurrentStatus, rejectionReason) {
        const candidate = candidatesWithDetails.find((item) => item.candidateUserID === candidateUserID);
        if (!candidate) return console.log("No candidate", candidateUserID);

        // Show rejection form logic remains the same
        if (getCurrentStatus === "Rejected" && !rejectionReason) {
            setCurrentCandidateDetails({
                ...candidate.candidateDetails,
                userId: candidate.candidateUserID,
                status: candidate.status,
            });
            setShowRejectionForm(true);
            return;
        }

        try {
            // Update application status using REST API
            const response = await fetch(`/api/applications/${candidate._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-revalidate-path': '/jobs'
                },
                body: JSON.stringify({
                    ...candidate,
                    status: [...candidate.status, getCurrentStatus],
                    rejectionReason,
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update application status');
            }

            // Update local state
            setCandidatesWithDetails((prev) => {
                return prev.map((item) =>
                    item.candidateUserID === candidateUserID
                        ? {
                            ...item,
                            status: [...item.status, getCurrentStatus],
                            rejectionReason: rejectionReason || "",
                        }
                        : item
                );
            });

        } catch (error) {
            console.error('Error updating application:', error);
            // Handle error (maybe show a toast notification)
        }
    }

    // Handle resume download
    function handlePreviewResume(candidate) {
        const { data } = supabaseClient.storage.from('rekrutor-public')
            .getPublicUrl(`/${candidate?.resume}`);

        if (data?.publicUrl) {
            setResumeUrl(data.publicUrl); // Set the resume URL for the iframe
            setShowResumeModal(true);    // Open the modal
        } else {
            alert("No resume available.");
        }
    }

    function handlePreviewVideoCV(candidate) {
        const publicUrl = candidate?.videoCV;
        if (publicUrl) {
            setResumeUrl(null); // Ensure resume modal is not triggered
            setVideoUrl(publicUrl); // Set the video URL for the video modal
            setShowVideoModal(true); // Open the modal
        } else {
            alert("No video CV available.");
        }
    }

    // Add this function to handle video reporting
    async function handleReportVideo(videoUrl, reason) {
        if (!videoUrl) {
            console.error('No video URL provided');
            return;
        }
        
        // Add more detailed logging
        const reportData = {
            videoUrl,
            reason,
        };
        console.log('Attempting to send report data:', reportData);
        
        try {
            const response = await fetch('/api/video-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData)
            });

            const responseData = await response.json();
            console.log('Response from server:', responseData);

            if (!response.ok) {
                throw new Error(responseData.details || 'Failed to report video');
            }

            setReportedVideos(prev => [...prev, videoUrl]);
            setShowReportDialog(false);
            setReportReason("");
            alert("Video has been reported successfully");
        } catch (error) {
            console.error('Error reporting video:', error);
            alert(error.message);
        }
    }

    return (
        <div>
            <div className="grid grid-cols-1 gap-3 p-10 md:grid-cols-2 lg:grid-cols-3">
                {candidatesWithDetails.map((candidate) => (
                    <div
                        key={candidate?.candidateUserID}
                        className={`bg-white shadow-lg w-full max-2-sm rounded-lg overflow-hidden mx-auto mt-4`}
                    >
                        <div className="px-4 my-6 flex justify-between items-center">
                            <h3 className="text-lg font-bold">{candidate?.candidateDetails?.name}</h3>
                            <Button
                                onClick={() => {
                                    setCurrentCandidateDetails(candidate.candidateDetails);
                                    setShowCurrentCandidateDetailsModal(true);
                                }}
                                className="flex h-11 items-center justify-center px-5"
                            >
                                View Profile
                            </Button>
                        </div>
                        <div className="px-4 pb-4">
                            <span
                                className={`inline-block px-3 py-1 rounded-lg font-bold ${candidate.totalScore >= 1.5
                                    ? "bg-green-500 text-white"
                                    : candidate.totalScore >= 1
                                        ? "bg-yellow-500 text-black"
                                        : "bg-red-500 text-white"
                                    }`}
                            >
                                Match Score: {candidate.totalScore.toFixed(2)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {showCurrentCandidateDetailsModal && (
                <Dialog
                    open={showCurrentCandidateDetailsModal}
                    onOpenChange={() => {
                        setCurrentCandidateDetails(null);
                        setShowCurrentCandidateDetailsModal(false);
                    }}
                >
                    <DialogContent>
                        <div>
                            <DialogTitle>{currentCandidateDetails?.name}</DialogTitle>
                            <h1>{currentCandidateDetails?.email}</h1>
                            <p>{currentCandidateDetails?.currentCompany}</p>
                            <p>{currentCandidateDetails?.currentJobLocation}</p>
                            <p>Salary: ${currentCandidateDetails?.currentSalary}</p>
                            <div className="flex items-center gap-2">
                                <p>Experience: {currentCandidateDetails?.totalExperience} year(s)</p>
                                {currentCandidateDetails?.totalExperience >= (candidatesWithDetails.find(
                                    c => c.candidateUserID === currentCandidateDetails?.userId
                                )?.jobDetails?.experience?.match(/[\d.]+/)?.[0] || 0) ? (
                                    <svg 
                                        className="w-5 h-5 text-green-500" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    <svg 
                                        className="w-5 h-5 text-yellow-500" 
                                        fill="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            d="M12 2L2 21h20L12 2zm0 3.45l6.04 11.55H5.96L12 5.45zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z"
                                        />
                                    </svg>
                                )}
                            </div>
                            <p>Notice Period: {currentCandidateDetails?.noticePeriod}</p>
                            <div className="flex flex-wrap gap-2 font-bold">
                                Skills: {currentCandidateDetails?.skills}
                            </div>
                            <div className="flex flex-wrap gap-2 font-bold">
                                Links:{' '}
                                {currentCandidateDetails?.profileLinks?.split(',').map((link, index) => {
                                    const trimmedLink = link.trim();
                                    const fullLink = trimmedLink.startsWith('http') ? trimmedLink : `https://${trimmedLink}`;
                                    
                                    return (
                                        <span key={index}>
                                            <a 
                                                href={fullLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {trimmedLink}
                                            </a>
                                            {index < currentCandidateDetails.profileLinks.split(',').length - 1 && ', '}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <DialogFooter>
                            <div className="flex justify-evenly items-center w-full">
                                {/* Reject Button - Left */}
                                <Button
                                    onClick={() => handleUpdateJobStatus(currentCandidateDetails?.userId, 'Rejected')}
                                    disabled={
                                        candidatesWithDetails.find(
                                            (item) => item.candidateUserID === currentCandidateDetails?.userId
                                        )?.status.slice(-1)[0] === "Rejected"
                                    }
                                    className={`rounded-full p-3 ${
                                        candidatesWithDetails.find(
                                            (item) => item.candidateUserID === currentCandidateDetails?.userId
                                        )?.status.slice(-1)[0] === "Rejected"
                                        ? "bg-gray-300"
                                        : "bg-red-500 hover:bg-red-600"
                                    }`}
                                >
                                    <svg 
                                        className="w-6 h-6 text-white" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </Button>

                                {/* Middle Buttons */}
                                <div className="flex gap-3">
                                    <Button onClick={() => handlePreviewResume(currentCandidateDetails)}>
                                        Resume
                                    </Button>
                                    <Button onClick={() => handlePreviewVideoCV(currentCandidateDetails)}>
                                        Video CV
                                    </Button>
                                </div>

                                {/* Select Button - Right */}
                                <Button
                                    onClick={() => handleUpdateJobStatus(currentCandidateDetails?.userId, 'Selected')}
                                    disabled={
                                        candidatesWithDetails.find(
                                            (item) => item.candidateUserID === currentCandidateDetails?.userId
                                        )?.status.slice(-1)[0] === "Selected"
                                    }
                                    className={`rounded-full p-3 ${
                                        candidatesWithDetails.find(
                                            (item) => item.candidateUserID === currentCandidateDetails?.userId
                                        )?.status.slice(-1)[0] === "Selected"
                                        ? "bg-gray-300"
                                        : "bg-green-500 hover:bg-green-600"
                                    }`}
                                >
                                    <svg 
                                        className="w-6 h-6 text-white" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </Button>
                            </div>
                            {showResumeModal && (
                                <Dialog open={showResumeModal} onOpenChange={() => setShowResumeModal(false)}>
                                    <DialogHeader>
                                            <DialogTitle>Resume Preview</DialogTitle>
                                        </DialogHeader>
                                    <DialogContent className="max-w-3xl w-[80vw] h-[70vh] p-0">
                                        <iframe
                                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resumeUrl)}`}
                                            className="w-full h-full border-0"
                                            title="Resume Preview"
                                        ></iframe>
                                    </DialogContent>
                                </Dialog>
                            )}
                            {showVideoModal && (
                                <Dialog open={showVideoModal} onOpenChange={() => setShowVideoModal(false)}>
                                    <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 mt-[5vh]">
                                        {reportedVideos.includes(videoUrl) ? (
                                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                                <p className="text-lg text-gray-600">This video has been reported by a recruiter.</p>
                                                <Button 
                                                    onClick={() => setReportedVideos(prev => 
                                                        prev.filter(url => url !== videoUrl)
                                                    )}
                                                    className="bg-blue-500 hover:bg-blue-600"
                                                >
                                                    Proceed to watch
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <video
                                                    src={videoUrl}
                                                    controls
                                                    className="w-full h-full"
                                                    title="Video CV Preview"
                                                />
                                                <Button 
                                                    className="absolute top-4 left-4 bg-red-500 hover:bg-red-600"
                                                    onClick={() => {
                                                        console.log('Current video URL when opening report dialog:', videoUrl);
                                                        setShowReportDialog(true);
                                                    }}
                                                >
                                                    REPORT VIDEO
                                                </Button>
                                            </>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            )}
                            {showRejectionForm && (
                                <Dialog open={showRejectionForm} onOpenChange={() => setShowRejectionForm(false)}>
                                    <DialogContent className="max-w-lg">
                                        <DialogTitle>Why was {currentCandidateDetails?.name} rejected?</DialogTitle>
                                        <div className="mt-4 space-y-4">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="rejectionReason"
                                                    value="Skills missing"
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                                <span>Skills missing</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="rejectionReason"
                                                    value="Experience not enough"
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                                <span>Experience not enough</span>
                                            </label>
                                            <label className="flex items-start space-x-2">
                                                <input
                                                    type="radio"
                                                    name="rejectionReason"
                                                    value="Other"
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                                <span>Other (please specify):</span>
                                            </label>
                                            {rejectionReason === "Other" && (
                                                <textarea
                                                    className="w-full border rounded p-2"
                                                    placeholder="Type your reason here..."
                                                    value={otherReason}
                                                    onChange={(e) => setOtherReason(e.target.value)}
                                                />
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                onClick={async () => {
                                                    if (rejectionReason === "Other" && !otherReason) {
                                                        alert("Please specify the reason.");
                                                        return;
                                                    }

                                                    const finalReason = rejectionReason === "Other" ? otherReason : rejectionReason;

                                                    console.log(`Reason for rejection: ${finalReason}`);
                                                    console.log("Candidate", currentCandidateDetails)
                                                    

                                                    // Call the update function with the rejection reason
                                                    await handleUpdateJobStatus(currentCandidateDetails?.userId, "Rejected", finalReason);

                                                    // Close the rejection form
                                                    setShowRejectionForm(false);
                                                    setRejectionReason("");
                                                    setOtherReason("");
                                                }}
                                            >
                                                Submit
                                            </Button>
                                            <Button onClick={() => setShowRejectionForm(false)}>Cancel</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            {showReportDialog && (
                                <Dialog open={showReportDialog} onOpenChange={() => setShowReportDialog(false)}>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Report Video</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-4">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="reportReason"
                                                    value="Inappropriate content"
                                                    onChange={(e) => setReportReason(e.target.value)}
                                                />
                                                <span>Inappropriate content</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="reportReason"
                                                    value="Video not playing"
                                                    onChange={(e) => setReportReason(e.target.value)}
                                                />
                                                <span>Video not playing</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="reportReason"
                                                    value="Spam content"
                                                    onChange={(e) => setReportReason(e.target.value)}
                                                />
                                                <span>Spam content</span>
                                            </label>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                onClick={() => {
                                                    if (!reportReason) {
                                                        alert("Please select a reason for reporting");
                                                        return;
                                                    }
                                                    console.log("Current video URL:", videoUrl);
                                                    
                                                    if (!videoUrl) {
                                                        alert("Error: Cannot identify video");
                                                        return;
                                                    }
                                                    handleReportVideo(videoUrl, reportReason);
                                                }}
                                                className="bg-red-500 hover:bg-red-600"
                                            >
                                                Submit Report
                                            </Button>
                                            <Button onClick={() => setShowReportDialog(false)}>
                                                Cancel
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )
            }
        </div >
    );
}

export default CandidateList;
