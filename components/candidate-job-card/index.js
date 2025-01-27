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

function CandidateJobCard({ jobItem, profileInfo, jobApplications }) {
    const [showJobDetailsDrawer, setShowJobDetailsDrawer] = useState(false)
    const [showMatchDetails, setShowMatchDetails] = useState(false)
    const [applying, setApplying] = useState(false)


    console.log(jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()))
    const jobExperience = parseFloat(jobItem?.experience?.match(/[\d.]+/)?.[0]) || 0
    const candidateExperience = profileInfo?.candidateInfo?.totalExperience || 0
    const candidateSkills = profileInfo?.candidateInfo?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []
    const jobSkills = jobItem?.skills?.split(",").map(skill => skill.trim().toLowerCase()) || []

    const ExperienceGap = jobExperience - candidateExperience

    const HighexperienceMatch = ExperienceGap <= 0
    const LowExperienceMatch = ExperienceGap > 0



    const HighSkillsMatch = candidateSkills.some(skill => jobSkills.includes(skill))
    const LowSkillsMatch = candidateSkills.some(skill => jobSkills.includes(skill))

    const matchPotential = HighexperienceMatch && HighSkillsMatch ? "High Match Potential" :
        LowExperienceMatch && HighSkillsMatch ? "Not Enough Experience" :
            HighexperienceMatch && LowSkillsMatch ? "Low Skill Match" :
                LowExperienceMatch && LowSkillsMatch ? "Low Match Potential" : "No Match"

    console.log(jobApplications, 'jobApplications')
    console.log(profileInfo, "profileInfo")

    async function handleJobApply() {
        try {
            setApplying(true) // Show loading state
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-revalidate-path': '/jobs' // For revalidation
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

            // Close drawer after successful application
            setShowJobDetailsDrawer(false)
        } catch (error) {
            console.error('Error applying to job:', error)
            // You might want to show an error message to the user
        } finally {
            setApplying(false) // Hide loading state
        }
    }


    return (
        <Fragment>
            <Drawer open={showJobDetailsDrawer} onOpenChange={setShowJobDetailsDrawer}>
                <CommonCard
                    icon={<JobIcon industry={jobItem?.industry} className="h-25 w-25" />}
                    title={jobItem?.title}
                    description={jobItem?.companyName}
                    footerContent={
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setShowJobDetailsDrawer(true)}
                                className="flex h-11 items-center justify-center px-5"
                            >
                                View Details
                            </Button>
                            <Button
                                onClick={() => setShowMatchDetails(true)}
                                className={`flex h-11 items-center justify-center px-5 ${matchPotential === "High Match Potential"
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                    }`}
                            >
                                {matchPotential}
                            </Button>
                        </div>
                    }
                />
                <DrawerContent className="p-6">
                    <DrawerHeader className="px-0">
                        {/* Flex container for title and badge */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <DrawerTitle className="text-4xl font-extrabold text-gray-800 flex items-center gap-2">
                                {jobItem?.title}
                                {/* Full Time Badge */}
                                <span className="hidden sm:inline-flex w-auto h-[30px] bg-black text-white rounded-[4px] justify-center items-center px-3 text-sm font-medium">
                                    {jobItem?.type} Time
                                </span>
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
                        <span className="text-sm font-normal ml-4 text-gray-500">
                            {jobItem?.location}
                        </span>
                    </DrawerDescription>
                    {/* Full Time Badge (centered at bottom on smaller screens) */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 sm:hidden">
                        <div className="w-auto flex justify-center items-center h-[30px] bg-black rounded-[4px] px-3">
                            <h2 className="text-sm font-medium text-white">
                                {jobItem?.type} Time
                            </h2>
                        </div>
                    </div>
                    {/* Experience Section */}
                    <h3 className="text-lg font-medium text-black mt-3">
                        Experience: {jobItem?.experience} year(s)
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
                        <DrawerTitle className="text-2xl font-bold">
                            Match Details
                        </DrawerTitle>
                    </DrawerHeader>
                    <DrawerDescription>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Experience</h3>
                            <p>
                                <span className="font-bold">Job Required:</span> {jobItem?.experience} years
                            </p>
                            <p>
                                <span className="font-bold">Candidate Experience:</span> {candidateExperience} years
                            </p>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold">Skills</h3>
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
                        <Button
                            onClick={() => setShowMatchDetails(false)}
                            className="mt-4 bg-gray-500 text-white"
                        >
                            Close
                        </Button>
                    </DrawerDescription>
                </DrawerContent>
            </Drawer>
        </Fragment>
    )
}

export default CandidateJobCard