import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import '../../styles/ResumeBuilder.css';

interface ResumeBuilderProps {
  onLogout: () => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onLogout }) => {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resume, setResume] = useState('');
  const [navigate] = [useNavigate()];
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    professionalSummary: '',
    skills: '',
    experience: '',
    education: '',
    certifications: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate required fields
    if (!formData.fullName.trim()) {
      setMessage('❌ Full Name is required');
      setLoading(false);
      return;
    }

    try {
      const prompt = `
Full Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone}
Location: ${formData.location}

Professional Summary:
${formData.professionalSummary}

Skills:
${formData.skills}

Work Experience:
${formData.experience}

Education:
${formData.education}

Certifications:
${formData.certifications}
`;

      console.log('Sending prompt to API...');
      const response = await axios.post('http://localhost:5000/api/resume/generate', {
        prompt: prompt
      });

      console.log('API Response:', response.data);
      setResume(response.data.resume);
      setMessage('✅ Resume generated successfully!');
      setStep('preview');
    } catch (error: any) {
      console.error('Error:', error);
      setMessage('❌ Error: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    try {
      // Using html2pdf library
      const element = document.getElementById('resume-content');
      if (!element) return;

      const opt = {
        margin: 10,
        filename: 'resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      // Dynamically load html2pdf
      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        html2pdf().set(opt).from(element).save();
      } else {
        // Fallback: Download as formatted text
        downloadTXT();
      }
    } catch (error) {
      console.error('PDF download error:', error);
      downloadTXT();
    }
  };

  const downloadTXT = () => {
    const element = document.createElement('a');
    const file = new Blob([resume], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'resume.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadDOCX = async () => {
    try {
      // Using docx library
      const docx = (window as any).docx;
      if (docx) {
        const doc = new docx.Document({
          sections: [{
            children: [
              new docx.Paragraph({
                text: resume,
                spacing: { line: 360 }
              })
            ]
          }]
        });

        await docx.Packer.toBlob(doc).then((blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'resume.docx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } else {
        downloadTXT();
      }
    } catch (error) {
      console.error('DOCX download error:', error);
      downloadTXT();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resume);
    setMessage('✅ Resume copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      professionalSummary: '',
      skills: '',
      experience: '',
      education: '',
      certifications: ''
    });
    setResume('');
    setMessage('');
    setStep('form');
  };

  const goHome = () => {
    navigate('/applicant/home');
  };

  return (
    <div>
      <Navbar onLogout={onLogout} role="applicant" currentPage="/applicant/resume-builder" />

      <div className="resume-builder-container">
        {step === 'form' ? (
          <div className="resume-form">
            <h2>✨ {t('resume_builder')}</h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
              Fill in your details to generate a professional resume
            </p>

            {message && (
              <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
                {message}
              </div>
            )}

            <form onSubmit={handleGenerateResume}>
              {/* Contact Information Section */}
              <div className="form-section">
                <h3>👤 Contact Information</h3>
                
                <label><strong>{t('full_name')} *</strong></label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <div className="form-row">
                  <div>
                    <label><strong>Email</strong></label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label><strong>{t('phone_number')}</strong></label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <label><strong>{t('location')}</strong></label>
                <input
                  type="text"
                  name="location"
                  placeholder="New York, USA"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              {/* Professional Summary Section */}
              <div className="form-section">
                <h3>💼 Professional Summary</h3>
                <label><strong>Professional Summary</strong></label>
                <textarea
                  name="professionalSummary"
                  placeholder="Brief overview of your professional background and career goals..."
                  value={formData.professionalSummary}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Skills Section */}
              <div className="form-section">
                <h3>🎯 {t('skills')}</h3>
                <label><strong>{t('skills')} (comma-separated)</strong></label>
                <textarea
                  name="skills"
                  placeholder="e.g., JavaScript, React, Node.js, MongoDB, AWS, Git..."
                  value={formData.skills}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Experience Section */}
              <div className="form-section">
                <h3>💻 {t('years_of_experience')}</h3>
                <label><strong>Work Experience</strong></label>
                <textarea
                  name="experience"
                  placeholder={`Senior Developer at Tech Company (2020-Present)
- Led development of key features
- Managed team of 5 developers
- Improved performance by 40%

Developer at Startup (2018-2020)
- Built RESTful APIs
- Implemented database optimization`}
                  value={formData.experience}
                  onChange={handleChange}
                  rows={5}
                />
              </div>

              {/* Education Section */}
              <div className="form-section">
                <h3>🎓 {t('education')}</h3>
                <label><strong>{t('education')}</strong></label>
                <textarea
                  name="education"
                  placeholder={`Bachelor of Science in Computer Science
XYZ University (2018)
GPA: 3.8/4.0

Relevant Coursework: Data Structures, Web Development, Database Design`}
                  value={formData.education}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Certifications Section */}
              <div className="form-section">
                <h3>🏆 Certifications</h3>
                <label><strong>Certifications & Awards</strong></label>
                <textarea
                  name="certifications"
                  placeholder={`AWS Certified Solutions Architect (2023)
Google Cloud Professional Data Engineer (2022)
Employee of the Year Award (2021)`}
                  value={formData.certifications}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <button type="submit" disabled={loading} className="generate-btn">
                {loading ? '⏳ Generating...' : '✨ GENERATE RESUME WITH AI'}
              </button>
            </form>
          </div>
        ) : (
          <div className="resume-preview">
            <h2>📄 Your Generated Resume</h2>

            {message && (
              <div className={message.includes('✅') ? 'success-message' : 'error-message'}>
                {message}
              </div>
            )}

            <div id="resume-content" className="resume-content">
              <div className="resume-text">
                {resume.split('\n').map((line, index) => (
                  <div key={index} className="resume-line">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="download-options">
              <button onClick={downloadPDF} className="download-btn pdf-btn" title="Download as PDF">
                📥 PDF
              </button>
              <button onClick={downloadDOCX} className="download-btn docx-btn" title="Download as Word">
                📄 DOCX
              </button>
              <button onClick={downloadTXT} className="download-btn txt-btn" title="Download as Text">
                📝 TXT
              </button>
              <button onClick={copyToClipboard} className="download-btn copy-btn" title="Copy to clipboard">
                📋 COPY
              </button>
            </div>

            <div className="button-group">
              <button onClick={handleReset} className="reset-btn">
                ✏️ Edit & Regenerate
              </button>
              <button onClick={goHome} className="back-btn">
                🏠 Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;