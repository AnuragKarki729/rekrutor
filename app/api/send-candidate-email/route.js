import nodemailer from 'nodemailer';
import EmailLog from '@/models/EmailLog';
import connectToDB from "@/database"

// Create reusable transporter


export async function POST(req) {
    try {
        // Connect to database first
        await connectToDB();
        
        const { recruiterEmail, candidateName, candidateEmail, jobTitle, status, companyName, jobId } = await req.json();
        
        //console.log('Received request with jobId:', jobId);


        if (!recruiterEmail || !candidateName || !candidateEmail || !jobTitle || !status || !jobId) {
            return new Response(
                JSON.stringify({ error: 'Missing required parameters' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Check if can send email
        const canSendEmail = await EmailLog.canSendEmail(
            candidateEmail, 
            recruiterEmail, 
            jobId,
            'candidate'
        );
        
        if (!canSendEmail) {
            return new Response(
                JSON.stringify({ 
                    success: false,
                    error: 'Please wait 48 hours before sending another email for this job application.' 
                }),
                { 
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Create the email content based on status
        const getEmailBody = () => {

            switch (status) {
                case 'Rejected':
                    return `Dear ${companyName} HR,

I hope this email finds you well. I am writing regarding my recent application for the ${jobTitle} position at ${companyName}.

I understand that my application was not successful, but I would greatly appreciate the opportunity to discuss my qualifications further and address any concerns you may have had about my application.

I remain very interested in contributing to ${companyName} and would welcome the chance to further discuss how my skills and experience could be valuable to your team.

Best regards,
${candidateName}`;

                case 'Selected':
                    return `Dear ${companyName} HR,

I hope this email finds you well. I am writing to express my strong interest in the ${jobTitle} position at ${companyName}.

I am thrilled about being selected and would like to express my keen interest in moving forward with the process. I am excited about the opportunity to contribute to your team and would welcome the chance to discuss the next steps.

I look forward to hearing from you regarding the next stages of the process.

Best regards,
${candidateName}`;

                default: // Applied
                    return `Dear ${companyName} HR,

I hope this email finds you well. I am writing to follow up on my application for the ${jobTitle} position at ${companyName}.

I submitted my application recently and wanted to reaffirm my strong interest in this opportunity. I believe my skills and experience align well with what you're looking for, and I would greatly appreciate any updates you could provide about the status of my application.

I remain very enthusiastic about the possibility of joining ${companyName} and contributing to your team.

Best regards,
${candidateName}`;
            }
        };

        // Create the subject based on status
        const subject = status === 'Rejected' 
            ? `Rejection Appeal from ${candidateName} - ${jobTitle}`
            : status === 'Selected' 
                ? `Application Interest from ${candidateName} - ${jobTitle}`
                : `Application Follow-up from ${candidateName} - ${jobTitle}`;

        // Create Gmail URL
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recruiterEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(getEmailBody())}`;
        //console.log(gmailUrl, "gmailUrl")
        //console.log(jobId, "jobId")

        // Create new email log
        const newEmailLog = await EmailLog.create({
            candidateEmail,
            recruiterEmail,
            jobId,
            status,
            senderRole: 'candidate'
        });

        //console.log('Created email log:', newEmailLog);
        
        return new Response(
            JSON.stringify({
                success: true,
                gmailUrl: gmailUrl
            }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Error in send-candidate-email:', error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: 'Failed to process request',
                details: error.message 
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}