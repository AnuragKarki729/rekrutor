import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Job from "@/models/jobs"
import mongoose from 'mongoose'

// GET job by ID (matches fetchJobDetailsByIDAction)
export async function GET(request, { params }) {
    try {
        await connectToDB()
        const id = await params.id

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid job ID format" },
                { status: 400 }
            )
        }

        const result = await Job.findById(id)
        
        if (!result) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(JSON.parse(JSON.stringify(result)))
    } catch (error) {
        console.error('Error fetching job:', error);
        return NextResponse.json(
            { error: "Failed to fetch job" },
            { status: 500 }
        )
    }
} 