import connectToDB from "@/database";
import VideoReport from "@/models/VideoReport";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectToDB();
        const body = await request.json();
        
        // Add debug logging
        //console.log('Model schema:', VideoReport.schema.obj);
        //console.log('Attempting to create report with data:', body);
        
        // Add validation
        if (!body.videoUrl) {
            return NextResponse.json(
                { error: 'Video URL is required', details: 'Missing videoUrl field' },
                { status: 400 }
            );
        }

        if (!body.reason) {
            return NextResponse.json(
                { error: 'Reason is required', details: 'Missing reason field' },
                { status: 400 }
            );
        }

        const report = await VideoReport.create({
            videoUrl: body.videoUrl,
            reason: body.reason
        });

        //console.log('Created report:', report);

        return NextResponse.json({ success: true, report });
    } catch (error) {
        //console.error('Error creating video report:', error);
        return NextResponse.json(
            { 
                error: 'Failed to create video report', 
                details: error.message,
                validationErrors: error.errors 
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectToDB();
        const reports = await VideoReport.find({ status: 'pending' });
        return NextResponse.json({ success: true, reports });
    } catch (error) {
        console.error('Error fetching video reports:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video reports' },
            { status: 500 }
        );
    }
} 