import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  job_title: { type: String, required: false },
  company: { type: String, required: false },
  duration: { type: String, required: false },
}, { _id: false });

const MatchSchema = new mongoose.Schema({
  recruiter_id: { type: String, required: false },
  position_id: { type: String, required: false },
  status: { type: String, enum: ['liked', 'disliked', 'pending'], required: false },
  matched_date: { type: Date, default: Date.now },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String, required: false },
  profile_picture_url: { type: String, required: false },
  bio: { type: String, required: false },

  experience: [ExperienceSchema], // Array for experience objects

  CV_file: { type: String, required: false },
  CV_summary: { type: String, required: false },
  CV_video: { type: String, required: false },

  matches: [MatchSchema], // Array for match objects

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_active: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
