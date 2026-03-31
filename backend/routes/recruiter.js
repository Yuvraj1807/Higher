const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const router = express.Router();

// Use environment variable - NOT hardcoded
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('⚠️ Warning: GROQ_API_KEY not set in environment variables');
}

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Analyze Application
router.post('/analyze-application', async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({ error: 'Resume and job description are required' });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert recruiter. Analyze if the candidate is a good fit for the role.'
          },
          {
            role: 'user',
            content: `Resume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nProvide: 1) Match percentage (0-100%), 2) Key strengths, 3) Gaps, 4) Overall recommendation (Accept/Consider/Reject).`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const analysis = response.data.choices[0].message.content;
    res.json({ analysis });
  } catch (error) {
    console.error('Application analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze application' });
  }
});

// Send Acceptance Email
router.post('/accept-candidate', async (req, res) => {
  try {
    const { candidateEmail, candidateName, jobTitle, companyName } = req.body;

    if (!candidateEmail || !candidateName || !jobTitle || !companyName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: `🎉 Great News! You're Invited to Interview`,
      html: `
        <h2>Hello ${candidateName},</h2>
        <p>We are delighted to inform you that your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> has been successful!</p>
        <p>We were impressed with your qualifications and experience. We would like to invite you to an interview to discuss the role further.</p>
        <p>A recruiter will contact you shortly with more details about the interview process.</p>
        <p><strong>Best regards,</strong><br>${companyName} Recruitment Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Acceptance email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Send Rejection Email
router.post('/reject-candidate', async (req, res) => {
  try {
    const { candidateEmail, candidateName, jobTitle, companyName } = req.body;

    if (!candidateEmail || !candidateName || !jobTitle || !companyName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: `Application Status - ${jobTitle} Position`,
      html: `
        <h2>Hello ${candidateName},</h2>
        <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
        <p>We appreciate your time and effort in applying. We encourage you to apply for future positions that may be a better fit.</p>
        <p><strong>Best regards,</strong><br>${companyName} Recruitment Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Rejection email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;