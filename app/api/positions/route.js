import { connectToDatabase } from '@/lib/mongodb';
import Position from '@/models/Position';

// GET: Fetch all positions
export async function GET(req) {
  await connectToDatabase();
  try {
    const positions = await Position.find({});
    return new Response(JSON.stringify(positions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching positions' }), {
      status: 500,
    });
  }
}

// POST: Create a new position
export async function POST(req) {
  await connectToDatabase();
  const body = await req.json();
  try {
    const newPosition = await Position.create(body);
    return new Response(JSON.stringify(newPosition), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating position' }), {
      status: 500,
    });
  }
}
