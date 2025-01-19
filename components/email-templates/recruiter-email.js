export function getRecruiterEmailTemplate({ candidateName, jobTitle, companyName, recruiterEmail }) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .email-container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px;
                }
                .content {
                    padding: 20px;
                    line-height: 1.6;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #28a745;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    color: #6c757d;
                    font-size: 14px;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #dee2e6;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h2>Interest in Your Job Application</h2>
                </div>
                <div class="content">
                    <p>Dear ${candidateName},</p>
                    <p>I hope this email finds you well. I am reaching out regarding your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
                    <p>We were impressed by your profile and would like to discuss this opportunity further with you.</p>
                    <p>Please feel free to reach out to schedule a conversation at your earliest convenience.</p>
                    
                    <a href="mailto:${recruiterEmail}?subject=Re: ${jobTitle} position at ${companyName}" class="button">
                        Reply to Recruiter
                    </a>
                    
                    <p>Best regards,<br>${companyName} Recruitment Team</p>
                </div>
                <div class="footer">
                    <p>This email was sent via Rekrutor</p>
                    <p>Recruiter contact: ${recruiterEmail}</p>
                </div>
            </div>
        </body>
        </html>
    `;
} 