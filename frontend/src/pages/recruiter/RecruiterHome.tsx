import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../config/firebase';
import Navbar from '../../components/Navbar';

interface Props {
  onLogout: () => void;
}

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: 'AI Revolutionizes Recruitment: What Recruiters Need to Know',
    description: 'Artificial intelligence is transforming how companies find and hire talent.',
    url: 'https://www.shrm.org',
    source: 'SHRM',
  },
  {
    title: 'Remote Work Trends 2024: Hybrid Model Becomes Standard',
    description: 'Most organizations are adopting hybrid work policies as the new normal.',
    url: 'https://www.forbes.com',
    source: 'Forbes',
  },
  {
    title: 'Top Skills Employers Are Looking for in 2024',
    description: 'Data literacy, AI tools and communication top the list of in-demand skills.',
    url: 'https://www.linkedin.com/pulse',
    source: 'LinkedIn',
  },
  {
    title: 'How to Write Job Descriptions That Attract Top Talent',
    description: 'Inclusive, clear job descriptions improve applicant quality significantly.',
    url: 'https://www.glassdoor.com',
    source: 'Glassdoor',
  },
];

const RecruiterHome: React.FC<Props> = ({ onLogout }) => {
  const [jobCount, setJobCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [news] = useState<NewsItem[]>(FALLBACK_NEWS);
  const { t } = useTranslation();

  useEffect(() => {
    const loadStats = async () => {
      if (!auth.currentUser) return;
      try {
        const jobsSnap = await getDocs(
          query(collection(db, 'jobs'), where('recruiterId', '==', auth.currentUser.uid)),
        );
        setJobCount(jobsSnap.size);

        let appCount = 0;
        for (const jobDoc of jobsSnap.docs) {
          const appsSnap = await getDocs(
            query(collection(db, 'applications'), where('jobId', '==', jobDoc.id)),
          );
          appCount += appsSnap.size;
        }
        setApplicationCount(appCount);
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, []);

  return (
    <>
      <Navbar role="recruiter" profileCompleted={true} onLogout={onLogout} />

      <div className="jobs-container">
        <h2 className="page-title">👋 {t('recruiter.home')}</h2>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="job-card" style={{ flex: 1, minWidth: 140, borderColor: '#667eea' }}>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{jobCount}</h3>
            <p>{t('recruiter.jobsPosted')}</p>
            <Link to="/recruiter/post-job" style={{ fontSize: '0.85rem' }}>
              + {t('recruiter.postJob')}
            </Link>
          </div>
          <div className="job-card" style={{ flex: 1, minWidth: 140, borderColor: '#764ba2' }}>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{applicationCount}</h3>
            <p>{t('recruiter.applicationsReceived')}</p>
            <Link to="/recruiter/manage-jobs" style={{ fontSize: '0.85rem' }}>
              {t('nav.manageJobs')}
            </Link>
          </div>
        </div>

        {/* News Feed */}
        <div className="news-section" style={{ margin: 0, padding: 0 }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>📰 {t('recruiter.news')}</h3>
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
      </div>
    </>
  );
};

export default RecruiterHome;
