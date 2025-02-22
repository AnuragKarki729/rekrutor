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

export async function fetchJobDetailsByIDAction(id){
    await connectToDB()
    const result = await Job.findOne({ _id: id })
    return JSON.parse(JSON.stringify(result))
}

export async function fetchJobsForCandidateAction(filterParams = {}) {
    await connectToDB();

    let query = {};
    
    // Convert searchParams to regular object and handle async
    const params = await(filterParams ? Object.fromEntries(
        Object.entries(filterParams).map(([key, value]) => [key, value?.toString()])
    ) : {});

    // Handle search parameter separately
    if (params.search) {
        // Create text search query
        query.$or = [
            { title: { $regex: params.search, $options: 'i' } },
            { description: { $regex: params.search, $options: 'i' } },
            { companyName: { $regex: params.search, $options: 'i' } },
            { industry: { $regex: params.search, $options: 'i' } },
            { location: { $regex: params.search, $options: 'i' } },
            { skills: { $regex: params.search, $options: 'i' } },
            { type: { $regex: params.search, $options: 'i' } }
        ];
        delete params.search; // Remove search from regular filters
    }

    // Handle other filters
    Object.keys(params).forEach((filterKey) => {
        if (params[filterKey]) {
            query[filterKey] = { 
                $in: params[filterKey].toString().split(",") 
            };
        }
    });
    
    // console.log('MongoDB Query:', query); // Debug log
    const result = await Job.find(query);
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

export async function updateJobApplicationAction(data, pathToRevalidate) {
    await connectToDB();

    const {
        recruiterUserID,
        name,
        email,
        candidateUserID,
        status,
        jobID,
        JobAppliedOnDate,
        rejectionReason, // Include rejectionReason
        _id,
    } = data;


    // Add rejectionReason to the update data if provided

    try {
        const result = await Application.findByIdAndUpdate(
            { _id: _id },
            { $set: {recruiterUserID,
                name,
                email,
                candidateUserID,
                status,
                jobID,
                rejectionReason, 
                JobAppliedOnDate,
                
            },
        }, // Use $set to update specific fields
            { new: true } // Return the updated document
        );

        // console.log('Result', result)

        revalidatePath(pathToRevalidate);

        return JSON.parse(JSON.stringify(result)); // Optionally return the updated document for frontend reference
    } catch (error) {
        console.error("Error updating job application:", error);
        throw new Error("Failed to update job application.");
    }
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