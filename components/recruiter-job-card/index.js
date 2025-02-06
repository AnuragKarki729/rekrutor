'use client'

import { useState } from "react"
import CommonCard from "../common-card"
import JobIcon from "../job-icon"
import { Button } from "../ui/button"
import JobApplicants from "../job-applicants"
import PostNewJob from "../post-new-job"
import { Label } from "../ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"

function RecruiterJobCard({jobItem, jobApplications}){
    const [showApplicantsDrawer , setShowApplicantsDrawer] = useState(false)
    const [currentCandidateDetails, setCurrentCandidateDetails] = useState(null)
    const [showCurrentCandidateDetailsModal, setShowCurrentCandidateDetailsModal] = useState(false)
    const [hiringStatus, setHiringStatus] = useState(jobItem.hiredFlag ? 'Hired' : 'Hiring')
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleStatusChange = async (newStatus) => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/jobs/updatestatus/${jobItem._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    hiredFlag: newStatus
                })
            })

            if (!response.ok) {
                throw new Error('Failed to update status')
            }

            const data = await response.json()
            setHiringStatus(newStatus)
            console.log(data)
            setIsDialogOpen(false)

        } catch (error) {
            console.error('Error updating job status:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
           <CommonCard
           icon = {
            <div className="flex items-center justify-between gap-2">
           <JobIcon industry={jobItem?.industry}/>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
               <Button 
                   className={`bg-gradient-to-r from-blue-500 to-gray-900 text-white 
                       hover:shadow-lg transform hover:scale-[1.05] rounded-full cursor-pointer
                        ${hiringStatus === 'Hired' ? 'bg-gradient-to-r from-green-500 to-blue-400 border-[2px] border-gray-900 rounded-md' : ''}`}
                   variant="outline"
                   size="sm"
               >
                   {hiringStatus === 'Hiring' ? 'Set Status' : 'Hired'}
               </Button>
           </DialogTrigger>
       </Dialog>
       </div>
}
           title={
            <div className="flex justify-between items-start w-full">
                
                    <span>{jobItem?.title}</span>
            
                
                            </div>
           }
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