import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Navbar from '../../components/Navbar';

interface ManageJobsProps {
  onLogout: () => void;
}

interface Job {
  id: string;
  title: string;
  location: string;
  jobType: string;
  salary: string;
  description: string;
  applicants?: string[];
}

const ManageJobs: React.FC<ManageJobsProps> = ({ onLogout }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadApplications(selectedJobId);
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      if (auth.currentUser) {
        const q = query(collection(db, 'jobs'), where('recruiterId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const jobsList: Job[] = [];
        querySnapshot.forEach((doc) => {
          jobsList.push({ id: doc.id, ...doc.data() } as Job);
        });
        setJobs(jobsList);
        if (jobsList.length > 0) {
          setSelectedJobId(jobsList[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
    setLoadingJobs(false);
  };

  const loadApplications = async (jobId: string) => {
    try {
      const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
      const querySnapshot = await getDocs(q);
      const appsList: any[] = [];
      querySnapshot.forEach((doc) => {
        appsList.push({ id: doc.id, ...doc.data() });
      });
      setApplications(appsList);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleReviewResume = async (application: any) => {
    setAnalyzingResume(true);
    setReviewResult(null);

    try {
      const selectedJob = jobs.find(j => j.id === selectedJobId);
      const response = await axios.post('http://localhost:5000/api/resume/review', {
        resume: application.resume,
        jobDescription: selectedJob?.description || ''
      });
      setReviewResult(JSON.stringify(response.data.review, null, 2));
    } catch (error: any) {
      setReviewResult('❌ Error analyzing resume: ' + (error.response?.data?.error || error.message));
    }
    setAnalyzingResume(false);
  };

  return (
    <div>
      <Navbar onLogout={onLogout} role="recruiter" currentPage="/recruiter/manage-jobs" />

      <div className="manage-jobs-container">
        <h2>📋 {t('manage_jobs_btn')}</h2>
        
        <button onClick={() => navigate('/recruiter/post-job')} style={{ marginBottom: '1.5rem', width: '100%' }}>
          ➕ {t('post_new_job')}
        </button>

        {loadingJobs ? (
          <p>Loading jobs...</p>
        ) : jobs.length > 0 ? (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <label><strong>Select a Job:</strong></label>
              <select 
                value={selectedJobId || ''} 
                onChange={(e) => setSelectedJobId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.location}
                  </option>
                ))}
              </select>
            </div>

            {selectedJobId && (
              <div>
                {applications.length > 0 ? (
                  <div>
                    <h3>Applications ({applications.length})</h3>
                    {applications.map(app => (
                      <div key={app.id} className="job-card">
                        <h4>{app.applicantEmail}</h4>
                        <p><strong>Status:</strong> {app.status}</p>
                        <p><strong>Applied:</strong> {new Date(app.appliedAt?.toDate?.() || app.appliedAt).toLocaleDateString()}</p>
                        <p><strong>Cover Letter:</strong> {app.coverLetter.substring(0, 100)}...</p>
                        <button 
                          onClick={() => handleReviewResume(app)}
                          disabled={analyzingResume}
                        >
                          {analyzingResume ? '⏳ Analyzing...' : '🤖 Analyze Resume with AI'}
                        </button>

                        {reviewResult && (
                          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '5px', maxHeight: '400px', overflowY: 'auto' }}>
                            <h5>📊 AI Resume Analysis:</h5>
                            <pre style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {reviewResult}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No applications for this job yet.</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p>No jobs posted yet. <a onClick={() => navigate('/recruiter/post-job')}>{t('post_new_job')}</a></p>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;