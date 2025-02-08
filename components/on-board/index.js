'use client'
import React, { useEffect } from "react"
import CommonForm from "../common-form"
import { useSearchParams } from 'next/navigation'
const { Tabs, TabsList, TabsTrigger, TabsContent } = require("../ui/tabs")
import { useState } from "react" 
import { candidateOnBoardFormControls, initialCandidateFormData, initialRecruiterFormData, recruiterOnBoardFormControls } from "@/utils"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import CancelSignupButton from "../cancel-signup-button"
import '@/components/ui/loadingfile.css'

const supabaseClient = createClient(
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnR0ZXpqZHdxaXhtYWZ0aXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0Mjc1MjksImV4cCI6MjA0ODAwMzUyOX0.giYTTB68BJchfDZdqnsMDpt7rhgVPOvPwYp90-Heo4c"
)

function LoadingOverlay() {
    const [loadingText, setLoadingText] = useState("Parsing resume...");
        useEffect(() => {
            const timer1 = setTimeout(() => {
                setLoadingText("Let's see your skills...");
            }, 3000);
    
            const timer2 = setTimeout(() => {
                setLoadingText("Almost there...");
            }, 6000);
    
            // Cleanup timers on unmount
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }, []);
    
        return (
            <div className="loading-overlay flex justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="loader"></div>
                    <div className="text-white text-xl">{loadingText}</div>
                </div>
            </div>
        )
    }

