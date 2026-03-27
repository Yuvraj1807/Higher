import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../config/firebase';
import Navbar from '../../components/Navbar';

interface Props {
  onLogout: () => void;
  onProfileSaved: () => Promise<void>;
}

const ApplicantProfile: React.FC<Props> = ({ onLogout, onProfileSaved }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileCompleted, setProfileCompleted] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'applicantProfiles', auth.currentUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          setFullName(d.fullName || '');
          setPhone(d.phone || '');
          setLocation(d.location || '');
          setSkills(d.skills || '');
          setExperience(d.experience || '');
          setEducation(d.education || '');
          setBio(d.bio || '');
        }
        const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userSnap.exists()) {
          setProfileCompleted(userSnap.data().profileCompleted === true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError(t('applicant.fullName') + ' is required');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const uid = auth.currentUser!.uid;
      await setDoc(doc(db, 'applicantProfiles', uid), {
        uid,
        fullName,
        phone,
        location,
        skills,
        experience,
        education,
        bio,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'users', uid), { profileCompleted: true }, { merge: true });
      await onProfileSaved();
      setProfileCompleted(true);
      setSuccess(t('applicant.profileSaved'));
      setTimeout(() => navigate('/applicant/home'), 1200);
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar role="applicant" profileCompleted={profileCompleted} onLogout={onLogout} />
        <div className="profile-container"><p>{t('common.loading')}</p></div>
      </>
    );
  }

  return (
    <>
      <Navbar role="applicant" profileCompleted={profileCompleted} onLogout={onLogout} />
      <div className="profile-container">
        <h2>💼 {t('applicant.profile')}</h2>

        {!profileCompleted && (
          <div className="profile-notice">
            ⚠️ {t('recruiter.completeProfileFirst')} to access all features.
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSave}>
          <label>{t('applicant.fullName')} *</label>
          <input
            type="text"
            placeholder={t('applicant.fullName')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label>{t('applicant.phone')}</label>
          <input
            type="text"
            placeholder={t('applicant.phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label>{t('applicant.location')}</label>
          <input
            type="text"
            placeholder={t('applicant.location')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <label>{t('applicant.skills')}</label>
          <input
            type="text"
            placeholder="e.g. React, Node.js, Python"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          <label>{t('applicant.experience')}</label>
          <input
            type="number"
            placeholder="0"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />

          <label>{t('applicant.education')}</label>
          <input
            type="text"
            placeholder="e.g. B.Tech Computer Science"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          />

          <label>{t('applicant.bio')}</label>
          <textarea
            placeholder={t('applicant.bio')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? t('common.loading') : t('applicant.saveProfile')}
          </button>
        </form>
      </div>
    </>
  );
};

export default ApplicantProfile;
