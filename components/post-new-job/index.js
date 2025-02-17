'use client'

import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import CommonForm from "../common-form"
import { initialPostNewJobFormData, postNewJobFormControls } from "@/utils"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { PDFDocument } from "pdf-lib";
import { renderAsync } from "docx-preview"


function PostNewJob({ profileInfo, user, jobToEdit = null, mode = "create" }) {
    const [showJobDialog, setShowJobDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isProcessingFile, setIsProcessingFile] = useState(false)
    const [jobFormData, setJobFormData] = useState(
        mode === "edit" ? jobToEdit : {
            ...initialPostNewJobFormData,
            companyName: profileInfo?.recruiterInfo?.companyName
        }
    )

    const isEditMode = mode === "edit"

    function handlePostNewBtnValid() {
        return Object.keys(jobFormData?.required === true).every(control => jobFormData[control].trim() !== "");
    }

    async function handleJobSubmit() {
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

    async function handleFileUpload(event) {
        const file = event.target.files[0]
        console.log("file", file)
        if (!file) return

        try {
            setIsProcessingFile(true)
            const formData = new FormData()
            formData.append('file', file)
            console.log("File details:", {
                name: file.name,
                type: file.type,
                size: file.size
            });

            // If you need to see FormData entries
            for (let pair of formData.entries()) {
                console.log('FormData content:', pair[0], pair[1]);
            }

            console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size);


            const response = await fetch('/api/postjob', {
                method: 'POST', headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to process file')
            }

            const jobData = await response.json()

            console.log(jobData)
            // Auto-fill the form with the extracted data
            setJobFormData(prev => ({
                ...prev,
                title: jobData.title || prev.title,
                type: jobData.type || prev.type,
                location: jobData.location || prev.location,
                experience: jobData.experience || prev.experience,
                yearsOfExperience: jobData.yearsOfExperience || prev.yearsOfExperience,
                industry: jobData.industry || prev.industry,
                description: jobData.description || prev.description,
                skills: jobData.skills || prev.skills,
                salary: jobData.salary || prev.salary
            }))

            toast.success('Job description processed successfully')
        } catch (error) {
            console.error('Error processing file:', error)
            toast.error('Failed to process job description file')
        } finally {
            setIsProcessingFile(false)
        }
    }

    return (
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

                        <div className="flex flex-col gap-2 border-b pb-4">
                            <label className="text-sm font-medium text-gray-700">
                                Quick Fill from Document
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept=".txt,.pdf,.docx"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="job-description-upload"
                                />
                                <label
                                    htmlFor="job-description-upload"
                                    className="cursor-pointer px-4 py-2 rounded-full bg-blue-50 text-blue-700 
                                        hover:bg-blue-100 text-sm font-semibold transition-colors"
                                >
                                    Import Job Details
                                </label>
                                <span className="text-sm text-gray-500">
                                    {isProcessingFile ? 'Processing...' : 'Supported: PDF, Word, Text'}
                                </span>
                            </div>
                            {isProcessingFile && (
                                <div className="flex items-center gap-2 text-blue-600 mt-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Extracting job details...</span>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 sm:gap-6 py-2 sm:py-4">
                            <CommonForm
                                buttonText={isEditMode ? 'Update Vacancy' : 'Post Vacancy'}
                                formData={jobFormData}
                                setFormData={setJobFormData}
                                formControls={postNewJobFormControls}
                                isBtnDisabled={!handlePostNewBtnValid() || isProcessingFile}
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