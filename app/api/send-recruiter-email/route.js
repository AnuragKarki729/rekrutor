import nodemailer from 'nodemailer';
import { getRecruiterEmailTemplate } from '@/components/email-templates/recruiter-email';
import EmailLog from '@/models/EmailLog';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export async function POST(req) {
    try {
        const { candidateEmail, candidateName, jobTitle, companyName, recruiterEmail, jobId } = await req.json();

        if (!candidateEmail || !candidateName || !jobTitle || !companyName || !recruiterEmail) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create the subject and email body
        const subject = `Next Steps - ${jobTitle} Position at ${companyName}`;
        const emailBody = `Dear ${candidateName},

I hope this email finds you well. I am writing regarding your application for the ${jobTitle} position at ${companyName}.

We are impressed with your qualifications and would like to move forward with your application. We believe your skills and experience would be a valuable addition to our team.

I would like to schedule a time to discuss the next steps in the process and answer any questions you may have about the role and our company.

Please let me know your availability for a conversation in the next few days.

Best regards,
${companyName} HR Team`;

        // Create Gmail URL
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${candidateEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

        // Log the email (optional, for tracking purposes)
        if (jobId) {
            await EmailLog.create({
                candidateEmail,
                recruiterEmail,
                jobId,
                status: 'Selected',
                senderRole: 'recruiter'
            });
        }

        return new Response(
            JSON.stringify({
                success: true,
                gmailUrl: gmailUrl
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: 'Failed to generate email link',
                details: error.message 
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
