import connectToDB from "@/database"
import Profile from '@/models/profile';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
    try {
        await connectToDB();
        
        const { id } = params;
        const { aiSummary } = await req.json();
        
        console.log('route hit')
        console.log(id, aiSummary !== null ? 'true' : 'false')

        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: id },
            { 'candidateInfo.aiSummary': aiSummary },
            { new: true }
        );

        console.log('updatedProfile', updatedProfile)

        if (!updatedProfile) {
            return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
    }
} 