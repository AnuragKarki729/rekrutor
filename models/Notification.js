import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  notification_id: { type: String, required: true, unique: true },
  user_id: { type: String, required: false },
  recruiter_id: { type: String, required: false },
  message: { type: String, required: true },
  type: { type: String, enum: ['match', 'message', 'reminder'], required: true },
  created_at: { type: Date, default: Date.now },
  read_at: { type: Date, required: false },
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
