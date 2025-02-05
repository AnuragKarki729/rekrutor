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
        <div className="relative w-full sm:w-auto">
            <Button
                onClick={() => setShowJobDialog(true)}
                className={`
                    w-full sm:w-auto
                    px-4 sm:px-6
                    h-[44px]
                    py-2.5 sm:py-3
                    text-sm sm:text-base font-medium
                    rounded-lg
                    shadow-sm
                    transition-all duration-300 ease-in-out
                    transform hover:scale-[1.05]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                    ${isEditMode 
                        ? 'ml-4 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-lg'
                    }`}
            >
                {isEditMode ? (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Edit Job</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Post New Job</span>
                    </>
                )}
            </Button>
            <Dialog 
                open={showJobDialog} 
                onOpenChange={setShowJobDialog}
                className="fixed z-50 w-full sm:w-auto"
            >
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto 
                    w-[95vw] sm:w-full mx-auto rounded-lg">
                    <DialogHeader className="space-y-4 sm:space-y-6">
                        <DialogTitle className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
                            {isEditMode ? 'Edit Job Vacancy' : 'Post New Job'}
                        </DialogTitle>
                        <div className="grid gap-4 sm:gap-6 py-2 sm:py-4">
                            <CommonForm
                                buttonText={isEditMode ? 'Update Vacancy' : 'Post Vacancy'}
                                formData={jobFormData}
                                setFormData={setJobFormData}
                                formControls={postNewJobFormControls}
                                isBtnDisabled={!handlePostNewBtnValid()}
                                action={handleJobSubmit}
                                loading={loading}
                                className="space-y-4 sm:space-y-6"
                            />
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PostNewJob