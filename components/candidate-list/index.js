'use client'

import { Fragment } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogTitle, DialogContent, DialogFooter } from "../ui/dialog"
import { getCandidateDetailsByIDAction, updateJobApplicationAction } from "@/actions"
import { createClient } from "@supabase/supabase-js"
const supabaseClient = createClient(
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnR0ZXpqZHdxaXhtYWZ0aXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0Mjc1MjksImV4cCI6MjA0ODAwMzUyOX0.giYTTB68BJchfDZdqnsMDpt7rhgVPOvPwYp90-Heo4c"
)

function CandidateList({jobApplications, 
    currentCandidateDetails,
     setCurrentCandidateDetails,
      showCurrentCandidateDetailsModal,
      setShowCurrentCandidateDetailsModal
    }) {

    async function handleFetchCandidateDetails(getCurrentCandidateId) {
        const data = await getCandidateDetailsByIDAction(getCurrentCandidateId)
        if (data) {
            setCurrentCandidateDetails(data)
            setShowCurrentCandidateDetailsModal(true)
        }
    }



    function handlePreviewResume(){
        const {data} = supabaseClient.storage.from('rekrutor-public')
        .getPublicUrl(`public/${currentCandidateDetails?.candidateInfo?.resume}`)

        console.log(data, 'resume')
        const a = document.createElement('a')
        a.href = data?.publicUrl
        a.setAttribute('download','Resume.pdf')
        a.setAttribute('target', '_blank')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    function handlePreviewVideoCV() {
        const publicUrl = currentCandidateDetails?.candidateInfo?.videoCV;
      
        console.log(publicUrl, "videoCV");
      
        if (publicUrl) {
          // Open the video CV URL directly in a new tab
          window.open(publicUrl, "_blank");
        } else {
          alert("No video CV available.");
        }
      }
      

    async function handleUpdateJobStatus(getCurrentStatus) {
        let copyJobApplicants = [...jobApplications]
        const indexOfCurrentJobApplicant = copyJobApplicants.findIndex(item=> item.candidateUserID === currentCandidateDetails?.userId)
        console.log(indexOfCurrentJobApplicant)
        console.log(currentCandidateDetails?.userId)
        const jobApplicantsToUpdate ={
            ...copyJobApplicants[indexOfCurrentJobApplicant],
            status: copyJobApplicants[indexOfCurrentJobApplicant].status.concat(getCurrentStatus),
        }
        console.log(jobApplicantsToUpdate, 'jobApplicantsToUpdate')
        await updateJobApplicationAction(jobApplicantsToUpdate, '/jobs')
        console.log(jobApplications, 'jobApplicants')
    }

    return(
        <div>
        <Fragment>
    <div className="grid grid-cols-1 gap-3 p-10 md:grid-cols-2 lg:grid-cols-3">
        {
            jobApplications && jobApplications.length > 0 ? (
                jobApplications.map(jobApplicantItem => (
                    <div key={jobApplicantItem?._id || jobApplicantItem?.name} className="bg-white shadow-lg w-full max-2-sm rounded-lg overflow-hidden mx-auto mt-4">
                        <div className="px-4 my-6 flex justify-between items-center">
                            <h3 className="text-lg font-bold">{jobApplicantItem?.name}</h3>
                            <Button onClick = {()=>handleFetchCandidateDetails(jobApplicantItem?.candidateUserID)}className="flex h-11 items-center justify-center px-5">View Profile</Button>
                        </div>
                    </div>
                ))
            ) : null
        }
    </div>
    <Dialog open={showCurrentCandidateDetailsModal} 
    onOpenChange={()=> {
        setCurrentCandidateDetails(null)
        setShowCurrentCandidateDetailsModal(false)}}>
        <DialogContent>
            <div>
            <DialogTitle>{currentCandidateDetails?.candidateInfo?.name}</DialogTitle>
            <h1>{currentCandidateDetails?.email}</h1>
            <p>{currentCandidateDetails?.candidateInfo?.currentCompany}</p>
            <p>{currentCandidateDetails?.candidateInfo?.currentJobLocation}</p>
            <p>Salary: ${currentCandidateDetails?.candidateInfo?.currentSalary}</p>
            <p>Experience: {currentCandidateDetails?.candidateInfo?.totalExperience} year(s)</p>
            <p>Notice Period: {currentCandidateDetails?.candidateInfo?.noticePeriod}</p>
            <div className="flex flex-wrap gap-2">Skills: 
                            {currentCandidateDetails?.candidateInfo?.skills.split(',').map((skillItem, index) => (
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
                <Button onClick={handlePreviewResume}>Resume</Button>
                <Button onClick={handlePreviewVideoCV}>Video CV</Button>
                <Button onClick={()=> handleUpdateJobStatus('Selected')}
                    disabled ={
                        
                            jobApplications.find
                            ((item) => 
                                item.candidateUserID === currentCandidateDetails?.userId)
                            ?.status.slice(-1)[0] === "Selected"? true : false
                    }>
                    {
                        jobApplications.find
                        ((item) => 
                            item.candidateUserID === currentCandidateDetails?.userId)
                        ?.status.slice(-1)[0] === "Selected"? "Selected" : "Select"
                    }</Button>
                <Button onClick={()=> handleUpdateJobStatus('Rejected')}
                    disabled ={
                        
                        jobApplications.find
                        ((item) => 
                            item.candidateUserID === currentCandidateDetails?.userId)
                        ?.status.slice(-1)[0] === "Rejected"? true : false
                }>
                    {
                        jobApplications.find
                        ((item) => 
                            item.candidateUserID === currentCandidateDetails?.userId)
                        ?.status.slice(-1)[0] === "Rejected"? "Rejected" : "Reject"
                    }</Button>
            </div>
        </DialogFooter>    
        </DialogContent>
        
    </Dialog>
    
</Fragment>
</div>

    )
}

export default CandidateList