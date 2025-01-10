import mongoose from 'mongoose';

const PositionSchema = new mongoose.Schema({
  position_id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  requirements: [{ type: String }], // Array of strings
  location: { type: String, required: false },
  salary_range: { type: String, required: false },
  status: { type: String, enum: ['open', 'paused', 'closed'], default: 'open' },
}, { _id: false });

const RecruiterSchema = new mongoose.Schema({
  recruiter_id: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String, required: false },
  company_id: { type: String, required: false },
  company_name: { type: String, required: true },

  positions: [PositionSchema], // Array of Position objects

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Recruiter || mongoose.model('Recruiter', RecruiterSchema);
