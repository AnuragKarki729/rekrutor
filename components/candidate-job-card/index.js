'use client'

import { Fragment, useState, useEffect } from "react"
import CommonCard from "../common-card"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "../ui/drawer"

import JobIcon from "../job-icon"
import { Button } from "../ui/button"

function CandidateJobCard({ jobItem, profileInfo, jobApplications, onApplicationSubmit }) {
    const [showJobDetailsDrawer, setShowJobDetailsDrawer] = useState(false)
    const [showMatchDetails, setShowMatchDetails] = useState(false)
    const [applying, setApplying] = useState(false)
    const [isApplied, setIsApplied] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [slideDirection, setSlideDirection] = useState('');
    const [isRemoving, setIsRemoving] = useState(false);
    const [showVacancyClosed, setShowVacancyClosed] = useState(false);
    const [recruiterEmail, setRecruiterEmail] = useState(null);
    const [recruiterRating, setRecruiterRating] = useState(null);
    const [recruiterReviews, setRecruiterReviews] = useState([]);

    useEffect(() => {
        async function fetchRecruiterEmail() {
            if (!jobItem?.recruiterId) return;

            try {
                const response = await fetch(`/api/profiles/${jobItem.recruiterId}`);
                if (!response.ok) throw new Error('Failed to fetch recruiter');

                const recruiterData = await response.json();
                console.log(recruiterData, 'recruiterData')
                // Access email from the candidateInfo object in the profile
                const role = recruiterData.role
                const email = recruiterData.email
                const recrutierMail = recruiterData.role === 'recruiter' ? email : null

                setRecruiterEmail(recrutierMail);
                console.log(recrutierMail, 'recrutierMail')

                console.log(role, 'recruiterEmail')
            } catch (error) {
                console.error('Error fetching recruiter:', error);
            }

        }

        fetchRecruiterEmail();
    }, [jobItem?.recruiterId]);

    useEffect(() => {
        async function fetchRecruiterRating() {
            if (!jobItem?.recruiterId) return;

            try {
                const response = await fetch(`/api/recruiter-ratings/${jobItem.recruiterId}`);
                if (!response.ok) throw new Error('Failed to fetch recruiter ratings');

                const ratingsData = await response.json();

                // Calculate average rating
                const avgRating = ratingsData.length > 0
                    ? ratingsData.reduce((acc, curr) => acc + curr.rating, 0) / ratingsData.length
                    : null;

                setRecruiterRating(avgRating);
                setRecruiterReviews(ratingsData.map(rating => rating.review).filter(Boolean));
            } catch (error) {
                console.error('Error fetching recruiter ratings:', error);
            }
        }

        fetchRecruiterRating();
    }, [jobItem?.recruiterId]);

    const isPersonalEmail = (email) => {
        if (!email) return false;
        const personalDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'msn.com', 'live.com', 'aol.com', 'zoho.com', 'yandex.com', 'mail.com', 'inbox.com', 'mail.ru', 'yahoo.co.in', 'yahoo.co.uk', 'yahoo.com.au', 'yahoo.com.sg', 'yahoo.com.hk', 'yahoo.com.ph', 'yahoo.com.sa', 'yahoo.com.eg',
            'yahoo.com.tr', 'yahoo.com.mx', 'yahoo.com.ar', 'yahoo.com.br', 'yahoo.com.sa', 'yahoo.com.eg', 'yahoo.com.tr', 'yahoo.com.mx', 'yahoo.com.ar', 'yahoo.com.br'];
        return personalDomains.some(domain => email.toLowerCase().endsWith(domain));
    };



    const jobExperience = parseFloat(jobItem?.experience?.match(/[\d.]+/)?.[0]) || 0
    const candidateExperience = profileInfo?.candidateInfo?.totalExperience || 0
    const candidateSkills = profileInfo?.candidateInfo?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
    const jobSkills = jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []

    const ExperienceGap = jobExperience - candidateExperience
    console.log(jobItem, 'JobItem')

    const isJobApplied = jobApplications.some(
        application => application.jobID === jobItem._id && application.status[0] === "Applied"
    );
    console.log(isJobApplied, 'isJobApplied', jobItem._id)
    // Calculate match potential
    const calculateMatchPotential = () => {
        // Get candidate and job details
        const candidateSkills = profileInfo?.candidateInfo?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
        const jobSkills = jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
        const candidateIndustry = profileInfo?.candidateInfo?.industry
        const jobIndustry = jobItem?.industry
        const candidateExpYears = profileInfo?.candidateInfo?.totalExperience || 0
        const yearsRange = jobItem?.yearsOfExperience?.match(/\((\d+)-(\d+)/);
        let jobExpYears = 0;
        if (jobItem.yearsOfExperience === "(5+ years)") {
            jobExpYears = 5
        } else {

            jobExpYears = yearsRange ? (parseInt(yearsRange[1]) + parseInt(yearsRange[2])) / 2 : 0;
        }
        console.log(jobItem.yearsOfExperience, 'jobExpYears:', jobExpYears);
        const candidateExpLevel = profileInfo?.candidateInfo?.experienceLevel
        const jobExpLevel = jobItem?.experience


        // Check for industry match
        const industryMatch = candidateIndustry === jobIndustry

        // Check for skills match
        const perfectSkillsMatch = jobSkills.every(skill => candidateSkills.includes(skill))
        console.log(perfectSkillsMatch, 'perfectSkillsMatch')
        const mediumSkillsMatch = candidateSkills.some(skill => jobSkills.includes(skill))
        const lowSkillsMatch = candidateSkills.every(skill => !jobSkills.includes(skill))
        // Check for experience match
        const expMatch = candidateExpYears >= jobExpYears
        console.log(expMatch, 'expMatch')
        const medExpMatch = candidateExpYears - jobExpYears <= 1.5 && candidateExpYears - jobExpYears >= -1.5
        const lowExpMatch = candidateExpYears < jobExpYears
        const freshGradMatch = candidateExpLevel === "Fresher" && jobExpLevel === "Fresher"

        if (perfectSkillsMatch && expMatch && industryMatch) {
            return "Perfect Match!"
        } else if (expMatch && industryMatch) {
            return "High Match"
        } else if (expMatch && perfectSkillsMatch) {
            return "High Match"
        } else if (freshGradMatch && industryMatch) {
            return "Perfect Match"
        } else if (freshGradMatch && !industryMatch) {
            return "Worth a Shot"
        } else if (lowSkillsMatch && lowExpMatch && !industryMatch) {
            return "Low Match !"
        } else if (medExpMatch && mediumSkillsMatch && industryMatch) {
            return "Great Match"
        } else if (medExpMatch && mediumSkillsMatch && !industryMatch) {
            return "Worth a Shot"
        } else if (perfectSkillsMatch) {
            if (medExpMatch && industryMatch) {
                return "Great Match"
            } else if (medExpMatch && !industryMatch) {
                return "Worth a Shot"
            } else if (lowExpMatch && industryMatch) {
                return "Low Match"
            } else if (lowExpMatch && !industryMatch) {
                return "Low Match !"
            }
        } else {
            return "Qualifications"
        }
    }


    const matchPotential = calculateMatchPotential()

    // Get match color based on potential
    const getMatchColor = () => {
        switch (matchPotential) {
            case "Perfect Match!":
                return "text-white bg-gradient-to-r from-green-600 to-purple-800"
            case "High Match":
                return "text-white bg-gradient-to-r from-orange-600 to-yellow-800"
            case "Great Match":
                return "text-white bg-gradient-to-r from-blue-600 to-purple-800"
            case "Worth a Shot":
                return "text-white bg-gradient-to-r from-blue-600 to-green-800"
            case "Low Match !":
                return "text-white bg-gradient-to-r from-red-600 to-purple-600"
            default:
                return "text-gray-100 bg-gray-500"
        }
    }

    console.log(jobApplications, 'jobApplications')


    async function handleJobApply() {
        try {
            setApplying(true);
            setSlideDirection('right-up');
            setIsRemoving(true);

            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-revalidate-path': '/jobs'
                },
                body: JSON.stringify({
                    recruiterUserID: jobItem?.recruiterId,
                    name: profileInfo?.candidateInfo?.name,
                    email: profileInfo?.email,
                    candidateUserID: profileInfo?.userId,
                    status: ['Applied'],
                    jobID: jobItem?._id,
                    JobAppliedOnDate: new Date().toLocaleDateString(),
                })
            });

            if (!response.ok) {
                throw new Error('Failed to apply for job')
            }

            const newApplication = {
                jobID: jobItem._id,
                status: ['Applied'],
            };

            // Wait for animation before triggering parent callback
            setTimeout(() => {
                if (onApplicationSubmit && jobItem?._id) {
                    onApplicationSubmit(newApplication);
                }
            }, 1500); // Match animation duration

        } catch (error) {
            console.error('Error applying to job:', error)
            setIsRemoving(false);
        } finally {
            setApplying(false);
        }
    }

    async function handleJobReject() {
        try {
            setSlideDirection('left-down');
            setIsRemoving(true);

            // Find the existing application
            const existingApplication = jobApplications.find(
                application => application.jobID === jobItem._id
            );

            // If there's an existing application, delete it
            if (existingApplication) {
                const response = await fetch(`/api/applications/${existingApplication._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-revalidate-path': '/jobs'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete application')
                }
            }

            // Wait for animation before triggering parent callback
            setTimeout(() => {
                if (onApplicationSubmit && jobItem?._id) {
                    // Pass null or undefined to indicate removal
                    onApplicationSubmit({
                        jobID: jobItem._id,
                        deleted: true // Add a flag to indicate deletion
                    });
                }
            }, 1500); // Match animation duration

        } catch (error) {
            console.error('Error handling job rejection:', error);
            setIsRemoving(false);
        }
    }


    return (
        <Fragment>
            <div className="relative mt-5">
                {/* Modify the top-right badges container positioning */}
                <div
                    className={`transition-all duration-[1500ms] ease-in-out ${isRemoving && slideDirection === 'right-up'
                        ? 'transform translate-x-full -translate-y-full opacity-0'
                        : isRemoving && slideDirection === 'left-down'
                            ? 'transform -translate-x-full translate-y-full opacity-0'
                            : ''
                        }`}
                >
                    <Drawer open={showJobDetailsDrawer} onOpenChange={setShowJobDetailsDrawer}>
                        <div>
                            <CommonCard
                                className="overflow-visible gap-10"
                                icon={!showJobDetailsDrawer ? (
                                    <div className="flex items-center">
                                        <div className="absolute top-2 right-[100px] flex items-center gap-2 z-10">
                                            {isPersonalEmail(recruiterEmail) && (
                                                <div className="group relative">
                                                    <div className="bg-yellow-900 cursor-pointer text-white text-center px-2 py-2 rounded-full text-sm font-medium shadow-md">
                                                        ⚠️
                                                    </div>
                                                    <div className="absolute invisible 
                                text-center 
                                group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                bg-black text-white bg-opacity-90 font-semibold text-xs rounded py-1 px-2 w-40
                                bottom-full right-0 mb-2 z-50">
                                                        Recruiter has used personal email to post vacancy
                                                    </div>
                                                </div>
                                            )}

                                            {recruiterRating !== null && (
                                                <div className="group relative">
                                                    <div className="flex items-center cursor-pointer bg-gray-800 text-white text-center px-2 py-2 rounded-full text-sm font-medium shadow-md">
                                                        <span className="mr-1 text-yellow-400">★</span>
                                                        <span>{recruiterRating.toFixed(1)}</span>
                                                    </div>
                                                    <div className="absolute invisible 
                                text-center 
                                group-hover:visible opacity-0 group-hover:opacity-100 border-gray-900 hover:bg-gray-100 transition-opacity duration-300 
                                bg-white border border-gray-200 text-black font-medium text-xs rounded-lg py-2 px-3 w-40
                                bottom-full right-0 mb-2 z-50 shadow-lg">
                                                        {recruiterReviews.length > 0 ? (
                                                            <>
                                                                <div className="font-bold mb-1">Review:</div>
                                                                {recruiterReviews.slice(0, 3).map((review, index) => (
                                                                    <div key={index} className="mb-1 pb-1 text-black font-bold border-b border-gray-100 last:border-0">
                                                                        &quot;{review}&quot;
                                                                    </div>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            "No reviews yet"
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {jobItem?.hiredFlag && (
                                            <>
                                                <div
                                                    onClick={() => setShowVacancyClosed(true)}
                                                    className="right-2 bg-red-500 text-black text-center px-2 py-2 rounded-full text-sm font-medium shadow-md cursor-pointer hover:bg-red-600"
                                                >
                                                    Vacancy Closed
                                                </div>

                                                {showVacancyClosed && (
                                                    <div className="fixed inset-3 bg-opacity-50 z-50 flex justify-center items-center">
                                                        <div className="relative bg-white border-[5px] border-gray-900 rounded-lg shadow-sm p-6 max-w-md">
                                                            <button
                                                                onClick={() => setShowVacancyClosed(false)}

                                                                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
                                                            >

                                                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                                                </svg>
                                                                <span className="sr-only">Close modal</span>
                                                            </button>
                                                            <div className="text-center">
                                                                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                                </svg>
                                                                <h3 className="mb-5 text-lg font-normal text-gray-500">
                                                                    An applicant has already been hired for this position {jobItem?.title} at {jobItem?.companyName}
                                                                </h3>
                                                                <button
                                                                    onClick={() => setShowVacancyClosed(false)}
                                                                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border-[2px] border-gray-900 text-sm font-medium px-5 py-2.5 
                                                                    hover:text-gray-900
                                                                    hover:scale-105 transform transition-all duration-200 ease-in-out"
                                                                >
                                                                    Close prompt
                                                                </button>

                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <JobIcon
                                            industry={jobItem?.industry} className="h-25 w-25" />

                                        {isJobApplied && (
                                            <div className="right-2 bg-green-500 text-black text-center px-2 py-2 rounded-full text-sm font-medium shadow-md">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-2xl font-bold">{jobItem?.type} {jobItem?.title}</div>
                                )}
                                title={!showJobDetailsDrawer ? (
                                    <div className="flex justify-between items-center">
                                        {jobItem?.title}
                                    </div>

                                ) : null}
                                description={!showJobDetailsDrawer ? (
                                    <>
                                        <p className="text-sm text-gray-600">{jobItem?.companyName} | {jobItem?.location}</p>
                                        <p className="text-sm text-gray-600 font-semibold">{jobItem?.industry} Industry </p>
                                        <div className="flex items-center justify-center mb-[-30px] mt-1">
                                            <p> <br />  <br /></p>
                                        </div>


                                        {showMatchDetails && (
                                            <>
                                                <div className="text-lg font-bold mb-2">Why {matchPotential}?</div>
                                                <div className="mb-4">
                                                    <h3 className="text-sm font-semibold mb-2">Job Qualifications</h3>
                                                    <p className="text-xs mb-1">
                                                        <span className="font-medium">Required:</span> {jobItem?.experience} in {jobItem?.industry} Industry
                                                        {jobItem?.yearsOfExperience ? ` (${jobItem?.yearsOfExperience})` : ""}
                                                    </p>
                                                    <p className="text-xs">
                                                        <span className="font-medium">Your Experience:</span> {profileInfo?.candidateInfo?.totalExperience ?
                                                            `${profileInfo?.candidateInfo?.totalExperience} years` : "Fresher"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold mb-2">Skills Match</h3>
                                                    <div className="flex flex-wrap gap-1">
                                                        {jobSkills.map((skill, index) => (
                                                            <div
                                                                key={index}
                                                                className={`px-1.5 py-0.5 rounded text-[15px] text-white font-medium ${candidateSkills.includes(skill) ? "bg-green-500" : "bg-red-500"
                                                                    }`}
                                                            >
                                                                {skill}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div className="font-semibold">{jobItem?.companyName}</div>
                                        <div className="text-gray-700">{jobItem?.description}</div>
                                        <div className="text-gray-600">
                                            {jobItem?.location} | {jobItem?.salary ? `USD ${jobItem?.salary}` : "Salary Negotiable"}
                                            <div className="text-gray-600">
                                                {jobItem?.experience === "Fresher" ? "Fresh Graduates" : jobItem?.experience} in {jobItem?.industry} Industry {jobItem?.experience === "Fresher" ? "" : `for ${jobItem?.yearsOfExperience ? `(${jobItem?.yearsOfExperience})` : ""}`}
                                            </div>
                                        </div>
                                        <div className="mt-3">

                                            <div className="font-medium mb-2">Skills required:</div>

                                            <div className="flex flex-wrap gap-2">
                                                {jobItem?.skills.split(',').map((skillItem, index) => {
                                                    const trimmedSkill = skillItem.trim().toLowerCase();
                                                    const isMatch = candidateSkills.includes(trimmedSkill);
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`rounded-md px-3 py-1 text-sm font-medium ${isMatch
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-yellow-500 text-white'
                                                                }`}
                                                        >
                                                            {skillItem.trim()}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                footerContent={
                                    <div className="flex space-x-1 justify-center items-center">
                                        <Button
                                            className=" h-[55px] w-[55px] bg-red-600 hover:bg-red-700 hover:scale-110 transform transition-all duration-200 ease-in-out text-white rounded-full 
                                        p-0 disabled:cursor-not-allowed"
                                            onClick={handleJobReject}
                                            disabled={jobItem?.hiredFlag || applying}
                                        >

                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setShowJobDetailsDrawer(!showJobDetailsDrawer);
                                                setShowMatchDetails(false);
                                            }}
                                            className="relative h-7 px-2 text-l text-white hover:bg-gradient-to-r from-green-600 to-purple-800 hover:scale-110 transform transition-all duration-200 ease-in-out"
                                        >
                                            {showJobDetailsDrawer ? 'Show Less' : 'Details'}
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                setShowMatchDetails(!showMatchDetails);
                                                setShowJobDetailsDrawer(false);
                                            }}
                                            className={`h-7 px-2 text-l hover:scale-110 transform transition-all duration-200 ease-in-out ${getMatchColor()}`}
                                        >
                                            {showMatchDetails ? 'Hide Match' : matchPotential}
                                        </Button>
                                        <Button
                                            onClick={handleJobApply}
                                            disabled={jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1 || applying || jobItem?.hiredFlag}
                                            className={`h-[55px] w-[55px] p-0 rounded-full hover:scale-110 transform transition-all duration-200 ease-in-out ${jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1
                                                ? 'bg-green-500 text-white cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                }`}
                                        >
                                            {applying ? '...' :
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            }
                                        </Button>
                                    </div>
                                }
                            />
                        </div>
                    </Drawer>
                </div>

                {/* Confirmation overlay */}
                <div
                    className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${showConfirmation ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                >
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center transform transition-all">
                        <div className="mb-4">
                            <svg
                                className="w-16 h-16 text-green-500 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Applied to Job
                        </h3>
                        <p className="text-sm text-gray-600">
                            {jobItem?.title}
                        </p>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default CandidateJobCard