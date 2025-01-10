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
import { createJobApplicationAction } from "@/actions"

function CandidateJobCard({ jobItem, profileInfo, jobApplications }) {
    const [showJobDetailsDrawer, setShowJobDetailsDrawer] = useState(false)
    console.log(jobApplications, 'jobApplications')
    async function handleJobApply() {
        await createJobApplicationAction({
            recruiterUserID: jobItem?.recruiterId,
            name: profileInfo?.candidateInfo?.name,
            email: profileInfo?.email,
            candidateUserID: profileInfo?.userId,
            status: ['Applied'],
            jobID: jobItem?._id,
            JobAppliedOnDate: new Date().toLocaleDateString(),
        }, '/jobs')
        setShowJobDetailsDrawer(false)
    }


    return (
        <Fragment>
            <Drawer open={showJobDetailsDrawer} onOpenChange={setShowJobDetailsDrawer}>
                <CommonCard
                    icon={<JobIcon />}
                    title={jobItem?.title}
                    description={jobItem?.companyName}
                    footerContent={
                        <DrawerTrigger asChild>
                            <Button className="flex h-11 items-center justify-center px-5">
                                View Details
                            </Button>
                        </DrawerTrigger>
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
                                    disabled={jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1}
                                    className={`flex h-11 items-center justify-center px-5 ${jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1
                                            ? 'bg-green-500 text-white cursor-not-allowed'
                                            : ''
                                        }`}
                                >
                                    {jobApplications.findIndex((item) => item.jobID === jobItem._id) > -1 ? 'Applied' : 'Apply'}
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
        </Fragment>
    )
}

export default CandidateJobCard