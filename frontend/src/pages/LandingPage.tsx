import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1>🎯 {t('landing.title')}</h1>
        <p>{t('landing.subtitle')}</p>
      </div>

      <div style={{ position: 'absolute', top: '1.5rem', right: '2rem' }}>
        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          style={{
            padding: '0.4rem 0.7rem',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <option value="en" style={{ background: '#764ba2' }}>EN</option>
          <option value="hi" style={{ background: '#764ba2' }}>हिं</option>
          <option value="bn" style={{ background: '#764ba2' }}>বাং</option>
        </select>
      </div>

      <div className="landing-cards">
        <div className="landing-card">
          <div className="card-icon">🏢</div>
          <h3>{t('landing.recruiter')}</h3>
          <p>{t('landing.recruiterDesc')}</p>
          <div className="card-links">
            <Link to="/recruiter/signup" className="primary">{t('auth.signUp')}</Link>
            <Link to="/recruiter/login" className="secondary">{t('auth.login')}</Link>
          </div>
        </div>

        <div className="landing-card">
          <div className="card-icon">💼</div>
          <h3>{t('landing.applicant')}</h3>
          <p>{t('landing.applicantDesc')}</p>
          <div className="card-links">
            <Link to="/applicant/signup" className="primary">{t('auth.signUp')}</Link>
            <Link to="/applicant/login" className="secondary">{t('auth.login')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
