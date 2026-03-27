import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../config/firebase';
import Navbar from '../../components/Navbar';

interface Props {
  onLogout: () => void;
}

const PostJob: React.FC<Props> = ({ onLogout }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await addDoc(collection(db, 'jobs'), {
        title,
        description,
        requirements,
        location,
        salary,
        jobType,
        recruiterId: auth.currentUser!.uid,
        recruiterEmail: auth.currentUser!.email,
        createdAt: new Date().toISOString(),
        active: true,
      });
      setSuccess(t('jobs.postedSuccessfully'));
      setTimeout(() => navigate('/recruiter/manage-jobs'), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar role="recruiter" profileCompleted={true} onLogout={onLogout} />
      <div className="job-form-container">
        <h2>📋 {t('recruiter.postJob')}</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <label>{t('jobs.title')} *</label>
          <input
            type="text"
            placeholder={t('jobs.title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>{t('jobs.description')} *</label>
          <textarea
            placeholder={t('jobs.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label>{t('jobs.requirements')}</label>
          <textarea
            placeholder={t('jobs.requirements')}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />

          <label>{t('jobs.location')}</label>
          <input
            type="text"
            placeholder={t('jobs.location')}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <label>{t('jobs.salary')}</label>
          <input
            type="text"
            placeholder="e.g. ₹5–8 LPA"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />

          <label>{t('jobs.type')}</label>
          <select
            className="form-select"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="Full-time">{t('jobs.fullTime')}</option>
            <option value="Part-time">{t('jobs.partTime')}</option>
            <option value="Remote">{t('jobs.remote')}</option>
            <option value="Contract">{t('jobs.contract')}</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? t('jobs.posting') : t('jobs.postJob')}
          </button>
        </form>
      </div>
    </>
  );
};

export default PostJob;
