import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../config/firebase';

const ApplicantSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const saveUserDoc = async (uid: string, emailAddr: string, displayName?: string | null) => {
    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        email: emailAddr,
        displayName: displayName || '',
        role: 'applicant',
        createdAt: new Date().toISOString(),
        profileCompleted: false,
      },
      { merge: true },
    );
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserDoc(cred.user.uid, email);
      navigate('/applicant/profile', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await saveUserDoc(result.user.uid, result.user.email!, result.user.displayName);
      navigate('/applicant/profile', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
      await saveUserDoc(result.user.uid, result.user.email!, result.user.displayName);
      navigate('/applicant/profile', { replace: true });
    } catch (err: any) {
      setError(err.message || 'GitHub signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>💼 {t('applicant.signup')}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleEmailSignup}>
        <input
          type="email"
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('auth.minPassword')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? t('auth.signingUp') : t('auth.signUp')}
        </button>
      </form>

      <div className="oauth-divider">{t('auth.orSignUpWith')}</div>

      <div className="button-group">
        <button className="btn-google" onClick={handleGoogleSignup} disabled={loading}>
          🔍 {t('auth.google')}
        </button>
        <button className="btn-github" onClick={handleGithubSignup} disabled={loading}>
          🐙 {t('auth.github')}
        </button>
      </div>

      <p className="auth-footer">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/applicant/login">{t('auth.loginHere')}</Link>
      </p>
    </div>
  );
};

export default ApplicantSignup;
