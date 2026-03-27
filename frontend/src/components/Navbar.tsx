import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  role: 'recruiter' | 'applicant';
  profileCompleted?: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, profileCompleted, onLogout }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={role === 'recruiter' ? '/recruiter/home' : '/applicant/home'} style={{ color: 'white', textDecoration: 'none' }}>
          🎯 Higher
        </Link>
      </div>

      <div className="navbar-menu">
        {profileCompleted && (
          <>
            <Link to={`/${role}/home`}>{t('nav.home')}</Link>
            <Link to={`/${role}/profile`}>{t('nav.profile')}</Link>
            {role === 'recruiter' && (
              <>
                <Link to="/recruiter/post-job">{t('nav.postJob')}</Link>
                <Link to="/recruiter/manage-jobs">{t('nav.manageJobs')}</Link>
              </>
            )}
            {role === 'applicant' && (
              <Link to="/applicant/resume-builder">{t('nav.resumeBuilder')}</Link>
            )}
          </>
        )}
        {!profileCompleted && (
          <Link to={`/${role}/profile`}>{t('nav.profile')}</Link>
        )}

        <select
          value={i18n.language}
          onChange={handleLanguageChange}
          aria-label={t('nav.language')}
          title={t('nav.language')}
        >
          <option value="en">EN</option>
          <option value="hi">हिं</option>
          <option value="bn">বাং</option>
        </select>

        <button onClick={handleLogout} className="logout-btn">
          {t('nav.logout')}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
