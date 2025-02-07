'use client'

import { Drawer, DrawerContent, DrawerTitle } from "../ui/drawer"
import { ScrollArea } from "../ui/scroll-area"
import CandidateList from "../candidate-list"


function JobApplicants({
    showApplicantsDrawer, 
    setShowApplicantsDrawer, 
    showCurrentCandidateDetailsModal,
    setShowCurrentCandidateDetailsModal,
    currentCandidateDetails, 
    setCurrentCandidateDetails, 
    jobItem, 
    jobApplications}){
    return(
        <Drawer open = {showApplicantsDrawer} onOpenChange = {setShowApplicantsDrawer}>
            <DrawerContent className = "h-[90vh] mt-24" style={{ background: 'radial-gradient(circle at 50% 50%,rgb(212, 163, 246) 20%,rgb(254, 157, 157) 100%)',
        boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)'}}>

                <div className="flex justify-center border-b-[5px] border-gray-900 pt-2 w-1/2 mx-auto pb-3 rounded-full bg-white">
                <DrawerTitle>Applicants for {jobItem.title}</DrawerTitle>
                </div>
                <ScrollArea className = "h-full pr-4">

                    <CandidateList
                    currentCandidateDetails = {currentCandidateDetails}
                    setCurrentCandidateDetails= {setCurrentCandidateDetails}
                    jobApplications={jobApplications}
                    showCurrentCandidateDetailsModal= {showCurrentCandidateDetailsModal}
                    setShowCurrentCandidateDetailsModal= {setShowCurrentCandidateDetailsModal}
                    />
                </ScrollArea>
            </DrawerContent>

        </Drawer>
    )
}

export default JobApplicants