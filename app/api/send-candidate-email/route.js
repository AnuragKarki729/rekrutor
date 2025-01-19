import nodemailer from 'nodemailer';
import { getCandidateEmailTemplate } from '@/components/email-templates/candidate-email';

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export async function POST(req) {
    try {
        const { recruiterEmail, candidateName, candidateEmail, jobTitle, status, companyName } = await req.json();

        if (!recruiterEmail || !candidateName || !candidateEmail || !jobTitle || !status) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        console.log(companyName)

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: 'asminsteam7@gmail.com',
            subject: status === 'Rejected' 
                ? `Rejection Appeal from ${candidateName} - ${jobTitle}`
                : `Application Interest from ${candidateName} - ${jobTitle}`,
            html: getCandidateEmailTemplate({ 
                candidateName, 
                jobTitle, 
                candidateEmail, 
                status,
                companyName
            }),
            replyTo: candidateEmail
        };

        await transporter.sendMail(mailOptions);

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email sent successfully!'
            }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error sending email:', error);
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