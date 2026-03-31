const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Configure email service (using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Helper function to call Groq API for resume analysis
async function analyzeResumeWithAI(resume, jobDescription) {
  try {
    console.log('📤 Analyzing resume with AI...');
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `You are an expert HR recruiter. Analyze this resume against the job description:

RESUME:
${resume.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

Provide a detailed analysis with:
1. Match Score (0-100%)
2. Top 3 Strengths
3. Top 3 Weaknesses
4. Key Observations
5. Recommendation (Accept/Reject)

Be concise and specific.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Analysis received');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ AI Analysis error:', error.message);
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

// Helper function to send acceptance email
async function sendAcceptanceEmail(candidateEmail, candidateName, jobTitle, companyName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@higher.com',
      to: candidateEmail,
      subject: `🎉 Congratulations! You've been Selected - ${jobTitle} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 8px; }
              .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations, ${candidateName}!</h1>
              </div>
              
              <div class="content">
                <p>We are pleased to inform you that you have been selected to move forward in our hiring process for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
                
                <p>Your qualifications and experience impressed our team, and we believe you would be a great fit for our organization.</p>
                
                <h3>Next Steps:</h3>
                <ul>
                  <li>Our HR team will contact you within the next 2-3 business days</li>
                  <li>You will receive details about the next stage of the interview process</li>
                  <li>If you have any questions, feel free to reply to this email</li>
                </ul>
                
                <p>Thank you for your interest in joining our team!</p>
              </div>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply with attachments.</p>
                <p>&copy; 2026 Higher - Hiring Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Acceptance email sent to', candidateEmail);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
}

// Helper function to send rejection email
async function sendRejectionEmail(candidateEmail, candidateName, jobTitle, companyName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@higher.com',
      to: candidateEmail,
      subject: `Application Update - ${jobTitle} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f5f5f5; color: #333; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #ff9800; }
              .content { padding: 20px; background: #f9f9f9; margin: 20px 0; border-radius: 8px; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Application Status Update</h2>
              </div>
              
              <div class="content">
                <p>Dear ${candidateName},</p>
                
                <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> and for taking the time to apply.</p>
                
                <p>After careful consideration of your qualifications, we have decided to move forward with other candidates whose experience more closely aligns with our current needs.</p>
                
                <h3>What's Next?</h3>
                <ul>
                  <li>We encourage you to apply for other positions that match your skills</li>
                  <li>Feel free to connect with us on LinkedIn and follow our job postings</li>
                  <li>We would love to consider you for future opportunities</li>
                </ul>
                
                <p>We appreciate your time and wish you the best of luck in your career endeavors!</p>
                
                <p>Best regards,<br><strong>${companyName} Recruitment Team</strong></p>
              </div>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply with attachments.</p>
                <p>&copy; 2026 Higher - Hiring Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent to', candidateEmail);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    throw error;
  }
}

// Analyze Application
router.post('/analyze-application', async (req, res) => {
  try {
    console.log('🔵 Analyze Application Request');
    const { resume, jobDescription } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({ error: 'Resume and job description required' });
    }

    const analysis = await analyzeResumeWithAI(resume, jobDescription);

    res.json({
      success: true,
      analysis: analysis
    });
  } catch (error) {
    console.error('Application analysis error:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

// Accept Candidate
router.post('/accept-candidate', async (req, res) => {
  try {
    console.log('🔵 Accept Candidate Request');
    const { candidateEmail, candidateName, jobTitle, companyName } = req.body;

    if (!candidateEmail || !candidateName || !jobTitle || !companyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendAcceptanceEmail(candidateEmail, candidateName, jobTitle, companyName);

    res.json({
      success: true,
      message: `Acceptance email sent to ${candidateEmail}`
    });
  } catch (error) {
    console.error('Accept candidate error:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

// Reject Candidate
router.post('/reject-candidate', async (req, res) => {
  try {
    console.log('🔵 Reject Candidate Request');
    const { candidateEmail, candidateName, jobTitle, companyName } = req.body;

    if (!candidateEmail || !candidateName || !jobTitle || !companyName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendRejectionEmail(candidateEmail, candidateName, jobTitle, companyName);

    res.json({
      success: true,
      message: `Rejection email sent to ${candidateEmail}`
    });
  } catch (error) {
    console.error('Reject candidate error:', error.message);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;