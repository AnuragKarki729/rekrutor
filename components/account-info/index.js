'use client'

import { candidateOnBoardFormControls, initialCandidateAccountFormData, initialCandidateFormData, initialRecruiterFormData, recruiterOnBoardFormControls } from "@/utils";
import { useEffect, useState } from "react";
import CommonForm from "../common-form";
import { updateProfileAction } from "@/actions";
import { createClient } from "@supabase/supabase-js"
import toast from "react-hot-toast"

const supabaseClient = createClient(
    "https://hwbttezjdwqixmaftiyl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YnR0ZXpqZHdxaXhtYWZ0aXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0Mjc1MjksImV4cCI6MjA0ODAwMzUyOX0.giYTTB68BJchfDZdqnsMDpt7rhgVPOvPwYp90-Heo4c"
)

function AccountInfo({ profileInfo }) {
    const [candidateFormData, setCandidateFormData] = useState({});
    const [recruiterFormData, setRecruiterFormData] = useState({});
    const [newResume, setNewResume] = useState(null); // Store the new resume file
    const [file, setFile] = useState(null)

    useEffect(() => {
        if (profileInfo?.role === 'recruiter') {
            setRecruiterFormData(profileInfo?.recruiterInfo);
        } else if (profileInfo?.role === 'candidate') {
            setCandidateFormData(profileInfo?.candidateInfo);
        }
    }, [profileInfo]);

    async function handleFileChange(event) {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            // Get file extension
            const fileExt = selectedFile.name.split('.').pop();
            
            // Get user's first and last name from candidateFormData
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

            setFile(renamedFile);
        }
    }

    
    async function uploadAndParseFile(file) {
        if (!file) return;



            try {
                // Create FormData for parsing
                const formData = new FormData();
                formData.append('file', file);
                console.log('SENDING FILE TO PARSER')

                // Parse resume first to get skills
                const parseResponse = await fetch('/api/parse-resume', {
                    method: 'POST',
                    body: formData
                });

                

                if (!parseResponse.ok) {
                    throw new Error('Failed to parse resume');
                }


                const parsedData = await parseResponse.json();
                console.log('PARSED DATA', parsedData)
                
                // Update profile with parsed response
                try {
                    console.log('UPDATING PROFILE', profileInfo?.userId, profileInfo?.role)
                    const updateProfileResponse = await fetch(`/api/profiles/parsed-response/${profileInfo?.userId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            parsedResponse: JSON.stringify(parsedData)
                        })
                    });
                    console.log("last step")
                    if (!updateProfileResponse.ok) {
                        throw new Error('Failed to update profile with parsed response');
                    }
                } catch (error) {
                    console.error('Error updating profile with parsed response:', error);
                    toast.error('Failed to update profile with parsed data');
                }

                // Update form data with parsed information
                if (parsedData.name && parsedData.name.length > 0) {
                    setCandidateFormData(prev => ({
                        ...prev,
                        name: parsedData.name
                    }));
                }
                if (parsedData.skills && parsedData.skills.length > 0) {
                    setCandidateFormData(prev => ({
                        ...prev,
                        skills: parsedData.skills.join(', ')
                    }));
                }

                // Upload file to Supabase
                const { data, error } = await supabaseClient.storage
                    .from("rekrutor-public")
                    .upload(`/public/${file.name}`, file, {
                        cacheControl: "3600",
                        upsert: true
                    });

                if (error) {
                    throw error;
                }

                if (data) {
                    setCandidateFormData((prev) => ({
                        ...prev,
                        resume: file.name,
                    }));
                    toast.success('Resume uploaded and parsed successfully');
                }
            } catch (error) {
                console.error('Error processing file:', error);
                toast.error('Failed to process resume');
            }
        };

   


    async function handleUpdateAccount() {
        let updatedResume = candidateFormData.resume;

        // If a new resume is uploaded, handle the upload
        if (newResume) {
            const { data, error } = await supabaseClient.storage
                .from("rekrutor-public")
                .upload(`/public/${newResume.name}`, newResume, {
                    cacheControl: "3600",
                    upsert: true,
                });

            if (error) {
                console.error("Error uploading resume:", error);
                return;
            }

            // Update the resume URL
            updatedResume = data.path;
        }

        // Call the `updateProfileAction` to update the profile
        
        try {
            await updateProfileAction(
                profileInfo?.role === "candidate"
                    ? {
                          _id: profileInfo?._id,
                          userId: profileInfo?.userId,
                          role: profileInfo?.role,
                          email: profileInfo?.email,
                      isPremiumUser: profileInfo?.isPremiumUser,
                      memberShipType: profileInfo?.memberShipType,
                      memberShipEndDate: profileInfo?.memberShipEndDate,
                      memberShipStartDate: profileInfo?.memberShipStartDate,
                      candidateInfo: {
                          ...candidateFormData,
                          resume: updatedResume, // Set the updated resume path
                      },
                  }
                : {
                      _id: profileInfo?._id,
                      userId: profileInfo?.userId,
                      role: profileInfo?.role,
                      email: profileInfo?.email,
                      isPremiumUser: profileInfo?.isPremiumUser,
                      memberShipType: profileInfo?.memberShipType,
                      memberShipEndDate: profileInfo?.memberShipEndDate,
                      memberShipStartDate: profileInfo?.memberShipStartDate,
                      recruiterInfo: {
                          ...recruiterFormData,
                      },
                  },
            "/account" // Path to revalidate
        );

        // Clear the new resume state
        setNewResume(null);
        toast.success('Successfully updated!');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
            toast.error('Failed to update profile');
        }
    }

    return (
        <div className="mx-auto max-w-7xl">
            <div className="flex items-baseline justify-between pb-6 border-b pt-24">
                <h1 className="text-4xl font-bold tracking-tight text-grey-950">
                    Account Page
                </h1>
            </div>
            <div className="py-20 pb-24 pt-6">
                
                <div className="container mx-auto p=0 space-y-8">
                    
                {profileInfo?.role === "candidate" && (
                        <div className="mt-4">
                            <label
                                htmlFor="resume-upload"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Upload New Resume
                            </label>
                            <input
                                id="resume-upload"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {setNewResume(e.target.files[0]); uploadAndParseFile(e.target.files[0])}}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-sm file:font-medium"
                            />
                            {candidateFormData?.resume && (

                                <p className="mt-2 text-sm text-gray-600">
                                    Current Resume:{" "}
                                    <button
                                        onClick={() => window.open(`https://hwbttezjdwqixmaftiyl.supabase.co/storage/v1/object/public/rekrutor-public/${candidateFormData.resume}`, '_blank')}
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Resume
                                    </button>
                                </p>
                            )}
                        </div>
                    )}
                    <CommonForm
                        formControls={
                            profileInfo?.role === "candidate"
                                ? candidateOnBoardFormControls.filter(control => control.name !== 'resume')
                                : recruiterOnBoardFormControls
                        }
                        formData={
                            profileInfo?.role === "candidate"
                                ? candidateFormData
                                : recruiterFormData
                        }
                        setFormData={
                            profileInfo?.role === "candidate"
                                ? setCandidateFormData
                                : setRecruiterFormData
                        }
                        buttonText={"Update Profile"}
                        action={handleUpdateAccount}
                        handleFileChange={handleFileChange}
                    />
                    <p1>Hello{candidateFormData.parsedResponse===""? "No summary yet": candidateFormData.parsedResponse}</p1>
                    

                </div>
            </div>
        </div>
    );
}

export default AccountInfo;
