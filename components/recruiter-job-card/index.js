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
           icon = {<JobIcon industry={jobItem?.industry} />}
           title={jobItem?.title}
           footerContent={
            <div className="flex justify-between w-full">
                <Button onClick={()=> setShowApplicantsDrawer(true)}
                    className="disabled:opacity-55 flex h-11 items-center justify-center px-5" 
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