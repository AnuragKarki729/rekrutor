import { connectToDatabase } from '@/lib/mongodb'
import RecruiterRating from '@/models/ratings'

export async function POST(req) {
    try {
        await connectToDatabase()
        const { recruiterId, candidateId, rating, review } = await req.json()
        //console.log(recruiterId, candidateId, rating, review, "recruiterId, candidateId, rating, review")
        
        // Validate input
        if (!recruiterId || !candidateId || !rating || !review) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (rating < 1 || rating > 5) {
            return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }

        // Find the recruiter's rating document
        let recruiterRating = await RecruiterRating.findOne({ recruiterId });
        
        if (recruiterRating) {
            // Find index of existing rating from this candidate
            const existingRatingIndex = recruiterRating.ratings.findIndex(
                r => r.candidateId === candidateId
            );

            if (existingRatingIndex !== -1) {
                // Update existing rating
                recruiterRating.ratings[existingRatingIndex] = {
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
        } else {
            // Create new document
            recruiterRating = new RecruiterRating({
                recruiterId,
                ratings: [{
                    candidateId,
                    rating,
                    review,
                    createdAt: new Date()
                }]
            });
        }

        // Save and calculate average
        const result = await recruiterRating.save();

        return Response.json({ 
            message: 'Rating submitted successfully', 
            averageRating: result.averageRating 
        })

    } catch (error) {
        //console.error('Error submitting rating:', error)
        return Response.json({ error: 'Failed to submit rating' }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        await connectToDatabase()
        const { searchParams } = new URL(req.url)
        const recruiterId = searchParams.get('recruiterId')

        if (!recruiterId) {
            return Response.json({ error: 'Recruiter ID is required' }, { status: 400 })
        }

        const ratings = await RecruiterRating.findOne({ recruiterId })
        
        if (!ratings) {
            return Response.json({ 
                recruiterId, 
                ratings: [], 
                averageRating: 0 
            })
        }

        return Response.json(ratings)

    } catch (error) {
        console.error('Error fetching ratings:', error)
        return Response.json({ error: 'Failed to fetch ratings' }, { status: 500 })
    }
}