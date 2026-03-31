import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../../components/Navbar';

interface RecruiterHomeProps {
  onLogout: () => void;
}

const RecruiterHome: React.FC<RecruiterHomeProps> = ({ onLogout }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/news');
      setNews(response.data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar onLogout={onLogout} role="recruiter" currentPage="/recruiter/home" />

      <div className="home-container">
        <h2>👋 {t('recruiter_dashboard')}</h2>
        
        <div className="button-group">
          <button onClick={() => navigate('/recruiter/post-job')}>📝 {t('post_new_job')}</button>
          <button onClick={() => navigate('/recruiter/manage-jobs')}>📋 {t('manage_jobs_btn')}</button>
        </div>

        <h3>📰 {t('news_updates')}</h3>
        {loading ? (
          <p>Loading news...</p>
        ) : news.length > 0 ? (
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

export default RecruiterHome;