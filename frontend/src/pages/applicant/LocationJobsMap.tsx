import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTranslation } from 'react-i18next';

interface LocationJobsMapProps {
  userLocation: string;
  onJobSelect: (jobId: string) => void;
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px',
  marginTop: '1rem'
};

const LocationJobsMap: React.FC<LocationJobsMapProps> = ({ userLocation, onJobSelect }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''
  });

  const [center, setCenter] = useState({ lat: 28.7041, lng: 77.1025 }); // Default: Delhi
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadJobsByLocation();
    geocodeLocation();
  }, [userLocation]);

  const geocodeLocation = async () => {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ address: userLocation }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setCenter({ lat: lat(), lng: lng() });
        }
      });
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const loadJobsByLocation = async () => {
    try {
      const q = query(collection(db, 'jobs'), where('location', '==', userLocation));
      const querySnapshot = await getDocs(q);
      const jobsList: any[] = [];
      querySnapshot.forEach((doc) => {
        jobsList.push({ id: doc.id, ...doc.data() });
      });
      setJobs(jobsList);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {jobs.map(job => (
        <Marker
          key={job.id}
          position={{ lat: 28.7041 + Math.random() * 0.1, lng: 77.1025 + Math.random() * 0.1 }}
          onClick={() => setSelectedJob(job)}
        />
      ))}
      
      {selectedJob && (
        <InfoWindow
          position={{ lat: 28.7041, lng: 77.1025 }}
          onCloseClick={() => setSelectedJob(null)}
        >
          <div style={{ padding: '10px' }}>
            <h4>{selectedJob.title}</h4>
            <p><strong>Location:</strong> {selectedJob.location}</p>
            <button onClick={() => onJobSelect(selectedJob.id)}>
              Apply Now
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default LocationJobsMap;