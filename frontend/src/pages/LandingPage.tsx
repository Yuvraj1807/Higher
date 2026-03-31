import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="landing-container">
      <h1>{t('Higher')}</h1>
      <p>Multilingual AI-Powered Hiring Portal</p>
      
      <div className="landing-options">
        <div className="card" onClick={() => navigate('/recruiter/signup')}>
          <h2>{t('Hire the Talent')}</h2>
          <p>Post jobs and find talented candidates</p>
        </div>
        
        <div className="card" onClick={() => navigate('/applicant/signup')}>
          <h2>{t('Get Hired')}</h2>
          <p>Find your dream job and apply now</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;