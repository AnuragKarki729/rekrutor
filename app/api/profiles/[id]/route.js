import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Profile from "@/models/profile"

export async function GET(request, { params }) {
    try {
        await connectToDB()
        const profile = await Profile.findOne({ userId: params.id })
        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(profile)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        const data = await request.json()
        await connectToDB()
        
        if (data.videoCV) {
            // Handle videoCV update
            const profile = await Profile.findOneAndUpdate(
                { userId: params.id },
                { $set: { "candidateInfo.videoCV": data.videoCV } },
                { new: true }
            )
            return NextResponse.json(profile)
        }

        // Handle regular profile update
        const profile = await Profile.findByIdAndUpdate(
            data._id,
            data,
            { new: true }
        )
        
        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            )
        }
        return NextResponse.json(profile)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}
