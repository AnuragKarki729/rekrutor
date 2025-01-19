import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Application from "@/models/application"

export async function GET(request, { params }) {
    try {
        await connectToDB()
        const result = await Application.find({ candidateUserID: params.id })
        return NextResponse.json(JSON.parse(JSON.stringify(result)))
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch candidate applications" },
            { status: 500 }
        )
    }
} 