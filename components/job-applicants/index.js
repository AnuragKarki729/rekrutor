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
            <DrawerContent className = "h-[85vh] mt-24">
                <div className="flex justify-center">
                <DrawerTitle>Applicants: </DrawerTitle>
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