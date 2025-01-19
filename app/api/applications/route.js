import { NextResponse } from 'next/server'
import connectToDB from "@/database"
import Application from "@/models/application"
import { revalidatePath } from 'next/cache'

export async function POST(request) {
    try {
        const formData = await request.json()
        await connectToDB()
        await Application.create(formData)
        
        // Get the pathToRevalidate from headers or query params
        const pathToRevalidate = request.headers.get('x-revalidate-path') || '/jobs'
        revalidatePath(pathToRevalidate)

        return NextResponse.json({ message: "Application created successfully" }, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create application" },
            { status: 500 }
        )
    }
} 