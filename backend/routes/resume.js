const express = require('express');
const axios = require('axios');
const router = express.Router();

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Helper function to call Groq API
async function generateText(prompt) {
  try {
    console.log('📤 Sending request to Groq API...');
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Response received');
    const result = response.data.choices[0].message.content;
    console.log('✅ Result generated, length:', result.length);
    return result;
  } catch (error) {
    console.error('❌ Groq API error:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('Data:', error.response.data);
    }
    throw new Error(error.response?.data?.error?.message || error.message);
  }
}

// Generate Resume with AI
router.post('/generate', async (req, res) => {
  try {
    console.log('🔵 Generate Resume Request');
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const resumePrompt = `You are an expert professional resume writer. Create a formal, well-structured, ATS-friendly resume based on this information:

${prompt}

Format the resume clearly with these sections:
CONTACT INFORMATION
PROFESSIONAL SUMMARY
TECHNICAL SKILLS
PROFESSIONAL EXPERIENCE
EDUCATION
CERTIFICATIONS & AWARDS

Make it professional, concise, and optimized for applicant tracking systems.`;

    const resume = await generateText(resumePrompt);

    res.json({ 
      success: true,
      resume: resume,
      message: 'Resume generated successfully' 
    });
  } catch (error) {
    console.error('Resume generation error:', error.message);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Review Resume with AI
router.post('/review', async (req, res) => {
  try {
    console.log('🔵 Review Resume Request');
    const { resume, jobDescription } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({ error: 'Resume and job description required' });
    }

    const reviewPrompt = `You are an expert HR recruiter and resume analyst. Analyze this resume against the job description:

RESUME:
${resume.substring(0, 2000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 1500)}

Provide a detailed analysis with:
1. Match Score (0-100%)
2. Top 3 Strengths
3. Top 3 Weaknesses  
4. Top 3 Recommendations
5. Missing Skills from the job description

Be specific and actionable.`;

    const review = await generateText(reviewPrompt);

    res.json({ 
      success: true,
      review: review,
      reviewText: review
    });
  } catch (error) {
    console.error('Resume review error:', error.message);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Optimize Resume with AI
router.post('/optimize', async (req, res) => {
  try {
    console.log('🔵 Optimize Resume Request');
    const { resume, jobTitle } = req.body;

    if (!resume) {
      return res.status(400).json({ error: 'Resume required' });
    }

    const optimizePrompt = `You are an ATS optimization specialist. Optimize this resume for ${jobTitle || 'general'} role:

${resume}

Improvements:
1. Add relevant keywords for ATS systems
2. Use strong action verbs
3. Add quantifiable metrics
4. Better structure and formatting
5. Improve relevance for ${jobTitle || 'the target role'}

Provide the optimized resume ready to submit.`;

    const optimized = await generateText(optimizePrompt);

    res.json({ 
      success: true,
      optimizedResume: optimized,
      message: 'Resume optimized successfully' 
    });
  } catch (error) {
    console.error('Resume optimization error:', error.message);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Cover Letter Generation
router.post('/cover-letter', async (req, res) => {
  try {
    console.log('🔵 Cover Letter Request');
    const { jobTitle, companyName, applicantName, skills, experience } = req.body;

    if (!jobTitle || !companyName || !applicantName) {
      return res.status(400).json({ error: 'Job title, company name, and applicant name required' });
    }

    const coverLetterPrompt = `Write a professional cover letter for:
- Position: ${jobTitle}
- Company: ${companyName}
- Name: ${applicantName}
- Skills: ${skills || 'Not specified'}
- Experience: ${experience || 'Not specified'}

Create a compelling 3-4 paragraph cover letter that:
1. Shows enthusiasm for the role
2. Highlights relevant skills
3. Demonstrates company knowledge
4. Has a strong closing

Format as a ready-to-send cover letter.`;

    const coverLetter = await generateText(coverLetterPrompt);

    res.json({ 
      success: true,
      coverLetter: coverLetter,
      message: 'Cover letter generated successfully' 
    });
  } catch (error) {
    console.error('Cover letter generation error:', error.message);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Analyze Job Description
router.post('/analyze-job', async (req, res) => {
  try {
    console.log('🔵 Analyze Job Request');
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description required' });
    }

    const analyzePrompt = `Analyze this job description and extract key information:

${jobDescription}

Provide:
1. Job Title
2. Required Skills (list)
3. Preferred Skills (list)
4. Key Responsibilities (list)
5. Desired Qualifications
6. Seniority Level
7. Work Arrangement (on-site/remote/hybrid)
8. Salary (if mentioned)
9. Top Tips for applicants

Be detailed and specific.`;

    const analysis = await generateText(analyzePrompt);

    res.json({ 
      success: true,
      analysis: analysis,
      analysisText: analysis
    });
  } catch (error) {
    console.error('Job analysis error:', error.message);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Interview Preparation
router.post('/interview-prep', async (req, res) => {
  try {
    console.log('🔵 Interview Prep Request');
    const { jobTitle, companyName, experience } = req.body;

    if (!jobTitle || !companyName) {
      return res.status(400).json({ error: 'Job title and company name required' });
    }

    const interviewPrompt = `Prepare comprehensive interview guidance for ${jobTitle} at ${companyName}.
Experience: ${experience || 'Not specified'}

Provide:
1. 5 Common Questions with tips
2. 5 Technical Questions
3. 5 Behavioral Questions (STAR method)
4. 3 Company-specific Questions
5. 5 Pro Interview Tips
6. 3 Red Flags to avoid
7. 3 Good Follow-up Questions

Be specific and detailed.`;

    const prep = await generateText(interviewPrompt);

    res.json({ 
      success: true,
      preparation: prep,
      preparationText: prep
    });
  } catch (error) {
    console.error('Interview preparation error:', error.message);
    res.status(500).json({ 
      error: error.message 
    });
  }
});

module.exports = router;