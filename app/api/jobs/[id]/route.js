import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Job from "@/models/jobs"
import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'

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

// Handle PUT request to update a job
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        await connectToDB();

        const updatedJob = await Job.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedJob) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        // Get the pathToRevalidate from headers or query params
        const pathToRevalidate = request.headers.get('x-revalidate-path') || '/jobs';
        revalidatePath(pathToRevalidate);

        return NextResponse.json(updatedJob);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update job" },
            { status: 500 }
        );
    }
}

// Handle DELETE request to remove a job
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await connectToDB();

        const deletedJob = await Job.findByIdAndDelete(id);

        if (!deletedJob) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        // Get the pathToRevalidate from headers or query params
        const pathToRevalidate = request.headers.get('x-revalidate-path') || '/jobs';
        revalidatePath(pathToRevalidate);

        return NextResponse.json({ message: "Job deleted successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete job" },
            { status: 500 }
        );
    }
} 