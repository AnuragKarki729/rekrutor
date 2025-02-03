import { NextResponse } from "next/server";
import connectToDB from "@/database";
import Profile from "@/models/profile";

export async function GET(request, { params }) {
    try {
        const { userId } = params;
        await connectToDB();
        
        const profile = await Profile.findOne({ userId });
        
        if (!profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(profile);  // Return profile directly
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
} 