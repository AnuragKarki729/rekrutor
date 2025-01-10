import mongoose from 'mongoose';

const PositionSchema = new mongoose.Schema({
  position_id: { type: String, required: true, unique: true },
  recruiter_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  requirements: [{ type: String }], // Array of strings
  location: { type: String, required: false },
  salary_range: { type: String, required: false },
  status: { type: String, enum: ['open', 'paused', 'closed'], default: 'open' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Position || mongoose.model('Position', PositionSchema);
