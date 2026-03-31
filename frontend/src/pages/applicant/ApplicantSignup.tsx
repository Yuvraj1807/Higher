import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const ApplicantSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const userData = {
        uid: userCredential.user.uid,
        email: email,
        role: 'applicant',
        createdAt: new Date().toISOString(),
        profileCompleted: false
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      navigate('/applicant/profile', { replace: true });
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        role: 'applicant',
        createdAt: new Date().toISOString(),
        profileCompleted: false
      };

      await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
      navigate('/applicant/profile', { replace: true });
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError(error.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        role: 'applicant',
        createdAt: new Date().toISOString(),
        profileCompleted: false
      };

      await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
      navigate('/applicant/profile', { replace: true });
    } catch (error: any) {
      console.error('GitHub signup error:', error);
      setError(error.message || 'GitHub signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Applicant Sign Up</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleEmailSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up with Email'}
        </button>
      </form>

      <div style={{ margin: '1.5rem 0', textAlign: 'center', color: '#999' }}>OR</div>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
        <button onClick={handleGoogleSignup} disabled={loading} className="oauth-btn google-btn">
          {loading ? 'Signing up...' : '🔵 Sign Up with Google'}
        </button>
        <button onClick={handleGitHubSignup} disabled={loading} className="oauth-btn github-btn">
          {loading ? 'Signing up...' : '⚫ Sign Up with GitHub'}
        </button>
      </div>

      <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        Already have an account? <Link to="/applicant/login">Login here</Link>
      </p>
    </div>
  );
};

export default ApplicantSignup;