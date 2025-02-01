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
        const jobExpYears = parseFloat(jobItem?.yearsOfExperience?.split("-")[0]) + 0.5
        const candidateExpLevel = profileInfo?.candidateInfo?.experienceLevel
        const jobExpLevel = jobItem?.experience

        // Check for industry match
        const industryMatch = candidateIndustry === jobIndustry

        // Check for skills match
        const perfectSkillsMatch = jobSkills.every(skill => candidateSkills.includes(skill))
        const mediumSkillsMatch = candidateSkills.some(skill => jobSkills.includes(skill))
        const lowSkillsMatch = candidateSkills.every(skill => !jobSkills.includes(skill))
        // Check for experience match
        const expMatch = candidateExpYears >= jobExpYears
        const medExpMatch = candidateExpYears - jobExpYears <= 1.5 && candidateExpYears - jobExpYears >= -1.5
        const lowExpMatch = candidateExpYears < jobExpYears
        const freshGradMatch = candidateExpLevel === "Fresher" && jobExpLevel === "Fresher"

        if (perfectSkillsMatch && expMatch && industryMatch) {
            return "Perfect Match!"
        } else if (expMatch && industryMatch) {
            return "High Match"
        }else if (freshGradMatch && industryMatch) {
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
            case "Perfect Match":
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
            setApplying(true)
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
            })

            if (!response.ok) {
                throw new Error('Failed to apply for job')
            }

            if (onApplicationSubmit) {
                onApplicationSubmit({
                    jobID: jobItem?._id,
                    status: ['Applied'],
                })
            }

            setShowJobDetailsDrawer(false)
        } catch (error) {
            console.error('Error applying to job:', error)
        } finally {
            setApplying(false)
        }
    }


    return (
        <Fragment>
            <Drawer open={showJobDetailsDrawer} onOpenChange={setShowJobDetailsDrawer}>
                <CommonCard
                
                    icon={<div>
                        <JobIcon 
                        industry={jobItem?.industry} className="h-25 w-25" />
                        {isJobApplied && (
                            <div className="relative -top-2 right-2 bg-green-500 text-white text-center px-2 py-2 rounded-full text-sm font-medium shadow-md">
                            Applied
                        </div>
                    )}
                    </div>}
                    title={<div className="flex justify-between items-center">
                    {jobItem?.title}
                    </div>} 
                    description={jobItem?.companyName}
                    footerContent={
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setShowJobDetailsDrawer(true)}
                                className="flex h-11 items-center justify-center px-5 hover:bg-gradient-to-r from-green-600 to-purple-800"
                            >
                                View Details
                            </Button>
                            <Button
                                onClick={() => setShowMatchDetails(true)}
                                className={getMatchColor()}
                            >
                                {matchPotential}
                            </Button>
                            
                        </div>
                        
                    }/>
                <DrawerContent className="p-6">
                    <DrawerHeader className="px-0">
                        {/* Flex container for title and badge */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <DrawerTitle className="text-4xl font-extrabold text-gray-800 flex items-center gap-2">
                            {jobItem?.type} {jobItem?.title}
                              
                            </DrawerTitle>
                            {/* Buttons (right aligned) */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleJobApply}
                                    disabled={jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1 || applying}
                                    className={`flex h-11 items-center justify-center px-5 ${jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1
                                            ? 'bg-green-500 text-white cursor-not-allowed'
                                            : ''
                                        }`}
                                >
                                    {applying ? 'Applying...' :
                                        jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1
                                            ? 'Applied'
                                            : 'Apply'
                                    }
                                </Button>


                                <Button
                                    onClick={() => setShowJobDetailsDrawer(false)}
                                    className="flex h-11 items-center justify-center px-5"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DrawerHeader>
                    <DrawerDescription className="text-xl text-gray-900">
                        {jobItem?.description}
                        <span className="text-lg font-normal ml-4 text-gray-500">
                            {jobItem?.location} | {jobItem?.salary ? `USD ${jobItem?.salary}` : "Salary Negotiable"}
                        </span>
                    </DrawerDescription>
                    {/* Full Time Badge (centered at bottom on smaller screens) */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 sm:hidden">
                        <div className="w-auto flex justify-center items-center h-[30px] bg-black rounded-[4px] px-3">
                        </div>
                    </div>
                    {/* Experience Section */}
                    <h3 className="text-lg font-medium text-black mt-3">
                        Experience Required: {jobItem?.yearsOfExperience ? jobItem?.yearsOfExperience : jobItem?.experience === "Fresher" ? "Fresh Graduates Welcome" : "Experienced Required"}
                    </h3>
                    {/* Skills Section */}
                    <div className="mt-6">
                        <h3 className="text-md font-medium mb-2">Skill(s) required:</h3>
                        <div className="flex flex-wrap gap-2">
                            {jobItem?.skills.split(',').map((skillItem, index) => (
                                <div
                                    key={index}
                                    className="bg-black text-white rounded-md px-3 py-1 text-sm font-medium"
                                >
                                    {skillItem.trim()}
                                </div>
                            ))}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
            <Drawer open={showMatchDetails} onOpenChange={setShowMatchDetails}>
                <DrawerContent className="p-6">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-bold ml-0">
                            Why {matchPotential}?
                        </DrawerTitle>
                    </DrawerHeader>
                    <DrawerDescription>
                        
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Job Qualifications</h3>
                            <p>
                                <span className="font-bold text-lg">{jobItem?.experience}  in {jobItem?.industry} Industry for {jobItem?.yearsOfExperience ? `(${jobItem?.yearsOfExperience})` : ""} </span>
                            </p>

                            <p>
                                <span className="font-bold text-black">Your Experience: {profileInfo?.candidateInfo?.totalExperience ? `${profileInfo?.candidateInfo?.totalExperience} years` : "Fresher"}</span>
                            </p>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Skills Needed</h3>
                            <div className="flex flex-wrap gap-2">
                                {jobSkills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className={`px-3 py-1 rounded-md text-white font-medium ${candidateSkills.includes(skill) ? "bg-green-500" : "bg-red-500"
                                            }`}
                                    >
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center items-center gap-[50px]">
                        <Button
                            onClick={() => setShowMatchDetails(false)}
                            className="flex h-11 px-5 bg-gray-500 text-white"
                        >
                            Close
                        </Button>
                        <Button 
                                    onClick={handleJobApply}
                                    disabled={jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1 || applying}
                                    className={`flex h-11 px-5 ${jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1
                                            ? 'bg-green-500 text-white cursor-not-allowed'
                                            : ''
                                        }`}
                                >
                                    {applying ? 'Applying...' :
                                        jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1
                                            ? 'Applied'
                                            : 'Apply'
                                    }
                                </Button>
                        
                        </div>
                    </DrawerDescription>
                </DrawerContent>
            </Drawer>
        </Fragment>
    )
}

export default CandidateJobCard