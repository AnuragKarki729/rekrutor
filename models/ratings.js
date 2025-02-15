import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    candidateId: {
        type: String,
        required: true
    },
    
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const recruiterRatingSchema = new mongoose.Schema({
    recruiterId: {
        type: String,
        required: true,
        unique: true
    },
    ratings: [ratingSchema],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
}, { timestamps: true });

// Calculate average rating before saving
recruiterRatingSchema.pre('save', function(next) {
    if (this.ratings.length > 0) {
        this.averageRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0) / this.ratings.length;
    }
    next();
});

// Static method to update or create a rating
recruiterRatingSchema.statics.upsertRating = async function(recruiterId, candidateId, rating, review) {
    const recruiterRating = await this.findOne({ recruiterId });
    
    if (recruiterRating) {
        // Remove existing rating from this candidate if it exists
        const ratingIndex = recruiterRating.ratings.findIndex(r => r.candidateId === candidateId);
        
        if (ratingIndex !== -1) {
            // Update existing rating
            recruiterRating.ratings[ratingIndex] = {
                candidateId,
                rating,
                review,
                createdAt: new Date()
            };
        } else {
            // Add new rating
            recruiterRating.ratings.push({
                candidateId,
                rating,
                review,
                createdAt: new Date()
            });
        }
        
        return recruiterRating.save();
    } else {
        // Create new document
        return this.create({
            recruiterId,
            ratings: [{
                candidateId,
                rating,
                review,
                createdAt: new Date()
            }]
        });
    }
};

// Remove the unique index since we're handling duplicates in the upsertRating method
// recruiterRatingSchema.index({ 'ratings.candidateId': 1 }, { unique: true });

export default mongoose.models.RecruiterRating || mongoose.model('RecruiterRating', recruiterRatingSchema);