function OnBoard(){
    const searchParams = useSearchParams()
    const [currentTab, setCurrentTab] = useState(() => {
        return searchParams.get('type') || 'candidate'
    })
    const [showWarningDialog, setShowWarningDialog] = useState(false)
    const [warningMessage, setWarningMessage] = useState({
        title: '',
        description: ''
    })
    const [pendingTabChange, setPendingTabChange] = useState(null)
    const [recruiterFormData, setRecruiterFormData] = useState(initialRecruiterFormData)
    const [candidateFormData, setCandidateFormData] = useState(initialCandidateFormData)
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isParsing, setIsParsing] = useState(false)
    const { user } = useUser()
    

    useEffect(() => {
        const email = user?.primaryEmailAddress?.emailAddress
        const isGmail = email?.toLowerCase().endsWith('@gmail.com')
        console.log(user?.id)
        const typeParam = searchParams.get('type')
        if (typeParam) {
            setCurrentTab(typeParam)
        }
        else if (isGmail) {
            setCurrentTab('candidate')
        }
    }, [user, searchParams])

    function handleTabChange(value) {
        const email = user?.primaryEmailAddress?.emailAddress
        const isGmail = email?.toLowerCase().endsWith('@gmail.com')
        
        if (value === 'recruiter' && currentTab === 'candidate' && isGmail) {
            setWarningMessage({
                title: 'Switch to Recruiter Profile?',
                description: 'We advise you to log in with company email for better legitimacy. Would you still like to continue?'
            })
            setShowWarningDialog(true)
            setPendingTabChange(value)
        } 
        else if (value === 'candidate' && currentTab === 'recruiter' && !isGmail) {
            setWarningMessage({
                title: 'Switch to Candidate Profile?',
                description: 'We advise you to log in from personal email for signing up as candidate. Would you still like to continue?'
            })
            setShowWarningDialog(true)
            setPendingTabChange(value)
        }
        else {
            setCurrentTab(value)
            updateURL(value)
        }
    }

    function updateURL(value) {
        const url = new URL(window.location.href)
        url.searchParams.set('type', value)
        window.history.pushState({}, '', url)
    }

    async function handleFileChange(event) {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            try {
                setIsParsing(true)
                // Get file extension
                const fileExt = selectedFile.name.split('.').pop();
                
                // Get user's first and last name from form data
                const firstName = candidateFormData.name?.split(' ')[0] || '';
                const lastName = candidateFormData.name?.split(' ').slice(1).join('') || '';

                const newFileName = firstName === '' || lastName === '' ? selectedFile.name : 
                `${firstName}_${lastName}_Resume.${fileExt}`;
    
                // Create new file with custom name
                const renamedFile = new File(
                    [selectedFile],
                    newFileName,
                    { type: selectedFile.type }
                );
    
                // Create FormData
                const formData = new FormData();
                formData.append('file', renamedFile);
    
                console.log('Sending file to parser...');
    
                // Parse resume first to get skills
                const parseResponse = await fetch('/api/parse-resume', {
                    method: 'POST',
                    body: formData
                });

                if (!parseResponse.ok) {
                    const errorText = await parseResponse.text();
                    console.error('Parse response error:', errorText);
                    throw new Error('Failed to parse resume');
                }
    
                const parsedData = await parseResponse.json();
                console.log('Parsed resume data:', parsedData);

                
                try {
                    // Update profile with parsed response
                    const updateProfileResponse = await fetch(`/api/profiles/parsed-response/${user?.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            parsedResponse: JSON.stringify(parsedData)
                        })
                    });
                
                    if (!updateProfileResponse.ok) {
                        throw new Error('Failed to update profile with parsed response');
                    }
                } catch (error) {
                    console.error('Error updating profile with parsed response:', error);
                }
                
                // Update form data with parsed skills
                if (parsedData.name && parsedData.name.length > 0) {
                    setCandidateFormData(prev => ({
                        ...prev,
                        name: parsedData.name
                    }));
                }
                if (parsedData.skills && parsedData.skills.length > 0) {
                    setCandidateFormData(prev => ({
                        ...prev,
                        skills: parsedData.skills.join(', ') // Convert array to comma-separated string
                    }));
                }
    
                // Continue with text extraction and file upload
                setFile(renamedFile);
            } catch (error) {
                console.error('Error processing file:', error);
            } finally {
                setIsParsing(false)
            }
        }
    }


    useEffect(() => {
        const uploadFile = async () => {
            if (!file) {
                console.error("No file selected for upload.");
                return;
            }

            const { data, error } = await supabaseClient.storage
                .from("rekrutor-public")
                .upload(`/public/${file.name}`, file, {
                    cacheControl: "3600",
                    upsert: true  // Changed to true to overwrite if file exists
                });

            console.log(data, error);

            if (data) {
                setCandidateFormData((prev) => ({
                    ...prev,
                    resume: file.name,
                }));
            }
        };

        if (file) uploadFile();
    }, [file]);

    function handleCandidateFormValid() {
        console.log("Candidate form data:", candidateFormData, " ", user);
        // Get only the required fields from candidateOnBoardFormControls
        const requiredFields = candidateOnBoardFormControls
            .filter(control => 
                control.required && 
                (!control.showWhen || control.showWhen(candidateFormData))
            )
            .map(control => control.name);

        return requiredFields.every(fieldName => {
            const value = candidateFormData[fieldName];
            if (typeof value === "string") {
                return value.trim() !== "";
            }
            return value !== null && value !== undefined;
        });
    }

    const handleRecruiterFormValid = () => {
        return (recruiterFormData && 
            recruiterFormData.name.trim() !== '' &&
            recruiterFormData.companyName.trim() !== '' &&
            recruiterFormData.companyRole.trim() !== '')
    }

    async function createProfile() {
        try {
            setLoading(true)
            const data = currentTab === 'candidate' ? {
                candidateInfo: candidateFormData,
                role: 'candidate',
                isPremiumUser: false,
                userId: user?.id,
                email: user?.primaryEmailAddress?.emailAddress
            } : {
                recruiterInfo: recruiterFormData,
                role: 'recruiter',
                isPremiumUser: false,
                userId: user?.id,
                email: user?.primaryEmailAddress?.emailAddress
            }

            if (currentTab === 'recruiter') {
                delete data.candidateInfo;
            }

            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to create profile')
            }

            window.location.replace('/jobs')

        } catch (error) {
            console.error('Error creating profile:', error.message)
            setLoading(false)
        }
    }

    return(
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <CancelSignupButton />
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <Tabs value={currentTab} onValueChange={handleTabChange} className="p-6">
                    <div className="w-full text-center mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
                            Lets get you started
                        </h1>
                        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1">
                            <TabsTrigger 
                                value="candidate"
                                className={`px-6 hover:scale-105 transition-all duration-300 bg-gray-100 border-2 border-gray-300 rounded-2xl data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-gray-900 ${
                                    user?.primaryEmailAddress?.emailAddress?.toLowerCase().endsWith('@gmail.com') 
                                    ? 'font-bold' 
                                    : ''
                                }`}
                            >
                                Sign up as Applicant
                            </TabsTrigger>
                            <TabsTrigger 
                                value="recruiter"
                                className="px-6 hover:scale-105 transition-all duration-300 bg-gray-100 border-2 border-gray-300 rounded-2xl data-[state=active]:scale-105 data-[state=active]:border-2 data-[state=active]:border-gray-900"
                            >
                                Sign up as Recruiter
                            </TabsTrigger>
                        </TabsList>
                    </div>


                    {isParsing && <LoadingOverlay/>}

                    <div className="mt-8">
                        <TabsContent value="candidate" className="space-y-6">
                            <div className="bg-white rounded-lg">
                                <CommonForm
                                    formControls={candidateOnBoardFormControls}
                                    buttonText={loading ? 'Creating Profile...' : 'Onboard as Candidate'}
                                    formData={candidateFormData}
                                    setFormData={setCandidateFormData}
                                    handleFileChange={handleFileChange}
                                    isBtnDisabled={!handleCandidateFormValid() || loading}
                                    action={createProfile}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="recruiter" className="space-y-6">
                            <div className="bg-white rounded-lg">
                                <CommonForm 
                                    formControls={recruiterOnBoardFormControls}
                                    buttonText={loading ? 'Creating Profile...' : 'Onboard as Recruiter'}
                                    formData={recruiterFormData}
                                    setFormData={setRecruiterFormData}
                                    isBtnDisabled={!handleRecruiterFormValid() || loading}
                                    action={createProfile}
                                />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs> 

                {/* Warning Dialog */}
                <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{warningMessage.title}</DialogTitle>
                            <DialogDescription>
                                {warningMessage.description}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowWarningDialog(false)
                                    // Stay on current tab
                                    setPendingTabChange(null)
                                }}
                            >
                                No
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowWarningDialog(false)
                                    // Proceed to requested tab
                                    if (pendingTabChange) {
                                        setCurrentTab(pendingTabChange)
                                        updateURL(pendingTabChange)
                                        setPendingTabChange(null)
                                    }
                                }}
                            >
                                Yes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default OnBoard