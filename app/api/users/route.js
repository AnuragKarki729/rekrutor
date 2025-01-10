import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
    await connectToDatabase()
    const users = await User.find({})
    return new Response (JSON.stringify(users), {
        status:200,
        headers: {'Content-Type': 'application/json'},
    })
}

export async function POST(req) {
    await connectToDatabase()
    const body = await req.json()
    try {
        const newUser = await User.create(body)
        return new Response(JSON.stringify(newUser), { status:201})
        } catch (error) {
            return new Response(JSON.stringify({error:'Error Creating User'}), { status:500})
    }
}