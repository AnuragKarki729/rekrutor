'use client'

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogTitle, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"
import '../ui/new_card.css'
import Loading from "@/components/Loading"
import PDFViewer from "@/components/PDFViewer"
import toast from "react-hot-toast"
import { Toaster } from "react-hot-toast"
const supabaseClient = createClient(
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnR0ZXpqZHdxaXhtYWZ0aXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0Mjc1MjksImV4cCI6MjA0ODAwMzUyOX0.giYTTB68BJchfDZdqnsMDpt7rhgVPOvPwYp90-Heo4c"
)


function calculateMatchScore(candidateData, jobData) {
    // Experience score calculation
    const candidateSkills = candidateData?.candidateInfo?.skills?.split(",")
    .map(skill => skill.trim().toLowerCase()) || [];
const jobSkills = jobData?.skills?.split(",")
    .map(skill => skill.trim().toLowerCase()) || [];
const candidateIndustry = candidateData?.candidateInfo?.industry;
const jobIndustry = jobData?.industry;
const candidateExpYears = candidateData?.candidateInfo?.totalExperience || 0;
const yearsRange = jobData?.yearsOfExperience?.match(/\((\d+)-(\d+)/);
const jobExpYears = jobData?.yearsOfExperience === "5+ years" 
    ? 5 
    : yearsRange 
        ? (parseInt(yearsRange[1]) + parseInt(yearsRange[2])) / 2 
        : 0;
const candidateExpLevel = candidateData?.candidateInfo?.experienceLevel;
const jobExpLevel = jobData?.experience;

console.log(jobData, "jobData");
console.log(candidateData, "candidateData");

// Check for matches
const industryMatch = candidateIndustry === jobIndustry;
const perfectSkillsMatch = jobSkills.every(skill => candidateSkills.includes(skill));
const mediumSkillsMatch = candidateSkills.some(skill => jobSkills.includes(skill));
const lowSkillsMatch = candidateSkills.every(skill => !jobSkills.includes(skill));
const expMatch = candidateExpYears >= jobExpYears;
const medExpMatch = candidateExpYears - jobExpYears <= 1.5 && candidateExpYears - jobExpYears >= -1.5;
const lowExpMatch = candidateExpYears < jobExpYears;
const freshGradMatch = candidateExpLevel === "Fresher" && jobExpLevel === "Fresher";

// Calculate score based on match type (1-5 scale)
let score;
if (perfectSkillsMatch && expMatch && industryMatch) {
    score = 5.0; // Perfect all-round match
}
// Near Perfect Matches (4.5)
else if (
    (perfectSkillsMatch && expMatch && !industryMatch) || // Perfect skills/exp, different industry
    (expMatch && industryMatch) || // Experience and industry match
    (freshGradMatch && industryMatch) // Fresh grad in right industry
) {
    score = 4.5;
}
// Strong Matches (4.0)
else if (
    (medExpMatch && mediumSkillsMatch && industryMatch) || // Good all-round match
    (perfectSkillsMatch && medExpMatch) // Perfect skills with okay experience
) {
    score = 4.0;
}
// Good Matches (3.5)
else if (
    (perfectSkillsMatch && medExpMatch && industryMatch) || // Perfect skills, okay exp, same industry
    (mediumSkillsMatch && expMatch && industryMatch) // Some skills, good exp, same industry
) {
    score = 3.5;
}
// Worth Considering (3.0)
else if (
    (medExpMatch && mediumSkillsMatch && !industryMatch) || // Good match but different industry
    (freshGradMatch && !industryMatch) || // Fresh grad different industry
    (perfectSkillsMatch && medExpMatch && !industryMatch) // Perfect skills but different industry
) {
    score = 3.0;
}
// Potential but Risky (2.0)
else if (
    (perfectSkillsMatch && lowExpMatch && industryMatch) || // Right skills but underexperienced
    (mediumSkillsMatch && lowExpMatch && industryMatch) // Some skills but underexperienced
) {
    score = 2.0;
}
// Low Matches (1.0)
else if (
    (lowSkillsMatch && lowExpMatch) || // No matching skills and underexperienced
    (perfectSkillsMatch && lowExpMatch && !industryMatch) // Right skills but wrong industry and experience
) {
    score = 1.0;
}
// Default case for any remaining scenarios
else {
    score = 1.5;
}

// Count matching skills for additional context
const matchingSkillsCount = jobSkills.filter(skill => 
    candidateSkills.includes(skill)
).length;

return {
    candidateData,
    totalScore: score,
    matchingSkillsCount,
    experienceMatch: expMatch || medExpMatch,
    industryMatch,
    skillsMatch: perfectSkillsMatch || mediumSkillsMatch
};
}

function CandidateList({ jobApplications }) {
    const [candidatesWithDetails, setCandidatesWithDetails] = useState([]);
    const [currentCandidateDetails, setCurrentCandidateDetails] = useState(null);
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
    const [swipedCandidates, setSwipedCandidates] = useState([]); // NEW state to track swiped cards
    const [slideCardLeft, setSlideCardLeft] = useState(false);
    const [slidingCardId, setSlidingCardId] = useState(null);


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
    
                            // Calculate match scores
                            const matchScores = calculateMatchScore(candidateData, jobData);
    
                            return {
                                ...jobApplicant,
                                candidateDetails: candidateData?.candidateInfo,
                                jobDetails: jobData,
                                ...matchScores // Spread the calculated scores
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

    async function handleSelectCandidate(candidateUserID) {
        console.log(candidateUserID, "candidateUserID");
        console.log(swipedCandidates, "swipedCandidates");
        // Add candidate id to the state triggering the CSS animation
        setSwipedCandidates(prev => [...prev, candidateUserID]);
       
        // Wait for the animation to complete (here 500ms, adjust as needed)
        setTimeout(() => {
            // Now update application status with 'Selected'
            handleUpdateJobStatus(candidateUserID, 'Selected');
        }, 500);

    }

    // Handle showing candidate details in the modal
    async function handleUpdateJobStatus(candidateUserID, getCurrentStatus, rejectionReason) {
        console.log(candidatesWithDetails, "candidatesWithDetails");
        console.log(getCurrentStatus, "getCurrentStatus");
        console.log(rejectionReason, "rejectionReason");
        console.log(candidateUserID, "candidateUserID");
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
        if (!candidate?.resume) {
            toast.error("No resume available");
            return;
        }
    

        // Determine the correct path based on the resume string format
        const storagePath = candidate.resume.startsWith('public/') 
            ? candidate.resume.substring(7) // Remove 'public/' prefix
            : `public/${candidate.resume}`;  // Add 'public/' prefix
    
        const { data } = supabaseClient.storage
            .from('rekrutor-public')
            .getPublicUrl(storagePath);
    
        console.log('Storage path:', storagePath);
        console.log('Public URL:', data?.publicUrl);

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
            toast.error("No video CV available.");
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
            toast.success("Video has been reported successfully");
        } catch (error) {
            console.error('Error reporting video:', error);
            toast.error('Error reporting video');
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
        <div className="grid grid-cols-1 gap-6 p-10 md:grid-cols-2 lg:grid-cols-3 justify-center">
            {candidatesWithDetails.map((candidate) => {
                const displaySkills = getDisplaySkills(candidate);
                const isDetailView = currentCandidateDetails?.userId === candidate.candidateUserID;
                const isSwipedRight = swipedCandidates.includes(candidate.candidateUserID);
                return (
                    
                    <div 
                        key={candidate?.candidateUserID} 
                        className={`card shadow-lg w-[300px] ${
                            isSwipedRight ? 'swipeRight' : ''
                        } ${
                            slidingCardId === candidate?.candidateUserID ? 'slide-left' : ''
                        }`}
                        data-state="#about"
                    >
                        {!isDetailView ? (
                            // Original card view
                            <>
                                <div className="card-header">
                                    <h1 className="card-fullname text-gray-900">{candidate?.candidateDetails?.name}</h1>
                                    <h2 className="card-jobtitle">
                                        {candidate?.candidateDetails?.totalExperience === "" ? "Fresher" : candidate?.candidateDetails?.currentCompany}
                                    </h2>
                                </div>
                                <div className="card-main">
                                    <div className="card-content">
                                        <div className="card-subtitle text-center mt-[110px] text-gray-900">Match Score</div>
                                        <div className="flex justify-center transform -translate-y-[80px]">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-lg font-bold justify-center ${candidate.totalScore >= 1.5
                                                    ? "bg-green-500 text-white"
                                                    : candidate.totalScore >= 1
                                                        ? "bg-yellow-500 text-black"
                                                        : "bg-red-500 text-white"
                                                    }`}
                                            >{console.log(candidate)}
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
                                                            ? 'bg-green-800 text-white'
                                                            : 'bg-yellow-100 text-white font-bold'
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
                                            className="justify-center hover:scale-105 hover:bg-gray-900 hover:text-white transition-all duration-300"
                                            onClick={() => {
                                                const candidateDetailswithId = { ...candidate.candidateDetails, userId: candidate.candidateUserID, status: candidate.status }
                                                setCurrentCandidateDetails(candidateDetailswithId);
                                            }}
                                        >
                                            View Profile
                                        </Button>
                                    </div>

                                </div>
                                <h2 className="card-subtitle text-center mt-[-80px]">
                                    <div className="text-sm text-white mb-4 flex justify-center">
                                        {candidate.status.slice(-1)[0] === "Rejected" ? (
                                            <div className="bg-red-500 rounded-full px-2 py-1 text-center">Rejected Candidate</div>

                                        ) : candidate.status.slice(-1)[0] === "Selected" ? (
                                            <div className="bg-green-500 rounded-full px-2 py-1 text-center">Selected Candidate</div>
                                        ) : candidate.status.slice(-1)[0] === "Applied" ? (
                                            <div className="bg-cyan-800 rounded-full px-2 py-1 text-center">Select OR Reject ?</div>
                                        ) : null}
                                    </div>
                                </h2>
                            </>
                        ) : (
                            <>
                                <div className="card-header">
                                    <h1 className="card-fullname ml-2 mr-2">
                                        <div className="flex justify-evenly mt-[-70px]">
                                            <p className="text-black">{candidate?.candidateDetails?.name}</p>
                                            <Button
                                                onClick={() => setCurrentCandidateDetails(null)}
                                                className="p-1 h-4 hover:bg-gray-300 mt-[7px] ml-[5px]"
                                            >
                                                Flip Card
                                            </Button>

                                        </div>
                                    </h1>

                                </div>
                                <div className="card-main">
                                    <div className="card-content ml-2">
                                        {/* Personal Information */}

                                        {candidate?.candidateDetails?.experienceLevel === 'Fresher' && (
                                            <div>
                                                <p><span className="text-sm font-semibold text-gray-900">College:</span> <span className="text-sm text-gray-900">{candidate?.candidateDetails?.college}</span></p>
                                                <p><span className="text-sm font-semibold text-gray-900">Location:</span> <span className="text-sm text-gray-900">{candidate?.candidateDetails?.collegeLocation}</span></p>


                                                <p><span className="text-sm font-semibold text-gray-900">Experience Level:</span> <span className="text-sm text-gray-900">{candidate?.candidateDetails?.totalExperience === "" ? "Fresher" : candidate?.candidateDetails?.experienceLevel}</span></p>


                                            </div>
                                        )}
                                        {/* Professional Details */}

                                        {candidate?.candidateDetails?.experienceLevel === 'Experienced' && (
                                            <div className="ml-2 mr-2">
                                                {/* <h2 className="text-medium font-semibold mb-0 ">Professional Details</h2> */}
                                                <p className="text-center text-gray-900 font-bold mt-2"><span className="text-sm"> {candidate?.candidateDetails?.currentCompany} - {candidate?.candidateDetails?.currentPosition}, {candidate?.candidateDetails?.currentJobLocation}</span></p> 
                                                <div className="flex justify-center">
                                                <span className="text-sm bg-green-900 rounded-full px-2 py-1"> ${candidate?.candidateDetails?.currentSalary}/year</span>
                                                </div>
                                                <p className="text-center text-gray-900"><span className="text-sm"> {candidate?.candidateDetails?.noticePeriod}</span><span className="text-gray-500 text-sm"> Notice Period</span></p>
                                                {candidate.candidateDetails?.previousCompanies?.length > 0 ? (

                                                    <div className="text-sm ml-2 items-center text-center bg-gradient-to-r from-gray-500 to-blue-200 rounded-md">
                                                        {candidate.candidateDetails.previousCompanies.map((company, index) => (

                                                            <p key={index} className="mb-2 text-black rounded-full text-sm mr-4 ml-1">
                                                               • {company.companyName} - {company.position} [{company.startDate.slice(0, 4)} - {company.endDate.slice(0, 4)}]
                                                            </p>

                                                        ))}

                                                    </div>
                                                ) : (
                                                    <p className="text-sm ml-2 text-center">No previous companies</p>
                                                )}
                                                <div className="flex justify-center mt-0 mb-0">
                                                <p><span className="font-semibold text-sm text-gray-900">Work Exp:</span><span className="text-sm text-gray-900"> {candidate?.candidateDetails?.totalExperience} years</span></p>
                                                </div>
                                            </div>


                                        )}

                                        {/* Skills & Preferences */}
                                        <div className="mt-[20px] ml-2 mr-2">
                                            {/* <h3 className="text-medium font-semibold mb-2 text-center">
                                                {candidate?.candidateDetails?.experienceLevel === 'Experienced' ? 'Top Skills:' : 'Skills:'}
                                            </h3> */}

                                            <div className="flex flex-wrap gap-2 justify-center max-h-[180px] overflow-y-auto scroll-smooth">
                                                {candidate?.candidateDetails?.experienceLevel === 'Experienced'
                                                    ? ((candidate?.candidateDetails?.skills || '')
                                                        .split(',')
                                                        .filter(skill => skill.trim().length > 0)
                                                        .sort(() => 0.5 - Math.random())
                                                        .slice(0, 4)
                                                    ).map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="items-center justify-center px-2 py-2 bg-gradient-to-r from-gray-500 to-blue-800 text-white rounded-full text-xs"
                                                        >
                                                            {skill.trim()}
                                                        </span>

                                                    ))
                                                    : (candidate?.candidateDetails?.skills || '')
                                                        .split(',')
                                                        .filter(skill => skill.trim().length > 0)
                                                        .sort(() => 0.5 - Math.random())
                                                        .slice(0, 8)
                                                        .map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="items-center justify-center px-2 py-2 bg-gradient-to-r from-gray-500 to-blue-800 mb-[5px] text-white rounded-full text-xs"
                                                            >
                                                                {skill.trim()}
                                                            </span>




                                                        ))
                                                }
                                            </div>

                                            {candidate?.candidateDetails?.experienceLevel === 'Experienced' && (
                                                <p className="mt-1 text-center text-gray-900">
                                                    <span className="font-medium text-gray-900 text-sm">Preferred Location:</span> <span className="font-bold">{candidate?.candidateDetails?.preferedJobLocation}</span>
                                                </p>

                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-between items-center gap-2 pt-1 mt-[2px] ml-[-3px] mr-[10px] mb-2">
                                            <Button
                                                onClick={() => handleUpdateJobStatus(candidate.candidateUserID, 'Rejected')}
                                                disabled={candidate.status.slice(-1)[0] === "Rejected"}

                                                className={`rounded-full hover:scale-[1.2] hover:bg-gray-900 hover:text-white transition-all duration-300 p-3 ${candidate.status.slice(-1)[0] === "Rejected"
                                                    ? "bg-gray-300"
                                                    : "bg-red-500 hover:bg-red-600"
                                                    }`}
                                            >
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </Button>
                                            <Button 
                                                className="hover:scale-105 hover:bg-gray-900 hover:text-white transition-all duration-300"
                                                onClick={() => handlePreviewResume(candidate.candidateDetails)}>
                                                    Resume
                                                </Button>
                                                <Button 
                                                className="hover:scale-105 hover:bg-gray-900 hover:text-white transition-all duration-300"
                                                onClick={() => handlePreviewVideoCV(candidate.candidateDetails)}>
                                                    Video CV
                                                </Button>
                                            <Button
                                                onClick={() => handleSelectCandidate(candidate.candidateUserID, 'Selected')}
                                                // disabled={candidate.status.slice(-1)[0] === "Selected"}
                                                className={`rounded-full p-3 hover:scale-[1.2] hover:bg-gray-900 hover:text-white transition-all duration-300 ${candidate.status.slice(-1)[0] === "Selected"
                                                    ? "bg-gray-300"
                                                    : "bg-green-500 hover:bg-green-600"
                                                    }`}

                                            >
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                            </>


                        )}
                    </div>
                );

            })}

            {/* Keep the modals for PDF, Video, etc. */}
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
                                        toast.error("Please specify the reason.");
                                        return;
                                    }


                                    const finalReason = rejectionReason === "Other" ? otherReason : rejectionReason;
                                    
                                    // Set the specific card ID that should slide
                                    setSlidingCardId(currentCandidateDetails?.userId);

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
                                        toast.error("Please select a reason for reporting");
                                        return;
                                    }
                                    console.log("Current video URL:", videoUrl);


                                    if (!videoUrl) {
                                        toast.error("Error: Cannot identify video");
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
        </div>
    );
}

export default CandidateList;
