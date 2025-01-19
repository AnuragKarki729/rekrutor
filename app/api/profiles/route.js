import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Profile from "@/models/profile"

export async function GET() {
    try {
        await connectToDB()
        const profiles = await Profile.find({})
        return NextResponse.json(profiles)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch profiles" },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const data = await request.json()
        await connectToDB()
        const profile = await Profile.create(data)
        return NextResponse.json(profile, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
        )
    }
}
