'use client'

import { Fragment, useState } from "react"
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

    console.log(jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()))
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
                return "text-gray-600 bg-gray-50"
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
            <div className="relative">
                <div
                    className={`transition-all duration-[1500ms] ease-in-out ${
                        isRemoving && slideDirection === 'right-up' 
                            ? 'transform translate-x-full -translate-y-full opacity-0' 
                            : isRemoving && slideDirection === 'left-down'
                            ? 'transform -translate-x-full translate-y-full opacity-0'
                            : ''
                    }`}
                >
                    <Drawer open={showJobDetailsDrawer} onOpenChange={setShowJobDetailsDrawer}>
                        <CommonCard
                            className="w-[1000px] h-[500px]"
                            icon={!showJobDetailsDrawer ? (
                                <div className="flex items-center">
                                    <JobIcon industry={jobItem?.industry} className="h-25 w-25" />

                                    {isJobApplied && (
                                        <div className="relative -top-2 right-2 bg-green-500 text-white text-center px-2 py-2 rounded-full text-sm font-medium shadow-md">
                                            Applied
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
                                    {jobItem?.companyName}
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
                                                            className={`px-1.5 py-0.5 rounded text-[10px] text-white font-medium ${
                                                                candidateSkills.includes(skill) ? "bg-green-500" : "bg-red-500"
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
                                <div className="ml-[-15px] flex space-x-1 ">

                                <Button 
                                    className="h-7 w-7 bg-red-600 hover:bg-red-700 text-white rounded-full p-0"
                                    onClick={handleJobReject}
                                    disabled={applying}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowJobDetailsDrawer(!showJobDetailsDrawer);
                                        setShowMatchDetails(false);
                                    }}
                                    className="relative h-7 px-2 text-l text-white hover:bg-gradient-to-r from-green-600 to-purple-800"
                                >
                                    {showJobDetailsDrawer ? 'Show Less' : 'View Details'}
                                </Button>

                                <Button
                                    onClick={() => {
                                        setShowMatchDetails(!showMatchDetails);
                                        setShowJobDetailsDrawer(false);
                                    }}
                                    className={`h-7 px-2 text-l ${getMatchColor()}`}
                                >
                                    {showMatchDetails ? 'Hide Match' : matchPotential}
                                </Button>
                                <Button 
                                    onClick={handleJobApply}
                                    disabled={jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1 || applying}
                                    className={`h-7 w-7 p-0 rounded-full ${jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1
                                        ? 'bg-green-500 text-white cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white'}`}
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
                    </Drawer>
                </div>

                {/* Confirmation overlay */}
                <div
                    className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-300 ${
                        showConfirmation ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
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