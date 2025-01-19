import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Job from "@/models/jobs"

export async function GET() {
    try {
        await connectToDB()
        
        // Assuming this matches your createFilterCategoryAction logic
        const jobs = await Job.find({})
        const filterCategories = jobs.map(job => ({
            location: job.location,
            type: job.type,
            // Add other filter categories you need
        }))

        return NextResponse.json(JSON.parse(JSON.stringify(filterCategories)))
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch filter categories" },
            { status: 500 }
        )
    }
} 