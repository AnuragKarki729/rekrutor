export function getCandidateEmailTemplate({ candidateName, jobTitle, candidateEmail, status, companyName }) {
    const getEmailContent = () => {
        switch (status) {
            case 'Rejected':
                return `
                    <p>I hope this email finds you well. I am writing regarding my recent application for the <strong>${jobTitle}</strong> position at ${companyName}.</p>
                    <p>I understand that my application was not successful, but I would greatly appreciate the opportunity to discuss my qualifications further and address any concerns you may have had about my application.</p>
                    <p>I remain very interested in contributing to ${companyName} and would welcome the chance to further discuss how my skills and experience could be valuable to your team.</p>`;
            case 'Selected':
                return `
                    <p>I hope this email finds you well. I am writing to express my strong interest in the <strong>${jobTitle}</strong> position at ${companyName}.</p>
                    <p>I am thrilled about being selected and would like to express my keen interest in moving forward with the process. I am excited about the opportunity to contribute to your team and would welcome the chance to discuss the next steps.</p>
                    <p>I look forward to hearing from you regarding the next stages of the process.</p>`;
            case 'Applied':
                return `
                    <p>I hope this email finds you well. I am writing to follow up on my application for the <strong>${jobTitle}</strong> position at ${companyName}.</p>
                    <p>I submitted my application recently and wanted to reaffirm my strong interest in this opportunity. I believe my skills and experience align well with what you're looking for, and I would greatly appreciate any updates you could provide about the status of my application.</p>
                    <p>I remain very enthusiastic about the possibility of joining ${companyName} and contributing to your team.</p>`;
            default:
                return '';
        }
    };

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
                    <h2>${
                        status === 'Rejected' ? 'Job Rejection Appeal' : 
                        status === 'Selected' ? 'Job Application Interest' : 
                        'Job Application Follow-up'
                    }</h2>
                </div>
                <div class="content">
                    <p>To <strong>${companyName}</strong> HR,</p>
                    ${getEmailContent()}
                    <p>Best regards,<br>${candidateName}</p>
                    
                    <a href="mailto:${candidateEmail}?subject=Re: ${
                        status === 'Rejected' ? 'Appeal for' : 
                        status === 'Selected' ? 'Interest in' : 
                        'Follow-up on'} ${jobTitle} position" class="button">
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