import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';

// GET: Fetch all messages between two users (or for a single user)
export async function GET(req) {
  await connectToDatabase();
  const { sender_id, receiver_id } = req.nextUrl.searchParams;

  try {
    const messages = await Message.find({
      $or: [
        { sender_id, receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    });
    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching messages' }), {
      status: 500,
    });
  }
}

// POST: Send a new message between users
export async function POST(req) {
  await connectToDatabase();
  const body = await req.json();
  try {
    const newMessage = await Message.create(body);
    return new Response(JSON.stringify(newMessage), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating message' }), {
      status: 500,
    });
  }
}
