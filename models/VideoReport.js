const { mongoose } = require("mongoose");

const videoReportSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed'],
        default: 'pending'
    },
    reportedAt: {
        type: Date,
        default: Date.now
    },
    reviewerNotes: String
});

const VideoReport = mongoose.models.VideoReport || mongoose.model('VideoReport', videoReportSchema); 

export default VideoReport;
