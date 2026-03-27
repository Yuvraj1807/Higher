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

const RecruiterProfile: React.FC<Props> = ({ onLogout, onProfileSaved }) => {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [employees, setEmployees] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
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
        const snap = await getDoc(doc(db, 'recruiterProfiles', auth.currentUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          setCompanyName(d.companyName || '');
          setIndustry(d.industry || '');
          setEmployees(d.employees || '');
          setWebsite(d.website || '');
          setLocation(d.location || '');
          setDescription(d.description || '');
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
    if (!companyName.trim()) {
      setError(t('recruiter.companyName') + ' is required');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const uid = auth.currentUser!.uid;
      await setDoc(doc(db, 'recruiterProfiles', uid), {
        uid,
        companyName,
        industry,
        employees,
        website,
        location,
        description,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'users', uid), { profileCompleted: true }, { merge: true });
      await onProfileSaved();
      setProfileCompleted(true);
      setSuccess(t('recruiter.profileSaved'));
      setTimeout(() => navigate('/recruiter/home'), 1200);
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar role="recruiter" profileCompleted={profileCompleted} onLogout={onLogout} />
        <div className="profile-container"><p>{t('common.loading')}</p></div>
      </>
    );
  }

  return (
    <>
      <Navbar role="recruiter" profileCompleted={profileCompleted} onLogout={onLogout} />
      <div className="profile-container">
        <h2>🏢 {t('recruiter.profile')}</h2>

        {!profileCompleted && (
          <div className="profile-notice">
            ⚠️ {t('recruiter.completeProfileFirst')} to access all features.
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSave}>
          <label>{t('recruiter.companyName')} *</label>
          <input
            type="text"
            placeholder={t('recruiter.companyName')}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <label>{t('recruiter.industry')}</label>
          <input
            type="text"
            placeholder={t('recruiter.industry')}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />

          <label>{t('recruiter.employees')}</label>
          <input
            type="number"
            placeholder={t('recruiter.employees')}
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
          />

          <label>{t('recruiter.website')}</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <label>{t('recruiter.location')}</label>
          <input
            type="text"
            placeholder={t('recruiter.location')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <label>{t('recruiter.description')}</label>
          <textarea
            placeholder={t('recruiter.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? t('common.loading') : t('recruiter.saveProfile')}
          </button>
        </form>
      </div>
    </>
  );
};

export default RecruiterProfile;
