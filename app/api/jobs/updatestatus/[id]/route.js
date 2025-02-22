import connectToDB from "@/database"
import Job from "@/models/jobs"
import { NextResponse } from "next/server"


export async function PUT(request, { params }) {
    try {
        await connectToDB()
        const { id } = params
        const { hiredFlag } = await request.json()
        //console.log(hiredFlag)
        const status = hiredFlag === 'Hired' ? true : false
        const updatedJob = await Job.findByIdAndUpdate(
            id,
            { hiredFlag: status },
            { new: true }
        )



        if (!updatedJob) {
            return NextResponse.json(
                { message: 'Job not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { message: 'Job status updated successfully', job: updatedJob },
            { status: 200 }
        )

    } catch (error) {
        console.error('Error updating job status:', error)
        return NextResponse.json(
            { message: 'Failed to update job status' },
            { status: 500 }
        )
    }
} 