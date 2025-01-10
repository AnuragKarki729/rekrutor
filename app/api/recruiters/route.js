import { connectToDatabase } from "@/lib/mongodb";
import Recruiter from "@/models/Recruiter";

export async function GET(req) {
    await connectToDatabase()
    const recruiters = await Recruiter.find({});
    return new Response (JSON.stringify(recruiters), {
        status:200,
        headers: {'Content-Type': 'application/json'},
    });
}

export async function POST(req) {
    await connectToDatabase()
    const body = await req.json()
    try {
        const newRecruiter = await Recruiter.create(body);
        return new Response(JSON.stringify(newRecruiter), { status:201})
        } catch (error) {
            return new Response(JSON.stringify({error: 'Error creating recruiting'}), { status:500})
    }
    
}