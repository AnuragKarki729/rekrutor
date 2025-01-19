import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Job from "@/models/jobs"

// GET recruiter jobs (matches fetchJobsForRecruiterAction)
export async function GET(request, { params }) {
    try {
        await connectToDB()
        const result = await Job.find({ recruiterId: params.id })
        return NextResponse.json(JSON.parse(JSON.stringify(result)))
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch recruiter jobs" },
            { status: 500 }
        )
    }
} 