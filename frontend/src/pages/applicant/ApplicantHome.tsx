import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../../config/firebase';
import Navbar from '../../components/Navbar';

interface Props {
  onLogout: () => void;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location?: string;
  salary?: string;
  jobType?: string;
  recruiterEmail?: string;
  createdAt: string;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: 'How to Ace Your Next Technical Interview',
    description: 'Expert tips on data structures, algorithms, and soft skills for interviews.',
    url: 'https://www.geeksforgeeks.org',
    source: 'GeeksforGeeks',
  },
  {
    title: 'Top 10 In-Demand Tech Skills for 2024',
    description: 'Cloud computing, AI/ML, and DevOps top the list of skills employers want.',
    url: 'https://www.coursera.org',
    source: 'Coursera',
  },
  {
    title: 'Writing a Resume That Gets Noticed',
    description: 'How to tailor your resume for ATS systems and human recruiters.',
    url: 'https://www.indeed.com',
    source: 'Indeed',
  },
  {
    title: 'Salary Negotiation Tips for Fresh Graduates',
    description: 'How to negotiate your first salary and benefits package confidently.',
    url: 'https://www.naukri.com',
    source: 'Naukri',
  },
];

const ApplicantHome: React.FC<Props> = ({ onLogout }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skippedJobs, setSkippedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'news'>('jobs');
  const [news] = useState<NewsItem[]>(FALLBACK_NEWS);
  const { t } = useTranslation();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const snap = await getDocs(collection(db, 'jobs'));
        const jobsList: Job[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
        setJobs(jobsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();

    // Restore skipped jobs from localStorage
    const saved = localStorage.getItem('skippedJobs');
    if (saved) setSkippedJobs(new Set(JSON.parse(saved)));
  }, []);

  const handleNotInterested = (jobId: string) => {
    const updated = new Set(skippedJobs).add(jobId);
    setSkippedJobs(updated);
    localStorage.setItem('skippedJobs', JSON.stringify([...updated]));
  };

  const visibleJobs = jobs.filter((j) => !skippedJobs.has(j.id));

  return (
    <>
      <Navbar role="applicant" profileCompleted={true} onLogout={onLogout} />

      <div className="jobs-container">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            💼 {t('applicant.home')} ({visibleJobs.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            📰 {t('applicant.news')}
          </button>
        </div>

        {activeTab === 'jobs' && (
          <>
            {loading ? (
              <div className="job-card"><p>{t('common.loading')}</p></div>
            ) : visibleJobs.length === 0 ? (
              <div className="job-card">
                <p>{t('jobs.noJobs')}</p>
                {skippedJobs.size > 0 && (
                  <button
                    onClick={() => {
                      setSkippedJobs(new Set());
                      localStorage.removeItem('skippedJobs');
                    }}
                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              visibleJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <div className="job-meta">
                    {job.location && <span>📍 {job.location}</span>}
                    {job.jobType && <span>💼 {job.jobType}</span>}
                    {job.salary && <span>💰 {job.salary}</span>}
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                    {job.description.length > 150
                      ? job.description.slice(0, 150) + '...'
                      : job.description}
                  </p>
                  <div className="job-actions">
                    <Link to={`/applicant/apply/${job.id}`}>
                      <button style={{ margin: 0 }}>{t('applicant.apply')}</button>
                    </Link>
                    <button
                      className="btn-not-interested"
                      onClick={() => handleNotInterested(job.id)}
                    >
                      ✕ {t('applicant.notInterested')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'news' && (
          <div>
            {news.map((item, i) => (
              <div className="news-card" key={i}>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  Read more → ({item.source})
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ApplicantHome;
