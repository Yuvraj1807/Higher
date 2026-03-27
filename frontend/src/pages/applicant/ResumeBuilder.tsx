import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';

interface Props {
  onLogout: () => void;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const ResumeBuilder: React.FC<Props> = ({ onLogout }) => {
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [achievements, setAchievements] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !jobTitle.trim()) {
      setError('Name and target job title are required');
      return;
    }

    if (!GEMINI_API_KEY) {
      setError('⚠️ Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedResume('');

    const prompt = `Generate a professional resume for:
Name: ${fullName}
Target Job Title: ${jobTitle}
Skills: ${skills}
Work Experience: ${experience}
Education: ${education}
Achievements: ${achievements}

Create a well-formatted, ATS-friendly resume with sections:
- Professional Summary
- Skills
- Work Experience
- Education
- Achievements

Make it concise and impactful. Use bullet points.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      setGeneratedResume(text);
    } catch (err: any) {
      setError(err.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResume);
  };

  return (
    <>
      <Navbar role="applicant" profileCompleted={true} onLogout={onLogout} />
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <div className="auth-container" style={{ maxWidth: '100%' }}>
          <h2>📄 {t('nav.resumeBuilder')}</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleGenerate}>
            <label>{t('applicant.fullName')} *</label>
            <input
              type="text"
              placeholder={t('applicant.fullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label>Target Job Title *</label>
            <input
              type="text"
              placeholder="e.g. Software Engineer, Data Analyst"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />

            <label>{t('applicant.skills')}</label>
            <input
              type="text"
              placeholder="e.g. React, Python, SQL, Communication"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <label>{t('applicant.experience')}</label>
            <textarea
              placeholder="Describe your work experience..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
            />

            <label>{t('applicant.education')}</label>
            <input
              type="text"
              placeholder="e.g. B.Tech CSE – XYZ University (2020–2024)"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            />

            <label>Achievements / Projects</label>
            <textarea
              placeholder="Key achievements, projects, or certifications..."
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              rows={3}
            />

            <button type="submit" disabled={loading}>
              {loading ? '⏳ Generating...' : '✨ Generate Resume with AI'}
            </button>
          </form>
        </div>

        {generatedResume && (
          <div className="auth-container" style={{ maxWidth: '100%', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>📄 Generated Resume</h3>
              <button
                onClick={handleCopy}
                style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                📋 Copy
              </button>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>
              {generatedResume}
            </pre>
          </div>
        )}
      </div>
    </>
  );
};

export default ResumeBuilder;
