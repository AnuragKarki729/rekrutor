import nodemailer from 'nodemailer';
import { getRecruiterEmailTemplate } from '@/components/email-templates/recruiter-email';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export async function POST(req) {
    try {
        const { candidateEmail, candidateName, jobTitle, companyName, recruiterEmail } = await req.json();

        if (!candidateEmail || !candidateName || !jobTitle || !companyName || !recruiterEmail) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: candidateEmail,
            subject: `Interest in Your Application - ${jobTitle} at ${companyName}`,
            html: getRecruiterEmailTemplate({
                candidateName,
                jobTitle,
                companyName,
                recruiterEmail
            }),
            replyTo: recruiterEmail
        };

        await transporter.sendMail(mailOptions);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Recruiter email sent successfully!'
            }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error sending recruiter email:', error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: 'Failed to send email',
                details: error.message 
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
