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
import { toast } from "react-hot-toast"

const supabaseClient = createClient(
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "YOUR_SUPABASE_ANON_KEY"
)

const normalizeCountryName = (country) => {
    if (!country) return '';
    
    const countryMappings = {
        'United States': 'United States of America (the)',
        'USA': 'United States of America (the)',
        'US': 'United States of America (the)',
        'UK': 'United Kingdom of Great Britain and Northern Ireland (the)',
        'Britain': 'United Kingdom of Great Britain and Northern Ireland (the)',
        'Great Britain': 'United Kingdom of Great Britain and Northern Ireland (the)',
        'UAE': 'United Arab Emirates (the)',
        'United Arab Emirates': 'United Arab Emirates (the)',
        'Remote': 'REMOTE',
        'remote': 'REMOTE',
        // Add more common variations as needed
    };

    // Check if the country is in our mapping
    if (countryMappings[country]) {
        return countryMappings[country];
    }

    // If not in mapping, return the original value
    return country;
};

// function LoadingOverlay() {
//     const [loadingText, setLoadingText] = useState("Parsing resume...");

//     useEffect(() => {
//         const timer1 = setTimeout(() => {
//             setLoadingText("Let's see your skills...");
//         }, 3000);

//         const timer2 = setTimeout(() => {
//             setLoadingText("Almost there...");
//         }, 6000);

//         return () => {
//             clearTimeout(timer1);
//             clearTimeout(timer2);
//         };
//     }, []);

//     return (
//         <div className="loading-overlay">
//             <div className="flex flex-col items-center gap-4">
//                 <div className="loader"></div>
//                 <div className="text-white text-xl">{loadingText}</div>
//             </div>
//         </div>
//     );
// }

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

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        
        if (!file) {
            console.log('No file selected');
            return;
        }

        setLoading(true);
        const loadingToastId = toast.loading('Processing resume...', {
            duration: Infinity
        });

        console.log('Sending file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/gemini-parser', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Parsed resume data:', result);

            if (result.success && result.data) {
                const formattedData = {
                    ...result.data,
                    skills: Array.isArray(result.data.skills) 
                        ? result.data.skills.join(', ') 
                        : result.data.skills || '',
                    profileLinks: Array.isArray(result.data.profileLinks) 
                        ? result.data.profileLinks.join(', ') 
                        : result.data.profileLinks || ''
                };

                // Base form data
                const newFormData = {
                    name: formattedData.name || '',
                    college: formattedData.college || '',
                    collegeLocation: normalizeCountryName(formattedData.collegeLocation),
                    experienceLevel: formattedData.experienceLevel || '',
                    preferedJobLocation: normalizeCountryName(formattedData.preferedJobLocation),
                    skills: formattedData.skills,
                    profileLinks: formattedData.profileLinks,
                    industry: formattedData.industry || 'Other',
                    otherIndustry: formattedData.industry === 'Other' ? 
                        (formattedData.otherIndustry || '') : ''
                };

                if (formattedData.experienceLevel === 'Experienced') {
                    const hasCurrentJob = formattedData.currentCompany && 
                        formattedData.currentCompany !== 'Unemployed';

                    newFormData.currentCompany = hasCurrentJob ? 
                        formattedData.currentCompany : 'Unemployed';
                    newFormData.currentPosition = hasCurrentJob ? 
                        formattedData.currentPosition : '-';
                    newFormData.currentJobLocation = hasCurrentJob ? 
                        normalizeCountryName(formattedData.currentJobLocation) : '-';
                    newFormData.currentSalary = formattedData.currentSalary || '-';
                    newFormData.noticePeriod = formattedData.noticePeriod || 'Immediate';
                    
                    // Handle previous companies with proper date formatting
                    if (Array.isArray(formattedData.previousCompanies)) {
                        newFormData.previousCompanies = formattedData.previousCompanies
                            .filter(company => company.endDate && 
                                !company.endDate.toLowerCase().includes('present'))
                            .map(company => {
                                // Format dates or provide defaults
                                let startDate = '';
                                let endDate = '';

                                try {
                                    // Try to format the date if it exists
                                    if (company.startDate) {
                                        // Ensure date is in YYYY-MM format
                                        startDate = company.startDate.substring(0, 7);
                                    }
                                    if (company.endDate) {
                                        // Ensure date is in YYYY-MM format
                                        endDate = company.endDate.substring(0, 7);
                                    }
                                } catch (error) {
                                    console.error('Date formatting error:', error);
                                }

                                return {
                                    companyName: company.companyName || '',
                                    position: company.position || '',
                                    startDate: startDate,
                                    endDate: endDate
                                };
                            });
                    } else {
                        newFormData.previousCompanies = [];
                    }
                } else {
                    // For freshers
                    newFormData.currentCompany = '';
                    newFormData.currentPosition = '';
                    newFormData.currentJobLocation = '';
                    newFormData.currentSalary = '';
                    newFormData.noticePeriod = '';
                    newFormData.previousCompanies = [];
                }

                setCandidateFormData(newFormData);
                toast.success('Resume parsed successfully!', {
                    id: loadingToastId
                });
            } else {
                toast.error('Failed to parse resume data', {
                    id: loadingToastId
                });
            }

        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to process PDF', {
                id: loadingToastId
            });
        } finally {
            setLoading(false);
        }
    };

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
        <div className="relative">
            

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
        </div>
    )
}

export default OnBoard