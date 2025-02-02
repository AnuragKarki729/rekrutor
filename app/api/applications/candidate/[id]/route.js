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

export async function PUT(request, { params }) {
    try {
        await connectToDB();
        const { status } = await request.json();
        
        const application = await Application.findOne({ candidateUserID: params.id });
        if (!application) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            );
        }

        application.status.push(status);
        await application.save();

        return NextResponse.json({ 
            message: "Application status updated",
            newStatus: application.status 
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update application status" },
            { status: 500 }
        );
    }
}