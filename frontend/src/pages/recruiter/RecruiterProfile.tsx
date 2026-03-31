import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

interface RecruiterProfileProps {
  onLogout: () => void;
}

const RecruiterProfile: React.FC<RecruiterProfileProps> = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    employees: '',
    industry: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      if (!auth.currentUser) {
        navigate('/recruiter/login');
        return;
      }

      const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          companyName: data.companyName || '',
          employees: data.employees || '',
          industry: data.industry || '',
          location: data.location || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('❌ Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      setMessage('❌ ' + t('company_name') + ' is required');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      if (!auth.currentUser) {
        setMessage('❌ Not authenticated');
        setSubmitting(false);
        return;
      }

      console.log('Updating profile for user:', auth.currentUser.uid);

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        companyName: formData.companyName,
        employees: formData.employees,
        industry: formData.industry,
        location: formData.location,
        profileCompleted: true,
        updatedAt: new Date()
      });

      console.log('Profile updated successfully');
      setMessage('✅ ' + t('complete_profile') + '! Redirecting...');
      
      setTimeout(() => {
        console.log('Redirecting to /recruiter/home');
        window.location.href = '/recruiter/home';
      }, 1000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage('❌ Error: ' + error.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>{t('complete_your_recruiter_profile')}</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
        {t('company_details')}
      </p>

      {message && (
        <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label><strong>{t('company_name')} *</strong></label>
        <input
          type="text"
          name="companyName"
          placeholder="Enter your company name"
          value={formData.companyName}
          onChange={handleChange}
          required
        />

        <label><strong>{t('number_of_employees')}</strong></label>
        <input
          type="text"
          name="employees"
          placeholder="e.g., 50-100"
          value={formData.employees}
          onChange={handleChange}
        />

        <label><strong>{t('industry')}</strong></label>
        <input
          type="text"
          name="industry"
          placeholder="e.g., Technology, Finance, Healthcare"
          value={formData.industry}
          onChange={handleChange}
        />

        <label><strong>{t('location')}</strong></label>
        <input
          type="text"
          name="location"
          placeholder="e.g., New York, USA"
          value={formData.location}
          onChange={handleChange}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? '⏳ ' + t('saving') + '...' : '✅ ' + t('complete_profile')}
        </button>
      </form>
    </div>
  );
};

export default RecruiterProfile;