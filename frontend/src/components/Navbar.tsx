import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Navbar.css';

interface NavbarProps {
  onLogout: () => void;
  role: 'recruiter' | 'applicant';
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, role, currentPage }) => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const recruiterLinks = [
    { label: t('home'), path: '/recruiter/home' },
    { label: t('profile'), path: '/recruiter/profile' },
    { label: t('post_job'), path: '/recruiter/post-job' },
    { label: t('manage_jobs'), path: '/recruiter/manage-jobs' }
  ];

  const applicantLinks = [
    { label: t('home'), path: '/applicant/home' },
    { label: t('profile'), path: '/applicant/profile' },
    { label: t('resume_builder'), path: '/applicant/resume-builder' }
  ];

  const links = role === 'recruiter' ? recruiterLinks : applicantLinks;

  return (
    <nav className="navbar">
      <div className="navbar-brand">🚀 Higher</div>

      <div className="navbar-menu">
        {links.map(link => (
          <a
            key={link.path}
            onClick={() => navigate(link.path)}
            className={currentPage === link.path ? 'active' : ''}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="navbar-right">
        <select 
          value={i18n.language} 
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="language-selector"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="bn">বাংলা</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
          <option value="mr">मराठी</option>
          <option value="gu">ગુજરાતી</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>
        <button onClick={handleLogout} className="logout-btn">
          {t('logout')}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;