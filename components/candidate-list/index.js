'use client'

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogTitle, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"
import '../ui/new_card.css'
import Loading from "@/components/Loading"
import PDFViewer from "@/components/PDFViewer"

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
    const [error, setError] = useState(null);
    const [isPDFOpen, setIsPDFOpen] = useState(false);
    const [currentPDFUrl, setCurrentPDFUrl] = useState('');


    // Add default avatar as a constant
    const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

    useEffect(() => {
        let isMounted = true;

        async function fetchAllDetails() {
            try {
                const detailedCandidates = await Promise.all(
                    jobApplications.map(async (jobApplicant) => {
                        try {
                            const jobID = jobApplicant?.jobID;
                            const candidateID = jobApplicant?.candidateUserID;

                            if (!jobID || !candidateID) {
                                console.warn('Missing jobID or candidateID:', { jobID, candidateID });
                                return null;
                            }

                            // Fetch job and candidate details
                            const jobResponse = await fetch(`/api/jobs/${jobID}`);
                            const candidateResponse = await fetch(`/api/profiles/${candidateID}`);

                            // Check individual responses
                            if (!jobResponse.ok) {
                                throw new Error(`Job API error: ${jobResponse.status}`);
                            }
                            if (!candidateResponse.ok) {
                                throw new Error(`Profile API error: ${candidateResponse.status}`);
                            }

                            const jobData = await jobResponse.json();
                            const candidateData = await candidateResponse.json();

                            // Validate required data
                            if (!jobData || !candidateData) {
                                throw new Error('Missing job or candidate data');
                            }

                            // Calculate scores with null checks
                            const candidateExperience = parseFloat(candidateData?.candidateInfo?.totalExperience) || 0;
                            const requiredExperience = parseFloat(jobData?.experience?.match(/[\d.]+/)?.[0]) || 0;

                            const candidateSkills = candidateData?.candidateInfo?.skills?.split(",")
                                .map(skill => skill.trim().toLowerCase()) || [];
                            const requiredSkills = jobData?.skills?.split(",")
                                .map(skill => skill.trim().toLowerCase()) || [];

                            const matchingSkillsCount = requiredSkills.filter(skill =>
                                candidateSkills.includes(skill)
                            ).length;

                            const experienceScore = candidateExperience >= requiredExperience ? 1 : 0;
                            const skillsMatchScore = requiredSkills.length > 0
                                ? matchingSkillsCount / requiredSkills.length
                                : 0;

                            return {
                                ...jobApplicant,
                                candidateDetails: candidateData?.candidateInfo,
                                jobDetails: jobData,
                                totalScore: matchingSkillsCount + experienceScore,
                                experienceScore,
                                skillsMatchScore,
                            };
                        } catch (error) {
                            console.warn('Error processing candidate:', error);
                            return null;
                        }
                    })
                );

                if (isMounted) {
                    // Filter out null values from failed fetches
                    const validCandidates = detailedCandidates.filter(candidate => candidate !== null);
                    setCandidatesWithDetails(validCandidates);

                    if (validCandidates.length === 0) {
                        setError('No valid candidates found');
                    }
                }
            } catch (error) {
                console.error('Error fetching candidate details:', error);
                if (isMounted) {
                    setError('Failed to load candidates. Please try again later.');
                }
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
            .getPublicUrl(`public/${candidate?.resume}`);
        console.log(data);

        if (data?.publicUrl && data.publicUrl.endsWith('.pdf')) {
            console.log(data.publicUrl, "data.publicUrl");
            setCurrentPDFUrl(data.publicUrl);
            setIsPDFOpen(true);
        } else {
            console.log(data.publicUrl, "data.publicUrl");
            setResumeUrl(data.publicUrl); // Set the resume URL for the iframe
            setShowResumeModal(true);
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

    const getDisplaySkills = (candidate) => {
        const candidateSkills = candidate?.candidateDetails?.skills?.split(",").map(skill => skill.trim()) || [];
        const jobSkills = candidate?.jobDetails?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || [];

        // Find matching skills
        const matchingSkills = candidateSkills.filter(skill =>
            jobSkills.includes(skill.toLowerCase())
        );

        // If there are matching skills, return them
        if (matchingSkills.length > 0) {
            return {
                skills: matchingSkills,
                isMatching: true
            };
        }

        // If no matching skills, return first 4 skills
        return {
            skills: candidateSkills.slice(0, 4),
            isMatching: false
        };
    };

    // Add error display
    if (error) {
        return (
            <div className="p-10 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    // Show loading state when no candidates are loaded yet
    if (candidatesWithDetails.length === 0) {
        return (
            <Loading />
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 gap-6 p-10 md:grid-cols-2 lg:grid-cols-3 justify-center">
                {candidatesWithDetails.map((candidate) => {
                    const displaySkills = getDisplaySkills(candidate);

                    return (
                        <div key={candidate?.candidateUserID} className="card shadow-lg" data-state="#about">
                            <div className="card-header">
                            
                                <h1 className="card-fullname">{candidate?.candidateDetails?.name}</h1>
                                <h2 className="card-jobtitle text-center">
                                    {candidate?.candidateDetails?.totalExperience === "" ? "Fresher" : candidate?.candidateDetails?.currentCompany}
                                </h2>
                            </div>
                            <div className="card-main">
                                <div className="card-content">
                                    <div className="card-subtitle text-center mt-[110px]">Match Score</div>
                                    <div className="flex justify-center transform -translate-y-[80px]">
                                        <span
                                            className={`inline-block px-2 py-0.5 rounded-lg font-bold justify-center ${candidate.totalScore >= 1.5
                                                ? "bg-green-500 text-white"
                                                : candidate.totalScore >= 1
                                                    ? "bg-yellow-500 text-black"
                                                    : "bg-red-500 text-white"
                                                }`}
                                        >
                                            {candidate.totalScore.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="card-desc mt-1 transform -translate-y-[80px]">
                                        <p className="text-sm text-black-600 mb-1 text-center font-bold mt-3">
                                            {displaySkills.isMatching ? 'Matching Skills:' : 'Top Skills:'}
                                        </p>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {displaySkills.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className={`text-xs px-2 py-1 rounded text-center ${displaySkills.isMatching
                                                        ? 'bg-green-800 text-white-800'
                                                        : 'bg-yellow-100 text-black font-bold'
                                                        }`}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center transform -translate-y-[70px]">
                                    <Button
                                        className="justify-center"
                                        onClick={() => {
                                            setCurrentCandidateDetails(candidate.candidateDetails);
                                            setShowCurrentCandidateDetailsModal(true);
                                        }}
                                    >
                                        View Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {showCurrentCandidateDetailsModal && (
                <Dialog
                    open={showCurrentCandidateDetailsModal}
                    onOpenChange={() => setShowCurrentCandidateDetailsModal(false)}
                    className="max-w-[100vh] max-h-[100vh]"
                >
                    <DialogContent className="max-h-[150vh] max-w-[100vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">
                                {currentCandidateDetails?.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                                    <p><span className="font-medium">College:</span> {currentCandidateDetails?.college}</p>
                                    <p><span className="font-medium">Location:</span> {currentCandidateDetails?.collegeLocation}</p>
                                    {console.log(currentCandidateDetails)}
                                    <p><span className="font-medium">Experience Level:</span> {currentCandidateDetails?.totalExperience === "" ? "Fresher" : currentCandidateDetails?.experienceLevel}</p>
                                </div>

                                {currentCandidateDetails?.experienceLevel === 'Experienced' && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Professional Details</h3>
                                        <p><span className="font-medium">Current Company:</span> {currentCandidateDetails?.currentCompany}</p>
                                        <p><span className="font-medium">Current Location:</span> {currentCandidateDetails?.currentJobLocation}</p>
                                        <p><span className="font-medium">Total Experience:</span> {currentCandidateDetails?.totalExperience}</p>
                                        <p><span className="font-medium">Notice Period:</span> {currentCandidateDetails?.noticePeriod}</p>
                                        <p><span className="font-medium">Current Salary:</span> ${currentCandidateDetails?.currentSalary}/year</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Skills & Preferences</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentCandidateDetails?.skills?.split(',').map((skill, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mt-4"><span className="font-medium">Preferred Location:</span> {currentCandidateDetails?.preferedJobLocation}</p>
                                </div>

                                {currentCandidateDetails?.profileLinks && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Profile Links</h3>
                                        <p>{currentCandidateDetails?.profileLinks}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <div className="flex justify-evenly items-center w-full">
                                {/* Reject Button - Left */}
                                <Button
                                    onClick={() => handleUpdateJobStatus(currentCandidateDetails?.userId, 'Rejected')}
                                    disabled={
                                        candidatesWithDetails.find(
                                            (item) => item.candidateUserID === currentCandidateDetails?.userId
                                        )?.status.slice(-1)[0] === "Rejected"
                                    }
                                    className={`rounded-full p-3 ${candidatesWithDetails.find(
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
                                    className={`rounded-full p-3 ${candidatesWithDetails.find(
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

                            {isPDFOpen && (
    <div className="fixed inset-0 z-[9999] bg-white">
        <button
            onClick={() => setIsPDFOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <object
            data={`${currentPDFUrl}#view=Fit`}
            type="application/pdf"
            className="w-full h-full"
            style={{ 
                height: 'calc(100vh)', 
                width: '100%',
                border: 'none'
            }}
        >
            <p>Unable to display PDF file. <a href={currentPDFUrl} target="_blank" rel="noopener noreferrer">Download</a> instead.</p>
        </object>
    </div>
)}

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
            )}
        </div >
    );
}

export default CandidateList;
