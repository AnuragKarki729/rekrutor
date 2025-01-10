import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  match_id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  recruiter_id: { type: String, required: true },
  position_id: { type: String, required: true },
  status: { type: String, enum: ['liked', 'disliked', 'pending'], required: true },
  matched_date: { type: Date, default: Date.now },
});

export default mongoose.models.Match || mongoose.model('Match', MatchSchema);
