import { connectToDatabase } from '@/lib/mongodb';
import Match from '@/models/Match';

// GET: Fetch all matches
export async function GET(req) {
  await connectToDatabase();
  try {
    const matches = await Match.find({});
    return new Response(JSON.stringify(matches), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching matches' }), {
      status: 500,
    });
  }
}

// POST: Create a new match (User swipes on a job position)
export async function POST(req) {
  await connectToDatabase();
  const body = await req.json();
  try {
    const newMatch = await Match.create(body);
    return new Response(JSON.stringify(newMatch), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating match' }), {
      status: 500,
    });
  }
}

// PUT: Update match status (Recruiter or user changes match status)
export async function PUT(req) {
  await connectToDatabase();
  const { match_id, status } = await req.json();
  try {
    const updatedMatch = await Match.findOneAndUpdate(
      { match_id },
      { status },
      { new: true }
    );
    return new Response(JSON.stringify(updatedMatch), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating match' }), {
      status: 500,
    });
  }
}
