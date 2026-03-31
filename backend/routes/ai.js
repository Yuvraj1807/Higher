module.exports = () => {
  const express = require('express');
  const router = express.Router();
  const axios = require('axios');

  // AI Resume Review using Gemini API
  router.post('/review-resume', async (req, res) => {
    try {
      const { resumeText } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: 'GEMINI_API_KEY not configured' });
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Review this resume and provide an ATS score (0-100), key strengths, and improvements:\n\n${resumeText}`
            }]
          }]
        }
      );

      const review = response.data.candidates[0].content.parts[0].text;
      
      // Extract ATS score from response (simple extraction)
      const atsMatch = review.match(/(\d+)/);
      const atsScore = atsMatch ? parseInt(atsMatch[0]) : 70;

      res.json({ 
        success: true, 
        review: review,
        atsScore: atsScore
      });
    } catch (error) {
      console.error('AI Review Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: error.response?.data?.error?.message || error.message 
      });
    }
  });

  // AI Resume Builder
  router.post('/build-resume', async (req, res) => {
    try {
      const { userPrompt } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: 'GEMINI_API_KEY not configured' });
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Create a professional resume based on this information:\n${userPrompt}\n\nFormat it as a clean, ATS-friendly resume with sections for Contact Info, Summary, Experience, Education, and Skills.`
            }]
          }]
        }
      );

      const resume = response.data.candidates[0].content.parts[0].text;

      res.json({ 
        success: true, 
        resume: resume
      });
    } catch (error) {
      console.error('Resume Builder Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: error.response?.data?.error?.message || error.message 
      });
    }
  });

  // AI Resume Tailor
  router.post('/tailor-resume', async (req, res) => {
    try {
      const { resume, jobDescription } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: 'GEMINI_API_KEY not configured' });
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: `Tailor this resume to match the job description:\n\nResume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nModify the resume to highlight relevant skills and experience that match the job requirements.`
            }]
          }]
        }
      );

      const tailoredResume = response.data.candidates[0].content.parts[0].text;

      res.json({ 
        success: true, 
        resume: tailoredResume
      });
    } catch (error) {
      console.error('Resume Tailor Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: error.response?.data?.error?.message || error.message 
      });
    }
  });

  return router;
};