'use client'

import { candidateOnBoardFormControls, initialCandidateAccountFormData, initialCandidateFormData, initialRecruiterFormData, recruiterOnBoardFormControls } from "@/utils";
import { useEffect, useState } from "react";
import CommonForm from "../common-form";
import { updateProfileAction } from "@/actions";

function AccountInfo({ profileInfo }) {
    const [candidateFormData, setCandidateFormData] = useState(initialCandidateAccountFormData)
    const [recruiterFormData, setRecruiterFormData] = useState(initialRecruiterFormData)
    useEffect(() => {
        if (profileInfo?.role === 'recruiter') {
            setRecruiterFormData(profileInfo?.recruiterInfo)
        }
        else if (profileInfo?.role === 'candidate') {
            setCandidateFormData(profileInfo?.candidateInfo)
        }
    }, [profileInfo])

    async function handleUpdateAccount() {
        await updateProfileAction(profileInfo?.role === 'candidate' ?
            {
                _id :profileInfo?._id,
                userId: profileInfo?.userId,
                role: profileInfo?.role,
                email: profileInfo?.email,
                isPremiumUser: profileInfo?.isPremiumUser,
                memberShipType: profileInfo?.memberShipType,
                memberShipEndDate: profileInfo?.memberShipEndDate,
                memberShipStartDate: profileInfo?.memberShipStartDate,
                candidateInfo: {
                    ...candidateFormData,
                    resume: profileInfo?.candidateInfo.resume
                }
            } :
            {
                _id :profileInfo?._id,
                userId: profileInfo?.userId,
                role: profileInfo?.role,
                email: profileInfo?.email,
                isPremiumUser: profileInfo?.isPremiumUser,
                memberShipType: profileInfo?.memberShipType,
                memberShipEndDate: profileInfo?.memberShipEndDate,
                memberShipStartDate: profileInfo?.memberShipStartDate,
                recruiterInfo: {
                    ...recruiterFormData
                },
            }, "/account")
    }

    console.log(candidateFormData, 'candidateInfo', profileInfo)

    return (<div className="mx-auto max-w-7xl">
        <div className="flex items-baseline justify-between pb-6 border-b pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-grey-950">Account Page</h1>
        </div>
        <div className="py-20 pb-24 pt-6">
            <div className="container mx-auto p=0 space-y-8">
                <CommonForm
                    formControls={
                        profileInfo?.role === 'candidate' ?
                            candidateOnBoardFormControls.filter(formControl => formControl.name !== 'resume') :
                            recruiterOnBoardFormControls
                    }
                    formData={profileInfo?.role === 'candidate' ? candidateFormData : recruiterFormData}
                    setFormData={
                        profileInfo?.role === 'candidate' ? setCandidateFormData : setRecruiterFormData

                    }
                    buttonText={'Update Profile'}
                    action={handleUpdateAccount}
                />
            </div>
        </div>
    </div>
    );
}

export default AccountInfo;