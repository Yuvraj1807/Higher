import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../../components/Navbar';

interface ApplicantHomeProps {
  onLogout: () => void;
}

const ApplicantHome: React.FC<ApplicantHomeProps> = ({ onLogout }) => {
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [nearbyJobs, setNearbyJobs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkillLevel, setUserSkillLevel] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [notInterestedJobs, setNotInterestedJobs] = useState<Set<string>>(new Set());
  const [searchRadius, setSearchRadius] = useState(50);
  const [viewMode, setViewMode] = useState<'all' | 'nearby'>('all');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (userLocation && userSkillLevel === 'unskilled') {
      filterNearbyJobs();
    }
  }, [searchRadius, allJobs, userLocation]);

  const loadData = async () => {
    try {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserSkillLevel(data.skillLevel || '');
          setUserLocation(data.location || '');
        }
      }

      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobsList: any[] = [];
      jobsSnapshot.forEach((doc) => {
        jobsList.push({ id: doc.id, ...doc.data() });
      });
      setAllJobs(jobsList);

      const newsResponse = await axios.get('http://localhost:5000/api/news');
      setNews(newsResponse.data.news || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const filterNearbyJobs = () => {
    if (!userLocation) return;

    const nearby = allJobs.filter(job => {
      const jobLoc = job.location?.toLowerCase() || '';
      const userLoc = userLocation.toLowerCase();
      const cityMatch = jobLoc.includes(userLoc.split(',')[0]) || 
                        userLoc.includes(jobLoc.split(',')[0]);
      return cityMatch;
    });

    setNearbyJobs(nearby);
  };

  const handleApplyJob = (jobId: string) => {
    navigate(`/applicant/apply/${jobId}`);
  };

  const handleNotInterested = (jobId: string) => {
    setNotInterestedJobs(prev => new Set([...prev, jobId]));
  };

  const displayJobs = viewMode === 'nearby' ? nearbyJobs : allJobs;
  const filteredJobs = displayJobs.filter(job => !notInterestedJobs.has(job.id));

  return (
    <div>
      <Navbar onLogout={onLogout} role="applicant" currentPage="/applicant/home" />

      <div className="home-container">
        <h2>🎯 {t('welcome')} to Higher</h2>

        {/* Location-based search for unskilled workers */}
        {userSkillLevel === 'unskilled' && userLocation && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '15px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: 'white', marginTop: 0 }}>📍 Jobs Near You</h3>
            <p>Showing jobs near: <strong>{userLocation}</strong></p>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Found <strong>{nearbyJobs.length}</strong> jobs in your area</p>

            <label style={{ color: 'white', marginBottom: '0.5rem', display: 'block' }}>
              <strong>Search Radius: {searchRadius} km</strong>
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '1rem' }}
            />

            <div className="tabs" style={{ borderBottom: '2px solid rgba(255,255,255,0.3)', marginBottom: '0' }}>
              <button
                className={`tab-button ${viewMode === 'nearby' ? 'active' : ''}`}
                onClick={() => setViewMode('nearby')}
                style={{ color: viewMode === 'nearby' ? 'white' : 'rgba(255,255,255,0.7)' }}
              >
                📍 Jobs Near Me ({nearbyJobs.length})
              </button>
              <button
                className={`tab-button ${viewMode === 'all' ? 'active' : ''}`}
                onClick={() => setViewMode('all')}
                style={{ color: viewMode === 'all' ? 'white' : 'rgba(255,255,255,0.7)' }}
              >
                🌍 All Jobs ({allJobs.length})
              </button>
            </div>
          </div>
        )}

        <h3>📋 {t('available_jobs')} ({filteredJobs.length})</h3>
        {loading ? (
          <p>Loading jobs...</p>
        ) : filteredJobs.length > 0 ? (
          <div className="jobs-container">
            {filteredJobs.map((job: any) => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p><strong>📍 {t('location')}:</strong> {job.location}</p>
                <p><strong>💼 {t('job_type')}:</strong> {job.jobType}</p>
                <p><strong>💰 {t('salary')}:</strong> {job.salary}</p>
                <p>{job.description.substring(0, 150)}...</p>
                <div className="button-group">
                  <button onClick={() => handleApplyJob(job.id)}>✅ {t('apply_now')}</button>
                  <button 
                    onClick={() => handleNotInterested(job.id)}
                    style={{ background: '#999' }}
                  >
                    ❌ {t('not_interested')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>{t('no_jobs')}</p>
        )}

        <h3>📰 {t('news_updates')}</h3>
        {news.length > 0 ? (
          <div className="news-feed">
            {news.map((item: any, index: number) => (
              <div key={index} className="news-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  Read more →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p>No news available</p>
        )}
      </div>
    </div>
  );
};

export default ApplicantHome;