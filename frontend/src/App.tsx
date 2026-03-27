import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { type User } from 'firebase/auth';
import './i18n/config';
import { auth, db } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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

interface UserData {
  role?: string;
  profileCompleted?: boolean;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setUserData(userDoc.data() as UserData);
            }
          } catch {
            // ignore fetch error
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      });
    } catch {
      // Firebase not configured – allow UI to render anyway
      setLoading(false);
    }
    return () => unsubscribe?.();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  const isRecruiter = userData?.role === 'recruiter';
  const isApplicant = userData?.role === 'applicant';
  const recruiterProfileDone = isRecruiter && userData?.profileCompleted === true;
  const applicantProfileDone = isApplicant && userData?.profileCompleted === true;

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Recruiter Auth */}
        <Route
          path="/recruiter/signup"
          element={!currentUser ? <RecruiterSignup /> : <Navigate to="/recruiter/profile" />}
        />
        <Route
          path="/recruiter/login"
          element={
            !currentUser ? (
              <RecruiterLogin />
            ) : (
              <Navigate to={recruiterProfileDone ? '/recruiter/home' : '/recruiter/profile'} />
            )
          }
        />

        {/* Recruiter Protected Routes */}
        <Route
          path="/recruiter/profile"
          element={
            currentUser ? (
              <RecruiterProfile onLogout={handleLogout} onProfileSaved={refreshUserData} />
            ) : (
              <Navigate to="/recruiter/login" />
            )
          }
        />
        <Route
          path="/recruiter/home"
          element={
            currentUser ? (
              recruiterProfileDone ? (
                <RecruiterHome onLogout={handleLogout} />
              ) : (
                <Navigate to="/recruiter/profile" />
              )
            ) : (
              <Navigate to="/recruiter/login" />
            )
          }
        />
        <Route
          path="/recruiter/post-job"
          element={
            currentUser ? (
              recruiterProfileDone ? (
                <PostJob onLogout={handleLogout} />
              ) : (
                <Navigate to="/recruiter/profile" />
              )
            ) : (
              <Navigate to="/recruiter/login" />
            )
          }
        />
        <Route
          path="/recruiter/manage-jobs"
          element={
            currentUser ? (
              recruiterProfileDone ? (
                <ManageJobs onLogout={handleLogout} />
              ) : (
                <Navigate to="/recruiter/profile" />
              )
            ) : (
              <Navigate to="/recruiter/login" />
            )
          }
        />

        {/* Applicant Auth */}
        <Route
          path="/applicant/signup"
          element={!currentUser ? <ApplicantSignup /> : <Navigate to="/applicant/profile" />}
        />
        <Route
          path="/applicant/login"
          element={
            !currentUser ? (
              <ApplicantLogin />
            ) : (
              <Navigate to={applicantProfileDone ? '/applicant/home' : '/applicant/profile'} />
            )
          }
        />

        {/* Applicant Protected Routes */}
        <Route
          path="/applicant/profile"
          element={
            currentUser ? (
              <ApplicantProfile onLogout={handleLogout} onProfileSaved={refreshUserData} />
            ) : (
              <Navigate to="/applicant/login" />
            )
          }
        />
        <Route
          path="/applicant/home"
          element={
            currentUser ? (
              applicantProfileDone ? (
                <ApplicantHome onLogout={handleLogout} />
              ) : (
                <Navigate to="/applicant/profile" />
              )
            ) : (
              <Navigate to="/applicant/login" />
            )
          }
        />
        <Route
          path="/applicant/apply/:jobId"
          element={
            currentUser ? (
              applicantProfileDone ? (
                <ApplyJob onLogout={handleLogout} />
              ) : (
                <Navigate to="/applicant/profile" />
              )
            ) : (
              <Navigate to="/applicant/login" />
            )
          }
        />
        <Route
          path="/applicant/resume-builder"
          element={
            currentUser ? (
              applicantProfileDone ? (
                <ResumeBuilder onLogout={handleLogout} />
              ) : (
                <Navigate to="/applicant/profile" />
              )
            ) : (
              <Navigate to="/applicant/login" />
            )
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
