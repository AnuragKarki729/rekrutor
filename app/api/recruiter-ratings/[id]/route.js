import { connectToDatabase } from '@/lib/mongodb'
import RecruiterRating from '@/models/ratings'

export async function GET(req, { params }) {
    try {
        await connectToDatabase()
        const recruiterId = params.id

        if (!recruiterId) {
            return Response.json({ error: 'Recruiter ID is required' }, { status: 400 })
        }

        const recruiterRating = await RecruiterRating.findOne({ recruiterId })
        
        if (!recruiterRating) {
            return Response.json([])  // Return empty array if no ratings found
        }

        // Return the ratings array with only necessary fields
        const formattedRatings = recruiterRating.ratings.map(rating => ({
            rating: rating.rating,
            review: rating.review,
            createdAt: rating.createdAt
        }))

        // Sort by most recent first
        formattedRatings.sort((a, b) => b.createdAt - a.createdAt)

        return Response.json(formattedRatings)

    } catch (error) {
        console.error('Error fetching recruiter ratings:', error)
        return Response.json({ error: 'Failed to fetch ratings' }, { status: 500 })
    }
}
