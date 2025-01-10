'use client'
import React, { useEffect } from "react"
import CommonForm from "../common-form"
const { Tabs, TabsList, TabsTrigger, TabsContent } = require("../ui/tabs")
import { useState } from "react" 
import { candidateOnBoardFormControls, initialCandidateFormData, initialRecruiterFormData, recruiterOnBoardFormControls } from "@/utils"
import { useUser } from "@clerk/nextjs"
import { createProfileAction } from "@/actions"
import { createClient } from "@supabase/supabase-js"

const supabaseClient = createClient(
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnR0ZXpqZHdxaXhtYWZ0aXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0Mjc1MjksImV4cCI6MjA0ODAwMzUyOX0.giYTTB68BJchfDZdqnsMDpt7rhgVPOvPwYp90-Heo4c"
)

function OnBoard(){

    const [currentTab, setCurrentTab] = useState('candidate')
    const [recruiterFormData, setRecruiterFormData] = useState(initialRecruiterFormData)
    const [candidateFormData, setCandidateFormData] = useState(initialCandidateFormData)
    function handleTabChange(value){
        setCurrentTab(value)
    }

    const[file, setFile] = useState('null')

    const currentAuthUser = useUser()
    const {user} = currentAuthUser

    function handleFileChange(event){
        event.preventDefault()
        const selectedFile = (event.target.files[0]) 
        console.log(event.target.files)
        if (selectedFile) {
            setFile(selectedFile);
            console.log("Selected file:", selectedFile.name);
        } else {
            console.error("No file selected");
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
                    upsert: false,
                });
    
            console.log(data, error);
    
            if (data) {
                const fileName = data.path.split('/').pop()
                setCandidateFormData((prev) => ({
                    ...prev,
                    resume: fileName,
                }));
            }
        };
    
        if (file) uploadFile();
    }, [file]);
    

  

    console.log(currentAuthUser)
    console.log(recruiterFormData, 'recruiterFormData')

    function handleCandidateFormValid() {
        return Object.keys(candidateFormData).every((key) => {
            const value = candidateFormData[key];
            // Check if the value is defined and non-empty
            console.log(`Key: ${key}, Value: ${value}`);
            if (typeof value === "string") {
                return value.trim() !== "";
            }
            // For non-string values (e.g., files), ensure they are not null or undefined
            return value !== null && value !== undefined;
        });
    }

    const handleRecruiterFormValid=()=>{
        return (recruiterFormData && 
            recruiterFormData.name.trim() !=='' &&
            recruiterFormData.companyName.trim() !=='' &&
             recruiterFormData.companyRole.trim() !=='')
    }

    async function createProfile() {
         const data = currentTab === 'candidate' ? {
            candidateInfo : candidateFormData,
            role :'candidate',
            isPremiumUser: false,
            userId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress
         } : {
            recruiterInfo: recruiterFormData,
            role :'recruiter',
            isPremiumUser: false,
            userId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress
         }
         await createProfileAction(data, '/onboard')

    }

    return(
        <div className="bg-white">
        <Tabs value={currentTab} onValueChange={handleTabChange}>
            <div className="w-full">
                <div className="flex items-baseline justify-between border-b pb-6 pt-24">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Welcome to Onboarding</h1>
                    <TabsList>
                        <TabsTrigger value = "candidate">Candidate</TabsTrigger>
                        <TabsTrigger value = "recruiter">Recruiter</TabsTrigger>
                    </TabsList>
                </div>
            </div>
            <TabsContent value = "candidate">
                <CommonForm
                formControls={candidateOnBoardFormControls}
                buttonText={'Onboard as Candidate'}
                formData={candidateFormData}
                setFormData={setCandidateFormData}
                handleFileChange={handleFileChange}
                isBtnDisabled={!handleCandidateFormValid()}
                action={createProfile}/>
            </TabsContent>
            <TabsContent value = "recruiter">
                <CommonForm formControls={recruiterOnBoardFormControls}
                buttonText={'Onboard as Recruiter'}
                formData = {recruiterFormData}
                setFormData={setRecruiterFormData}
                isBtnDisabled={!handleRecruiterFormValid()}
                action={createProfile}/>
            </TabsContent>
        </Tabs> 
        </div>
    )
}

export default OnBoard