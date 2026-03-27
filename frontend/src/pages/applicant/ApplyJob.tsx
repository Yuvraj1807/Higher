import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../config/firebase';
import Navbar from '../../components/Navbar';

interface Props {
  onLogout: () => void;
}

interface Job {
  title: string;
  description: string;
  location?: string;
  jobType?: string;
}

const ApplyJob: React.FC<Props> = ({ onLogout }) => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [resumeMode, setResumeMode] = useState<'url' | 'file'>('url');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) return;
      try {
        const snap = await getDoc(doc(db, 'jobs', jobId));
        if (snap.exists()) setJob(snap.data() as Job);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeMode === 'url' && !resumeUrl.trim()) {
      setError('Please provide a resume URL or upload a file');
      return;
    }
    if (resumeMode === 'file' && !resumeFile) {
      setError('Please upload a resume file');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Get applicant profile name
      let applicantName = auth.currentUser!.email;
      const profileSnap = await getDoc(doc(db, 'applicantProfiles', auth.currentUser!.uid));
      if (profileSnap.exists()) {
        applicantName = profileSnap.data().fullName || applicantName;
      }

      const applicationData: Record<string, any> = {
        jobId,
        applicantId: auth.currentUser!.uid,
        applicantEmail: auth.currentUser!.email,
        applicantName,
        coverLetter,
        appliedAt: new Date().toISOString(),
      };

      if (resumeMode === 'url') {
        applicationData.resumeUrl = resumeUrl;
      } else if (resumeFile) {
        // Store file name (actual upload would require Firebase Storage)
        applicationData.resumeFileName = resumeFile.name;
        applicationData.resumeUrl = `[File upload: ${resumeFile.name}]`;
      }

      await addDoc(collection(db, 'applications'), applicationData);
      setSuccess('Application submitted successfully! 🎉');
      setTimeout(() => navigate('/applicant/home'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar role="applicant" profileCompleted={true} onLogout={onLogout} />
        <div className="auth-container"><p>{t('common.loading')}</p></div>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Navbar role="applicant" profileCompleted={true} onLogout={onLogout} />
        <div className="auth-container"><p>Job not found.</p></div>
      </>
    );
  }

  return (
    <>
      <Navbar role="applicant" profileCompleted={true} onLogout={onLogout} />
      <div className="auth-container" style={{ maxWidth: 680 }}>
        <h2>📝 {t('applicant.applyJob')}</h2>

        <div className="job-card" style={{ marginBottom: '1.5rem' }}>
          <h3>{job.title}</h3>
          <div className="job-meta">
            {job.location && <span>📍 {job.location}</span>}
            {job.jobType && <span>💼 {job.jobType}</span>}
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>{job.description}</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Resume mode toggle */}
          <label>Resume</label>
          <div className="resume-toggle">
            <button
              type="button"
              className={resumeMode === 'url' ? 'active' : 'inactive'}
              onClick={() => setResumeMode('url')}
            >
              🔗 URL / Link
            </button>
            <button
              type="button"
              className={resumeMode === 'file' ? 'active' : 'inactive'}
              onClick={() => setResumeMode('file')}
            >
              📄 Upload File
            </button>
          </div>

          {resumeMode === 'url' ? (
            <input
              type="url"
              placeholder={t('applicant.resumeUrl')}
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
            />
          ) : (
            <>
              <label
                className="file-upload-label"
                onClick={() => fileInputRef.current?.click()}
              >
                {resumeFile ? `✅ ${resumeFile.name}` : `📎 ${t('applicant.uploadResume')}`}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {resumeFile && <p className="file-name">{resumeFile.name}</p>}
            </>
          )}

          <label>{t('applicant.coverLetter')}</label>
          <textarea
            placeholder={t('applicant.coverLetter')}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={5}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? t('applicant.applying') : t('applicant.submit')}
          </button>
        </form>
      </div>
    </>
  );
};

export default ApplyJob;
