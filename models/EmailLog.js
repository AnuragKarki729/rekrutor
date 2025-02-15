import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
    candidateEmail: {
        type: String,
        required: true,
    },
    recruiterEmail: {
        type: String,
        required: true,
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    status: {
        type: String,
        enum: ['Applied', 'Selected', 'Rejected'],
        required: true,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    senderRole: {
        type: String,
        enum: ['candidate', 'recruiter'],
        required: true
    }
});

emailLogSchema.statics.canSendEmail = async function(candidateEmail, recruiterEmail, jobId, senderRole) {
    console.log('Checking email permission with:', {
        candidateEmail,
        recruiterEmail,
        jobId,
        senderRole
    });
    if (senderRole === 'recruiter') return true;
    
    // const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    const sixHoursAgo = new Date(Date.now() - 60 * 1000);

    const jobIdObj = typeof jobId === 'string' ? new mongoose.Types.ObjectId(jobId) : jobId;

    const lastEmail = await this.findOne({
        candidateEmail,
        recruiterEmail,
        jobId: jobIdObj,
        senderRole: 'candidate'
    }).sort({ sentAt: -1 });

    console.log('Last email found:', lastEmail);

    if (!lastEmail) return true;
    
    return lastEmail.sentAt < sixHoursAgo;
};


const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;