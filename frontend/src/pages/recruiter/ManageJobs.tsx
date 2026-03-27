import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../config/firebase';
import Navbar from '../../components/Navbar';

interface Props {
  onLogout: () => void;
}

interface Job {
  id: string;
  title: string;
  location?: string;
  jobType?: string;
  createdAt: string;
}

interface Application {
  id: string;
  applicantEmail: string;
  applicantName?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  coverLetter?: string;
  appliedAt: string;
  jobId: string;
}

interface AIReview {
  [appId: string]: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

async function reviewResumeWithGemini(resumeUrl: string, jobTitle: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return '⚠️ Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env';
  }

  const prompt = `You are an expert HR recruiter. A candidate applied for the position of "${jobTitle}".
Their resume is available at: ${resumeUrl}

Based on the resume URL and context, please provide:
1. **Overall Assessment** (1-2 sentences)
2. **Strengths** (2-3 bullet points)
3. **Areas of Improvement** (1-2 bullet points)
4. **Recommendation**: Shortlist / Consider / Pass

Keep the review concise and professional.`;

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

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
}

const ManageJobs: React.FC<Props> = ({ onLogout }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<{ [jobId: string]: Application[] }>({});
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [aiReviews, setAiReviews] = useState<AIReview>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadJobs = async () => {
      if (!auth.currentUser) return;
      try {
        const jobsSnap = await getDocs(
          query(collection(db, 'jobs'), where('recruiterId', '==', auth.currentUser.uid)),
        );
        const jobsList: Job[] = jobsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
        setJobs(jobsList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const loadApplications = async (jobId: string) => {
    if (applications[jobId]) {
      setExpandedJob(expandedJob === jobId ? null : jobId);
      return;
    }
    try {
      const snap = await getDocs(
        query(collection(db, 'applications'), where('jobId', '==', jobId)),
      );
      const apps: Application[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
      setApplications((prev) => ({ ...prev, [jobId]: apps }));
      setExpandedJob(jobId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAIReview = async (app: Application, jobTitle: string) => {
    const resumeRef = app.resumeUrl || app.resumeFileName || '';
    if (!resumeRef) {
      setAiReviews((prev) => ({ ...prev, [app.id]: '⚠️ No resume URL provided for AI review.' }));
      return;
    }
    setReviewingId(app.id);
    try {
      const review = await reviewResumeWithGemini(resumeRef, jobTitle);
      setAiReviews((prev) => ({ ...prev, [app.id]: review }));
    } catch (err: any) {
      setAiReviews((prev) => ({ ...prev, [app.id]: `Error: ${err.message}` }));
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar role="recruiter" profileCompleted={true} onLogout={onLogout} />
        <div className="manage-jobs-container"><p>{t('common.loading')}</p></div>
      </>
    );
  }

  return (
    <>
      <Navbar role="recruiter" profileCompleted={true} onLogout={onLogout} />
      <div className="manage-jobs-container" style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
        <h2 className="page-title" style={{ color: 'white' }}>📂 {t('recruiter.manageJobs')}</h2>

        {jobs.length === 0 ? (
          <div className="job-card"><p>{t('jobs.noJobs')}</p></div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <div className="job-meta">
                {job.location && <span>📍 {job.location}</span>}
                {job.jobType && <span>💼 {job.jobType}</span>}
                <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>

              <button
                onClick={() => loadApplications(job.id)}
                style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {expandedJob === job.id ? '▲ Hide' : '▼ View'} {t('jobs.applications')}
              </button>

              {expandedJob === job.id && (
                <div style={{ marginTop: '1rem' }}>
                  {!applications[job.id] || applications[job.id].length === 0 ? (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>{t('jobs.noApplications')}</p>
                  ) : (
                    applications[job.id].map((app) => (
                      <div key={app.id} className="application-card">
                        <h4>
                          {app.applicantName || app.applicantEmail}
                          {app.applicantName && (
                            <span style={{ color: '#999', fontWeight: 400, fontSize: '0.85rem' }}>
                              {' '}— {app.applicantEmail}
                            </span>
                          )}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                        {app.resumeUrl && (
                          <p style={{ fontSize: '0.85rem' }}>
                            📎 <a href={app.resumeUrl} target="_blank" rel="noreferrer">View Resume</a>
                          </p>
                        )}
                        {app.resumeFileName && (
                          <p style={{ fontSize: '0.85rem' }}>
                            📎 Resume: {app.resumeFileName}
                          </p>
                        )}
                        {app.coverLetter && (
                          <details style={{ marginTop: '0.5rem' }}>
                            <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#667eea' }}>
                              View Cover Letter
                            </summary>
                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.75rem', background: '#f9f9f9', borderRadius: 6 }}>
                              {app.coverLetter}
                            </p>
                          </details>
                        )}

                        <button
                          onClick={() => handleAIReview(app, job.title)}
                          disabled={reviewingId === app.id}
                          style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                        >
                          {reviewingId === app.id ? `⏳ ${t('jobs.reviewing')}` : `🤖 ${t('jobs.reviewResume')}`}
                        </button>

                        {aiReviews[app.id] && (
                          <div className="ai-review-box">
                            <h5>🤖 {t('jobs.aiReview')}</h5>
                            {aiReviews[app.id]}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ManageJobs;
