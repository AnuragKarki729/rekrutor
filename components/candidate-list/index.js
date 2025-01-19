'use client'

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogTitle, DialogContent, DialogFooter } from "../ui/dialog"
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
                            <p>Experience: {currentCandidateDetails?.totalExperience} year(s)</p>
                            <p>Notice Period: {currentCandidateDetails?.noticePeriod}</p>
                            <div className="flex flex-wrap gap-2">
                                Skills:
                                {currentCandidateDetails?.skills.split(',').map((skillItem, index) => (
                                    <div
                                        key={index}
                                        className="bg-black text-white rounded-md px-3 py-1 text-sm font-medium"
                                    >
                                        {skillItem.trim()}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <div className="flex gap-3">
                                <Button onClick={() => handlePreviewResume(currentCandidateDetails)}>Resume</Button>
                                <Button onClick={() => handlePreviewVideoCV(currentCandidateDetails)}>Video CV</Button>

                                <Button
                                    onClick={() => handleUpdateJobStatus(currentCandidateDetails?.userId, 'Selected')}
                                    disabled={
                                        candidatesWithDetails.find(
                                            (item) => item.candidateUserID === currentCandidateDetails?.userId
                                        )?.status.slice(-1)[0] === "Selected"
                                    }
                                >

                                    {candidatesWithDetails.find(
                                        (item) => item.candidateUserID === currentCandidateDetails?.userId
                                    )?.status.slice(-1)[0] === "Selected"
                                        ? "Selected"
                                        : "Select"}
                                </Button>

                                <Button
                                    onClick={() => handleUpdateJobStatus(currentCandidateDetails?.userId, 'Rejected')}
                                    disabled={
                                        candidatesWithDetails.find(
                                            (item) => item.candidateUserID === currentCandidateDetails?.userId
                                        )?.status.slice(-1)[0] === "Rejected"
                                    }
                                >
                                    {candidatesWithDetails.find(
                                        (item) => item.candidateUserID === currentCandidateDetails?.userId
                                    )?.status.slice(-1)[0] === "Rejected"
                                        ? "Rejected"
                                        : "Reject"}
                                </Button>
                            </div>
                            {showResumeModal && (
                                <Dialog open={showResumeModal} onOpenChange={() => setShowResumeModal(false)}>
                                    <DialogContent className="w-full h-screen max-w-4xl">
                                        <iframe
                                            src={resumeUrl}
                                            className="w-full h-full"
                                            title="Resume Preview"
                                        ></iframe>
                                    </DialogContent>
                                </Dialog>
                            )}
                            {showVideoModal && (
                                <Dialog open={showVideoModal} onOpenChange={() => setShowVideoModal(false)}>
                                    <DialogContent className="w-full h-screen max-w-4xl">
                                        <video
                                            src={videoUrl}
                                            controls
                                            className="w-full h-full"
                                            title="Video CV Preview"
                                        />
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
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )
            }
        </div >
    );
}

export default CandidateList;
