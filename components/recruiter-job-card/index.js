'use client'

import { useState } from "react"
import CommonCard from "../common-card"
import JobIcon from "../job-icon"
import { Button } from "../ui/button"
import JobApplicants from "../job-applicants"
import PostNewJob from "../post-new-job"

function RecruiterJobCard({jobItem, jobApplications}){
    

    const [showApplicantsDrawer , setShowApplicantsDrawer] = useState(false)
    const [currentCandidateDetails, setCurrentCandidateDetails] = useState(null)
    const [showCurrentCandidateDetailsModal, setShowCurrentCandidateDetailsModal] = useState(false)

    return (
        <div>
           <CommonCard
           icon = {<JobIcon industry={jobItem?.industry}/>}
           title={jobItem?.title}
           footerContent={
            <div className="flex justify-between w-full bg">
                <Button onClick={()=> setShowApplicantsDrawer(true)}
                    className="disabled:opacity-55 flex h-11 items-center justify-center px-3
                    transition-all duration-300 ease-in-out
                    bg-gradient-to-r from-gray-900 to-green-900 hover:from-green-700 hover:to-gray-700 text-white hover:shadow-lg
                    transform hover:scale-[1.05]
                    ml-[-11px]" 
                    disabled = {jobApplications.filter (item => item.jobID === jobItem?._id).length ===0}>
                    {jobApplications.filter (item => item.jobID === jobItem?._id).length} Applicant(s)
                </Button>
                <PostNewJob jobToEdit={jobItem} mode="edit" />
            </div>
           }
           /> 
           <JobApplicants
           showApplicantsDrawer={showApplicantsDrawer}
           setShowApplicantsDrawer={setShowApplicantsDrawer}
           showCurrentCandidateDetailsModal = {showCurrentCandidateDetailsModal}
           setShowCurrentCandidateDetailsModal = {setShowCurrentCandidateDetailsModal}
           currentCandidateDetails = {currentCandidateDetails}
           setCurrentCandidateDetails = {setCurrentCandidateDetails}
           jobItem={jobItem}
           jobApplications={jobApplications.filter(jobApplicantItem=>jobApplicantItem.jobID=== jobItem?._id)}
           />
        </div>
    )
}

export default RecruiterJobCard