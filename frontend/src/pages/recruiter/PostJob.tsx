import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';

interface PostJobProps {
  onLogout: () => void;
}

const PostJob: React.FC<PostJobProps> = ({ onLogout }) => {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    jobType: 'Full-time'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (auth.currentUser) {
        await addDoc(collection(db, 'jobs'), {
          ...jobData,
          recruiterId: auth.currentUser.uid,
          createdAt: new Date(),
          applicants: []
        });
        setMessage('✅ ' + t('job_posted'));
        setJobData({
          title: '',
          description: '',
          requirements: '',
          salary: '',
          location: '',
          jobType: 'Full-time'
        });
        setTimeout(() => {
          navigate('/recruiter/manage-jobs');
        }, 1500);
      }
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar onLogout={onLogout} role="recruiter" currentPage="/recruiter/post-job" />

      <div className="job-form-container">
        <h2>📝 {t('post_job')}</h2>
        
        {message && (
          <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label><strong>{t('job_title')} *</strong></label>
          <input
            type="text"
            name="title"
            placeholder="e.g., Senior React Developer"
            value={jobData.title}
            onChange={handleChange}
            required
          />

          <label><strong>{t('job_description')} *</strong></label>
          <textarea
            name="description"
            placeholder="Describe the job role and responsibilities..."
            value={jobData.description}
            onChange={handleChange}
            required
          />

          <label><strong>{t('requirements')} *</strong></label>
          <textarea
            name="requirements"
            placeholder="What skills and experience are required?"
            value={jobData.requirements}
            onChange={handleChange}
            required
          />

          <label><strong>{t('salary')}</strong></label>
          <input
            type="text"
            name="salary"
            placeholder="e.g., $50k-$70k per year"
            value={jobData.salary}
            onChange={handleChange}
          />

          <label><strong>{t('location')} *</strong></label>
          <input
            type="text"
            name="location"
            placeholder="Job location"
            value={jobData.location}
            onChange={handleChange}
            required
          />

          <label><strong>{t('job_type')}</strong></label>
          <select name="jobType" value={jobData.jobType} onChange={handleChange}>
            <option value="Full-time">{t('full_time')}</option>
            <option value="Part-time">{t('part_time')}</option>
            <option value="Contract">{t('contract')}</option>
            <option value="Remote">{t('remote')}</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? '⏳ Posting...' : '📤 ' + t('post_job_btn')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;