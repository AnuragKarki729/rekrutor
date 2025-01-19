import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Application from "@/models/application"
import { revalidatePath } from 'next/cache'

export async function PUT(request, { params }) {
    try {
        const data = await request.json()
        await connectToDB()
        
        const result = await Application.findByIdAndUpdate(
            params.id,
            { $set: data },
            { new: true }
        )

        if (!result) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 }
            )
        }

        // Get the pathToRevalidate from headers or query params
        const pathToRevalidate = request.headers.get('x-revalidate-path') || '/activity'
        revalidatePath(pathToRevalidate)

        return NextResponse.json(JSON.parse(JSON.stringify(result)))
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update application" },
            { status: 500 }
        )
    }
} 