"use server"

import connectToDB from "@/database"
import Profile from "@/models/profile"
import Job from "@/models/jobs";
import { revalidatePath } from "next/cache";
import { jsx } from "react/jsx-runtime";
import Application from "@/models/application";


export async function createProfileAction(formData, pathToRevalidate) {
    await connectToDB()
    await Profile.create(formData);
    revalidatePath(pathToRevalidate);
}

export async function fetchProfileAction(id) {
    await connectToDB()
    const result = await Profile.findOne({ userId: id })

    return JSON.parse(JSON.stringify(result))
}

export async function postNewJobAction(formData, pathToRevalidate){
    await connectToDB();
    await Job.create(formData);
    revalidatePath(pathToRevalidate)
}

export async function fetchJobsForRecruiterAction(id) {
    await connectToDB()
    const result = await Job.find({ recruiterId: id })
    return JSON.parse(JSON.stringify(result))
    
}

export async function fetchJobsForCandidateAction(filterParams = {}) {
    await connectToDB();

    let updatedParams = {};
    Object.keys(filterParams).forEach((filterKey) => {
        if (filterParams[filterKey]) {
            updatedParams[filterKey] = { $in: filterParams[filterKey].split(",") };
        }
    });

    console.log(updatedParams, "Updated Params");
    
    // Fetch jobs using the updated parameters
    const result = await Job.find(filterParams && Object.keys(filterParams).length > 0? updatedParams : {});
    return JSON.parse(JSON.stringify(result));
}



export async function createJobApplicationAction(data, pathToRevalidate){
    await connectToDB();
    await Application.create(data);
    revalidatePath(pathToRevalidate)
}

export async function fetchJobApplicationsForCandidate(candidateID){
    await connectToDB()
    const result = await Application.find({ candidateUserID: candidateID })

    return JSON.parse(JSON.stringify(result))
}

export async function fetchJobApplicationsForRecruiter(recruiterID){
    await connectToDB()
    const result = await Application.find({ recruiterUserID: recruiterID })

    return JSON.parse(JSON.stringify(result))
}

export async function getCandidateDetailsByIDAction(currentCandidateID) {
    await connectToDB()
    const result = await Profile.findOne({ userId: currentCandidateID })
    return JSON.parse(JSON.stringify(result))
    
}

export async function updateJobApplicationAction(data,pathToRevalidate) {
    await connectToDB()
    const{ recruiterUserID,
        name,
        email,
        candidateUserID,
        status,
        jobID,
        JobAppliedOnDate, _id} = data;
        const result = await Application.findByIdAndUpdate({_id: _id}, {recruiterUserID,
            name,
            email,
            candidateUserID,
            status,
            jobID,
            JobAppliedOnDate
        },
        {new: true})
        revalidatePath(pathToRevalidate)
}

export async function createFilterCategoryAction(){
    await connectToDB()
    const result = await Job.find({})
    return JSON.parse(JSON.stringify(result))
}

export async function updateProfileAction(data, pathToRevalidate) {
    await connectToDB()
    const { userId, _id, 
        role,
        email,
        isPremiumUser,
        memberShipType,
        memberShipEndDate,
        memberShipStartDate,
        recruiterInfo,
        candidateInfo} =data
        
        await Profile.findByIdAndUpdate({_id: _id}, 
            {userId,role,
            email,
            isPremiumUser,
            memberShipType,
            memberShipEndDate,
            memberShipStartDate,
            recruiterInfo,
            candidateInfo}, 
        {new: true})
        
        revalidatePath(pathToRevalidate)
}

export async function updateVideoCVAction(userId, videoCVUrl, pathToRevalidate){
    await connectToDB()
    await Profile.findOneAndUpdate(
        { userId },
        { $set: { "candidateInfo.videoCV": videoCVUrl } },
        { new: true } 
      );

      revalidatePath(pathToRevalidate);
}