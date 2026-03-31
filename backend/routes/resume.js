const express = require('express');
const axios = require('axios');
const router = express.Router();

// Use environment variable - NOT hardcoded
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('⚠️ Warning: GROQ_API_KEY not set in environment variables');
}

// Generate Resume with AI
router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
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
            content: 'You are a professional resume writer. Create a well-formatted, ATS-optimized resume based on the provided information.'
          },
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
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const resume = response.data.choices[0].message.content;
    res.json({ resume });
  } catch (error) {
    console.error('Resume generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate resume' });
  }
});

// Review Resume
router.post('/review', async (req, res) => {
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
            content: 'You are an expert recruiter. Review the resume against the job description and provide detailed feedback.'
          },
          {
            role: 'user',
            content: `Resume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nProvide a detailed review with match percentage and suggestions.`
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

    const review = response.data.choices[0].message.content;
    res.json({ review });
  } catch (error) {
    console.error('Resume review error:', error.message);
    res.status(500).json({ error: 'Failed to review resume' });
  }
});

// Optimize Resume
router.post('/optimize', async (req, res) => {
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
            content: 'You are an ATS optimization expert. Optimize the resume to match the job description and improve ATS compatibility.'
          },
          {
            role: 'user',
            content: `Resume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nProvide an optimized version of the resume with ATS-friendly formatting and keyword placement.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const optimized = response.data.choices[0].message.content;
    res.json({ optimized });
  } catch (error) {
    console.error('Resume optimization error:', error.message);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

// Generate Cover Letter
router.post('/cover-letter', async (req, res) => {
  try {
    const { resume, jobDescription, companyName } = req.body;

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
            content: 'You are a professional cover letter writer. Create a compelling, personalized cover letter.'
          },
          {
            role: 'user',
            content: `Resume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nCompany: ${companyName || 'The Company'}\n\nWrite a professional cover letter that highlights relevant experience and enthusiasm for the role.`
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

    const coverLetter = response.data.choices[0].message.content;
    res.json({ coverLetter });
  } catch (error) {
    console.error('Cover letter generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

// Analyze Job
router.post('/analyze-job', async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
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
            content: 'You are a job analysis expert. Analyze job descriptions and provide key insights.'
          },
          {
            role: 'user',
            content: `Job Description:\n${jobDescription}\n\nProvide a detailed analysis including: key responsibilities, required skills, experience level, and salary insights if available.`
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
    console.error('Job analysis error:', error.message);
    res.status(500).json({ error: 'Failed to analyze job' });
  }
});

// Interview Preparation
router.post('/interview-prep', async (req, res) => {
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
            content: 'You are an interview preparation coach. Generate interview questions and tips based on the role and candidate background.'
          },
          {
            role: 'user',
            content: `Resume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nGenerate common interview questions, potential follow-ups, and tips for answering based on this specific role.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const interviewPrep = response.data.choices[0].message.content;
    res.json({ interviewPrep });
  } catch (error) {
    console.error('Interview prep error:', error.message);
    res.status(500).json({ error: 'Failed to generate interview prep' });
  }
});

module.exports = router;