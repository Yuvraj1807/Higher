import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';

interface ApplyJobProps {
  onLogout: () => void;
}

const ApplyJob: React.FC<ApplyJobProps> = ({ onLogout }) => {
  const { jobId } = useParams();
  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    coverLetter: '',
    resumeUrl: '',
    resumeFile: null as File | null
  });
  const [uploadMethod, setUploadMethod] = useState('url');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      if (jobId) {
        const docSnap = await getDoc(doc(db, 'jobs', jobId));
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
        }
      }
    } catch (error) {
      console.error('Error loading job:', error);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, resumeFile: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (auth.currentUser && jobId) {
        let resumeData = '';

        if (uploadMethod === 'file' && formData.resumeFile) {
          const reader = new FileReader();
          reader.onloadend = async () => {
            resumeData = reader.result as string;
            await submitApplication(resumeData);
          };
          reader.readAsDataURL(formData.resumeFile);
        } else {
          resumeData = formData.resumeUrl;
          await submitApplication(resumeData);
        }
      }
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
      setSubmitting(false);
    }
  };

  const submitApplication = async (resumeData: string) => {
    try {
      if (auth.currentUser && jobId) {
        await addDoc(collection(db, 'applications'), {
          jobId: jobId,
          applicantId: auth.currentUser.uid,
          applicantEmail: auth.currentUser.email,
          coverLetter: formData.coverLetter,
          resume: resumeData,
          appliedAt: new Date(),
          status: 'pending'
        });
        setMessage('✅ ' + t('application_submitted'));
        setTimeout(() => {
          navigate('/applicant/home');
        }, 1500);
      }
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar onLogout={onLogout} role="applicant" currentPage="/applicant/home" />
        <div className="profile-container">Loading job...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <Navbar onLogout={onLogout} role="applicant" currentPage="/applicant/home" />
        <div className="profile-container">
          <h2>Job not found</h2>
          <button onClick={() => navigate('/applicant/home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar onLogout={onLogout} role="applicant" currentPage="/applicant/home" />

      <div className="profile-container">
        <h2>{t('apply')} for {job.title}</h2>

        <div className="job-card" style={{ marginBottom: '2rem' }}>
          <h3>{job.title}</h3>
          <p><strong>{t('location')}:</strong> {job.location}</p>
          <p><strong>{t('job_type')}:</strong> {job.jobType}</p>
          <p><strong>{t('salary')}:</strong> {job.salary}</p>
          <p><strong>{t('job_description')}:</strong></p>
          <p>{job.description}</p>
          <p><strong>{t('requirements')}:</strong></p>
          <p>{job.requirements}</p>
        </div>

        {message && (
          <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label><strong>{t('cover_letter')}</strong></label>
          <textarea
            name="coverLetter"
            placeholder="Write your cover letter here..."
            value={formData.coverLetter}
            onChange={handleChange}
            required
          />

          <label><strong>Upload Resume:</strong></label>
          <div className="tabs" style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className={`tab-button ${uploadMethod === 'url' ? 'active' : ''}`}
              onClick={() => setUploadMethod('url')}
            >
              📎 {t('resume_url')}
            </button>
            <button
              type="button"
              className={`tab-button ${uploadMethod === 'file' ? 'active' : ''}`}
              onClick={() => setUploadMethod('file')}
            >
              📁 {t('upload_file')}
            </button>
          </div>

          {uploadMethod === 'url' ? (
            <input
              type="text"
              name="resumeUrl"
              placeholder="Resume URL"
              value={formData.resumeUrl}
              onChange={handleChange}
              required
            />
          ) : (
            <input
              type="file"
              name="resumeFile"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              required
            />
          )}

          <div className="button-group">
            <button type="submit" disabled={submitting}>
              {submitting ? '⏳ Submitting...' : '✅ ' + t('submit_application')}
            </button>
            <button type="button" onClick={() => navigate('/applicant/home')}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyJob;