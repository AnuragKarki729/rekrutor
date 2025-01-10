import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req) {
  try {
    await connectToDatabase();
    return new Response(JSON.stringify({ message: 'Connected to MongoDB successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Failed to connect to MongoDB' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
