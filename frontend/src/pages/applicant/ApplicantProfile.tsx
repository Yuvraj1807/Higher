import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

interface ApplicantProfileProps {
  onLogout: () => void;
}

const ApplicantProfile: React.FC<ApplicantProfileProps> = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    skillLevel: 'skilled',
    location: '',
    phone: '',
    experience: '',
    skills: '',
    education: '',
    bio: ''
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
        navigate('/applicant/login');
        return;
      }

      const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          fullName: data.fullName || '',
          skillLevel: data.skillLevel || 'skilled',
          location: data.location || '',
          phone: data.phone || '',
          experience: data.experience || '',
          skills: data.skills || '',
          education: data.education || '',
          bio: data.bio || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('❌ Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setMessage('❌ Full name is required');
      return;
    }
    if (!formData.location.trim()) {
      setMessage('❌ Location is required');
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
        fullName: formData.fullName,
        skillLevel: formData.skillLevel,
        location: formData.location,
        phone: formData.phone,
        experience: formData.experience,
        skills: formData.skills,
        education: formData.education,
        bio: formData.bio,
        profileCompleted: true,
        updatedAt: new Date()
      });

      console.log('Profile updated successfully');
      setMessage('✅ Profile completed! Redirecting...');

      setTimeout(() => {
        console.log('Redirecting to /applicant/home');
        window.location.href = '/applicant/home';
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
      <h2>🚀 Complete Your Profile</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
        Help us match you with the perfect job opportunities
      </p>

      {message && (
        <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label><strong>Full Name *</strong></label>
        <input
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <label><strong>Skill Level *</strong></label>
        <select name="skillLevel" value={formData.skillLevel} onChange={handleChange} required>
          <option value="skilled">Skilled - I have professional experience</option>
          <option value="unskilled">Unskilled - I'm looking to start my career</option>
        </select>

        <label><strong>Location *</strong></label>
        <input
          type="text"
          name="location"
          placeholder="Your city/state"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <label><strong>Phone Number</strong></label>
        <input
          type="text"
          name="phone"
          placeholder="Your contact number"
          value={formData.phone}
          onChange={handleChange}
        />

        <label><strong>Years of Experience</strong></label>
        <input
          type="text"
          name="experience"
          placeholder="e.g., 5 years in Web Development"
          value={formData.experience}
          onChange={handleChange}
        />

        <label><strong>Skills</strong></label>
        <textarea
          name="skills"
          placeholder="List your key skills (comma-separated)"
          value={formData.skills}
          onChange={handleChange}
        />

        <label><strong>Education</strong></label>
        <input
          type="text"
          name="education"
          placeholder="Your highest qualification"
          value={formData.education}
          onChange={handleChange}
        />

        <label><strong>About You</strong></label>
        <textarea
          name="bio"
          placeholder="Tell us about yourself, your career goals, and what you're looking for..."
          value={formData.bio}
          onChange={handleChange}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? '⏳ Saving Profile...' : '✅ Complete Profile & Continue'}
        </button>
      </form>
    </div>
  );
};

export default ApplicantProfile;