import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import { auth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Pages
import LandingPage from './pages/LandingPage';
import RecruiterSignup from './pages/recruiter/RecruiterSignup';
import RecruiterLogin from './pages/recruiter/RecruiterLogin';
import RecruiterHome from './pages/recruiter/RecruiterHome';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';
import PostJob from './pages/recruiter/PostJob';
import ManageJobs from './pages/recruiter/ManageJobs';

import ApplicantSignup from './pages/applicant/ApplicantSignup';
import ApplicantLogin from './pages/applicant/ApplicantLogin';
import ApplicantHome from './pages/applicant/ApplicantHome';
import ApplicantProfile from './pages/applicant/ApplicantProfile';
import ApplyJob from './pages/applicant/ApplyJob';
import ResumeBuilder from './pages/applicant/ResumeBuilder';

import './App.css';

interface UserState {
  uid: string | null;
  role: 'recruiter' | 'applicant' | null;
  profileCompleted: boolean;
}

function App() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<UserState>({
    uid: null,
    role: null,
    profileCompleted: false
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              role: data.role || null,
              profileCompleted: data.profileCompleted === true
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              role: null,
              profileCompleted: false
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            uid: firebaseUser.uid,
            role: null,
            profileCompleted: false
          });
        }
      } else {
        setUser({
          uid: null,
          role: null,
          profileCompleted: false
        });
      }
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser({
        uid: null,
        role: null,
        profileCompleted: false
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Recruiter Auth Routes */}
        <Route path="/recruiter/signup" element={<RecruiterSignup />} />
        <Route path="/recruiter/login" element={<RecruiterLogin />} />

        {/* Recruiter Profile Route - Only accessible if logged in */}
        <Route
          path="/recruiter/profile"
          element={
            user.uid && user.role === 'recruiter' ? (
              <RecruiterProfile onLogout={handleLogout} />
            ) : (
              <Navigate to="/recruiter/login" replace />
            )
          }
        />

        {/* Recruiter Protected Routes - Only after profile completion */}
        <Route
          path="/recruiter/home"
          element={
            user.uid && user.role === 'recruiter' && user.profileCompleted ? (
              <RecruiterHome onLogout={handleLogout} />
            ) : user.uid && user.role === 'recruiter' ? (
              <Navigate to="/recruiter/profile" replace />
            ) : (
              <Navigate to="/recruiter/login" replace />
            )
          }
        />

        <Route
          path="/recruiter/post-job"
          element={
            user.uid && user.role === 'recruiter' && user.profileCompleted ? (
              <PostJob onLogout={handleLogout} />
            ) : user.uid && user.role === 'recruiter' ? (
              <Navigate to="/recruiter/profile" replace />
            ) : (
              <Navigate to="/recruiter/login" replace />
            )
          }
        />

        <Route
          path="/recruiter/manage-jobs"
          element={
            user.uid && user.role === 'recruiter' && user.profileCompleted ? (
              <ManageJobs onLogout={handleLogout} />
            ) : user.uid && user.role === 'recruiter' ? (
              <Navigate to="/recruiter/profile" replace />
            ) : (
              <Navigate to="/recruiter/login" replace />
            )
          }
        />

        {/* Applicant Auth Routes */}
        <Route path="/applicant/signup" element={<ApplicantSignup />} />
        <Route path="/applicant/login" element={<ApplicantLogin />} />

        {/* Applicant Profile Route - Only accessible if logged in */}
        <Route
          path="/applicant/profile"
          element={
            user.uid && user.role === 'applicant' ? (
              <ApplicantProfile onLogout={handleLogout} />
            ) : (
              <Navigate to="/applicant/login" replace />
            )
          }
        />

        {/* Applicant Protected Routes - Only after profile completion */}
        <Route
          path="/applicant/home"
          element={
            user.uid && user.role === 'applicant' && user.profileCompleted ? (
              <ApplicantHome onLogout={handleLogout} />
            ) : user.uid && user.role === 'applicant' ? (
              <Navigate to="/applicant/profile" replace />
            ) : (
              <Navigate to="/applicant/login" replace />
            )
          }
        />

        <Route
          path="/applicant/apply/:jobId"
          element={
            user.uid && user.role === 'applicant' && user.profileCompleted ? (
              <ApplyJob onLogout={handleLogout} />
            ) : user.uid && user.role === 'applicant' ? (
              <Navigate to="/applicant/profile" replace />
            ) : (
              <Navigate to="/applicant/login" replace />
            )
          }
        />

        <Route
          path="/applicant/resume-builder"
          element={
            user.uid && user.role === 'applicant' && user.profileCompleted ? (
              <ResumeBuilder onLogout={handleLogout} />
            ) : user.uid && user.role === 'applicant' ? (
              <Navigate to="/applicant/profile" replace />
            ) : (
              <Navigate to="/applicant/login" replace />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;