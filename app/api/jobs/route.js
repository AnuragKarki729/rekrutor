import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Job from "@/models/jobs"
import { revalidatePath } from 'next/cache'

// GET all jobs with optional filters (matches fetchJobsForCandidateAction)
export async function GET(request) {
    try {
        await connectToDB()
        const { searchParams } = new URL(request.url)
        
        let updatedParams = {};
        for (const [key, value] of searchParams.entries()) {
            if (value) {
                updatedParams[key] = { $in: value.split(",") };
            }
        }

        const result = await Job.find(
            Object.keys(updatedParams).length > 0 ? updatedParams : {}
        )

        return NextResponse.json(JSON.parse(JSON.stringify(result)))
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        )
    }
}

// POST new job (matches postNewJobAction)
export async function POST(request) {
    try {
        const formData = await request.json()
        await connectToDB()
        await Job.create(formData)
        
        // Get the pathToRevalidate from headers or query params
        const pathToRevalidate = request.headers.get('x-revalidate-path') || '/jobs'
        revalidatePath(pathToRevalidate)

        return NextResponse.json({ message: "Job created successfully" }, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create job" },
            { status: 500 }
        )
    }
}
