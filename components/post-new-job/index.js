'use client'

import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import CommonForm from "../common-form"
import { initialPostNewJobFormData, postNewJobFormControls } from "@/utils"
import { postNewJobAction } from "@/actions"

function PostNewJob({profileInfo, user}){
    const [showJobDialog, setShowJobDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [jobFormData, setJobFormData] = useState({
        ...initialPostNewJobFormData, 
        companyName: profileInfo?.recruiterInfo?.companyName
    })

    function handlePostNewBtnValid(){
        return Object.keys(jobFormData).every(control => jobFormData[control].trim() !== "");
    }

    async function createNewJob(){
        try {
            setLoading(true)
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-revalidate-path': '/jobs'
                },
                body: JSON.stringify({
                    ...jobFormData,
                    recruiterId: user?.id,
                    applicants: []
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create job');
            }

            // Reset form and close dialog on success
            setJobFormData({
                ...initialPostNewJobFormData, 
                companyName: profileInfo?.recruiterInfo?.companyName
            });
            setShowJobDialog(false);

        } catch (error) {
            console.error('Error creating job:', error);
            // You might want to show an error message to the user
        } finally {
            setLoading(false);
        }
    }
    return(
        <div>
            <Button
            onClick={() => setShowJobDialog(true)}
            className="disabled:opacity-60 flex h-11 items-center justify-center px-5">
            Post New Job
            </Button>
            <Dialog  open = {showJobDialog} onOpenChange={()=> {
                setShowJobDialog(false)
                setJobFormData({
                    ...initialPostNewJobFormData, 
                    companyName: profileInfo?.recruiterInfo?.companyName
                })
                }}>
                <DialogContent className="sm:max-2-screen-md h-[600px] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Post New Job
                        </DialogTitle>
                        <div className="grid gap-4 py-4">
                            <CommonForm
                            buttonText={'Add'}
                            formData={jobFormData}
                            setFormData={setJobFormData}
                            formControls={postNewJobFormControls}
                            isBtnDisabled={!handlePostNewBtnValid()}
                            action={createNewJob}/>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PostNewJob