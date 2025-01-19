export function getCandidateEmailTemplate({ candidateName, jobTitle, candidateEmail, status, companyName }) {
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
                    background-color: #007bff;
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
                    <h2>${status === 'Rejected' ? 'Job Rejection Appeal' : 'Job Application Interest'}</h2>
                </div>
                <div class="content">
                    <p>To <strong>${companyName}</strong> HR,</p>
                    ${status === 'Rejected' 
                        ? `<p>I hope this email finds you well. I am writing regarding my recent application for the <strong>${jobTitle}</strong> position at ${companyName}.</p>
                           <p>I understand that my application was not successful, but I would greatly appreciate the opportunity to discuss my qualifications further and address any concerns you may have had about my application.</p>`
                        : `<p>I hope this email finds you well. I am writing to express my strong interest in the <strong>${jobTitle}</strong> position at ${companyName}.</p>
                           <p>I am excited about the opportunity to contribute to your team and would welcome the chance to discuss how my skills and experience align with your needs.</p>`
                    }
                    <p>Best regards,<br>${candidateName}</p>
                    
                    <a href="mailto:${candidateEmail}?subject=Re: ${status === 'Rejected' ? 'Appeal for' : 'Interest in'} ${jobTitle} position" class="button">
                        Reply to Candidate
                    </a>
                </div>
                <div class="footer">
                    <p>This email was sent via Rekrutor</p>
                    <p>Candidate contact: ${candidateEmail}</p>
                </div>
            </div>
        </body>
        </html>
    `;
} 