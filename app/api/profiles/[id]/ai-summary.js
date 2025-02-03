import { connectToDatabase } from '../../../../lib/mongodb';
import Profile from '../../../../models/profile';

export default async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();
        
        const { userId } = req.query;
        const { aiSummary } = req.body;

        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: userId },
            { 'candidateInfo.aiSummary': aiSummary },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json({ message: 'AI Summary updated successfully' });
    } catch (error) {
        console.error('Error updating AI Summary:', error);
        res.status(500).json({ message: 'Error updating AI Summary' });
    }
} 