'use client'

import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import CommonForm from "../common-form"
import { initialPostNewJobFormData, postNewJobFormControls } from "@/utils"

function PostNewJob({profileInfo, user, jobToEdit = null, mode = "create"}){
    const [showJobDialog, setShowJobDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [jobFormData, setJobFormData] = useState(
        mode === "edit" ? jobToEdit : {
            ...initialPostNewJobFormData, 
            companyName: profileInfo?.recruiterInfo?.companyName
        }
    )

    const isEditMode = mode === "edit"

    function handlePostNewBtnValid(){
        return Object.keys(jobFormData?.required === true).every(control => jobFormData[control].trim() !== "");
    }

    async function handleJobSubmit(){
        try {
            setLoading(true)
            const url = isEditMode ? `/api/jobs/${jobToEdit._id}` : '/api/jobs'
            const method = isEditMode ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-revalidate-path': '/jobs'
                },
                body: JSON.stringify({
                    ...jobFormData,
                    recruiterId: user?.id,
                    ...(method === 'POST' && { applicants: [] })
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} job`);
            }

            setShowJobDialog(false);
            window.location.reload()

        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} job:`, error);
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="relative">
            <Button
                onClick={() => setShowJobDialog(true)}
                className={`disabled:opacity-60 flex h-11 items-center justify-center px-5 
                    ${isEditMode ? 'absolute bottom-0.5 right-4 bg-blue-500 text-white' : ''}`}
            >
                {isEditMode ? 'Edit Vacancy' : 'Post New Job'}
            </Button>
            <Dialog 
                open={showJobDialog} 
                onOpenChange={setShowJobDialog}
            >
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? 'Edit Job Vacancy' : 'Post New Job'}
                        </DialogTitle>
                        <div className="grid gap-4 py-4">
                            <CommonForm
                                buttonText={isEditMode ? 'Update Vacancy' : 'Post Vacancy'}
                                formData={jobFormData}
                                setFormData={setJobFormData}
                                formControls={postNewJobFormControls}
                                isBtnDisabled={!handlePostNewBtnValid()}
                                action={handleJobSubmit}
                                loading={loading}
                            />
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PostNewJob