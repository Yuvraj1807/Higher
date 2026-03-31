import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTranslation } from 'react-i18next';

interface LocationJobsSearchProps {
  userLocation: string;
  onJobSelect: (jobId: string) => void;
}

const LocationJobsSearch: React.FC<LocationJobsSearchProps> = ({ userLocation, onJobSelect }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchRadius, setSearchRadius] = useState(50); // km
  const { t } = useTranslation();

  useEffect(() => {
    loadNearbyJobs();
  }, [userLocation, searchRadius]);

  const loadNearbyJobs = async () => {
    try {
      // Fetch all jobs and filter by location
      const jobsSnapshot = await getDocs(collection(db, 'jobs'));
      const jobsList: any[] = [];

      jobsSnapshot.forEach((doc) => {
        const jobLocation = doc.data().location?.toLowerCase() || '';
        const userLoc = userLocation?.toLowerCase() || '';

        // Simple location matching (in production, use geolocation APIs)
        if (jobLocation.includes(userLoc) || userLoc.includes(jobLocation.split(',')[0])) {
          jobsList.push({ id: doc.id, ...doc.data() });
        }
      });

      setJobs(jobsList);
    } catch (error) {
      console.error('Error loading nearby jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <label><strong>📍 Search Radius: {searchRadius} km</strong></label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={searchRadius}
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          style={{ width: '100%', marginTop: '0.5rem' }}
        />
      </div>

      {loading ? (
        <p>Loading jobs near {userLocation}...</p>
      ) : jobs.length > 0 ? (
        <div className="jobs-container">
          <h3>🔴 {jobs.length} Jobs Found Near You</h3>
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p><strong>📍 Location:</strong> {job.location}</p>
              <p><strong>💼 Type:</strong> {job.jobType}</p>
              <p><strong>💰 Salary:</strong> {job.salary}</p>
              <p>{job.description.substring(0, 150)}...</p>
              <button onClick={() => onJobSelect(job.id)}>
                {t('apply_now')}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No jobs found near {userLocation}. Try expanding the search radius.</p>
      )}
    </div>
  );
};

export default LocationJobsSearch;