'use client'
import React, { useEffect, useState } from "react"
import CommonForm from "../common-form"
import { useSearchParams } from 'next/navigation'
const { Tabs, TabsList, TabsTrigger, TabsContent } = require("../ui/tabs")
import { candidateOnBoardFormControls, initialCandidateFormData, initialRecruiterFormData, recruiterOnBoardFormControls } from "@/utils"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import CancelSignupButton from "../cancel-signup-button"
import '@/components/ui/loadingfile.css'

const supabaseClient = createClient(
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "YOUR_SUPABASE_ANON_KEY"
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

function OnBoard() {
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
        const typeParam = searchParams.get('type')
        if (typeParam) {
            setCurrentTab(typeParam)
        } else if (isGmail) {
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
        } else if (value === 'candidate' && currentTab === 'recruiter' && !isGmail) {
            setWarningMessage({
                title: 'Switch to Candidate Profile?',
                description: 'We advise you to log in from personal email for signing up as candidate. Would you still like to continue?'
            })
            setShowWarningDialog(true)
            setPendingTabChange(value)
        } else {
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
                setIsParsing(true);
                
                // Create FormData for both parsers
                const formData = new FormData();
                formData.append('file', selectedFile);

                // Call both parsers in parallel
                const [parseResponse1, parseResponse2] = await Promise.all([
                    // First parser (better at name and skills)
                    fetch('/api/parse-resume', {
                        method: 'POST',
                        body: formData
                    }),
                    // Second parser (better at links and education)
                    fetch('https://resume-parser-api-903918110499.us-east1.run.app/parse', {
                        method: 'POST',
                        body: formData
                    })
                ]);

                if (!parseResponse1.ok || !parseResponse2.ok) {
                    throw new Error('Failed to parse resume with one or both parsers');
                }

                const [parsedData1, parsedData2] = await Promise.all([
                    parseResponse1.json(),
                    parseResponse2.json()
                ]);

                console.log('Parser 1 data:', parsedData1);
                console.log('Parser 2 data:', parsedData2);

                // Store the complete parsed response from both parsers
                const combinedParsedResponse = {
                    parser1: parsedData1,
                    parser2: parsedData2
                };

                // Update profile with combined parsed response
                // try {
                //     const updateProfileResponse = await fetch(`/api/profiles/parsed-response/${user?.id}`, {
                //         method: 'PATCH',
                //         headers: {
                //             'Content-Type': 'application/json'
                //         },
                //         body: JSON.stringify({
                //             parsedResponse: JSON.stringify(combinedParsedResponse)
                //         })
                //     });

                //     if (!updateProfileResponse.ok) {
                //         throw new Error('Failed to update profile with parsed response');
                //     }
                // } catch (error) {
                //     console.error('Error updating profile with parsed response:', error);
                // }

                // Update form data with combined parsed information
                setCandidateFormData(prev => ({
                    ...prev,
                    // Prefer parser 1 for name and skills
                    name: parsedData1.name || parsedData2.name || prev.name,
                    skills: parsedData1.skills ? parsedData1.skills.join(', ') : 
                           (parsedData2.skills ? parsedData2.skills.join(', ') : prev.skills),
                    
                    // Use parser 2 for location and other details
                    currentJobLocation: parsedData2.location || prev.currentJobLocation,
                    preferedJobLocation: parsedData2.relocate || prev.preferedJobLocation,
                    currentCompany: parsedData2.experience?.companies?.[0] || prev.currentCompany,
                    currentPosition: parsedData2.experience?.designations?.[0] || prev.currentPosition,
                    experienceLevel: parsedData2.experience?.designations?.length > 0 ? "Experienced" : "Fresher",
                    previousCompanies: parsedData2.experience?.companies?.length > 1 ? 
                        parsedData2.experience.companies.slice(1) : prev.previousCompanies,
                    
                    // Use parser 2 for education and links
                    college: parsedData2.education?.universities?.[0] || prev.college,
                    graduatedYear: parsedData2.education?.graduation_year || prev.graduatedYear,
                    profileLinks: parsedData2.links || prev.profileLinks,
                    
                    // Store complete parsed response
                    parsedResponse: JSON.stringify(combinedParsedResponse, null, 2),
                }));

                // Handle file upload for resume storage
                const fileExt = selectedFile.name.split('.').pop();
                const firstName = candidateFormData.name?.split(' ')[0] || '';
                const lastName = candidateFormData.name?.split(' ').slice(1).join('') || '';
                const newFileName = firstName === '' || lastName === '' ? selectedFile.name : 
                    `${firstName}_${lastName}_Resume.${fileExt}`;

                const renamedFile = new File(
                    [selectedFile],
                    newFileName,
                    { type: selectedFile.type }
                );

                setFile(renamedFile);

            } catch (error) {
                console.error('Error processing file:', error);
            } finally {
                setIsParsing(false);
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
                    upsert: true
                });

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
                                    setPendingTabChange(null)
                                }}
                            >
                                No
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowWarningDialog(false)
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