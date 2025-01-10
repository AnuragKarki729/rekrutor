import { connectToDatabase } from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET: Fetch notifications for a specific user or recruiter
export async function GET(req) {
  await connectToDatabase();
  const { user_id, recruiter_id } = req.nextUrl.searchParams;
  const filter = user_id ? { user_id } : { recruiter_id };

  try {
    const notifications = await Notification.find(filter);
    return new Response(JSON.stringify(notifications), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching notifications' }), {
      status: 500,
    });
  }
}

// POST: Create a new notification
export async function POST(req) {
  await connectToDatabase();
  const body = await req.json();
  try {
    const newNotification = await Notification.create(body);
    return new Response(JSON.stringify(newNotification), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating notification' }), {
      status: 500,
    });
  }
}

// PUT: Mark notification as read
export async function PUT(req) {
  await connectToDatabase();
  const { notification_id } = await req.json();
  try {
    const updatedNotification = await Notification.findOneAndUpdate(
      { notification_id },
      { read_at: new Date() },
      { new: true }
    );
    return new Response(JSON.stringify(updatedNotification), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating notification' }), {
      status: 500,
    });
  }
}
