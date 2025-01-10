import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  message_id: { type: String, required: true, unique: true },
  sender_id: { type: String, required: true }, // user_id or recruiter_id
  receiver_id: { type: String, required: true }, // user_id or recruiter_id
  content: { type: String, required: true },
  sent_at: { type: Date, default: Date.now },
  read_at: { type: Date, required: false },
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
