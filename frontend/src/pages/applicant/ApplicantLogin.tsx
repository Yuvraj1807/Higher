import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '../../config/firebase';

const ApplicantLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/applicant/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate('/applicant/home');
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
      navigate('/applicant/home');
    } catch (err: any) {
      setError(err.message || 'GitHub login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>💼 {t('applicant.login')}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </button>
      </form>

      <div className="oauth-divider">{t('auth.orLoginWith')}</div>

      <div className="button-group">
        <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
          🔍 {t('auth.google')}
        </button>
        <button className="btn-github" onClick={handleGithubLogin} disabled={loading}>
          🐙 {t('auth.github')}
        </button>
      </div>

      <p className="auth-footer">
        {t('auth.dontHaveAccount')}{' '}
        <Link to="/applicant/signup">{t('auth.signUpHere')}</Link>
      </p>
    </div>
  );
};

export default ApplicantLogin;
