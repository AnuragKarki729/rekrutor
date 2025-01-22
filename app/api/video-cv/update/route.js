import { NextResponse } from "next/server";
import  connectToDB  from "@/database";
import Profile from "@/models/profile";
import { revalidatePath } from "next/cache";

export async function PUT(request) {
    try {
        const { userId, videoUrl, pathToRevalidate } = await request.json();

        if (!userId || !videoUrl) {
            return NextResponse.json(
                { error: 'userId and videoUrl are required' },
                { status: 400 }
            );
        }

        await connectToDB();
        
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId },
            { $set: { "candidateInfo.videoCV": videoUrl } },
            { new: true }
        );

        if (!updatedProfile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        if (pathToRevalidate) {
            revalidatePath(pathToRevalidate);
        }

        return NextResponse.json({
            success: true,
            message: 'Video CV updated successfully',
            videoCV: updatedProfile.candidateInfo.videoCV
        });

    } catch (error) {
        console.error('Error updating video CV:', error);
        return NextResponse.json(
            { error: 'Failed to update video CV' },
            { status: 500 }
        );
    }
} 