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
            <DrawerContent className = "max-h-[50vh]">
                <DrawerTitle>Applicants: </DrawerTitle>
                <ScrollArea className = "h-auto overflow-y-auto">
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