import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { createExam } from '../../api/axios';
import toast from 'react-hot-toast';
import { FileText, Clock, Calendar } from 'lucide-react';

const CreateExam = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    scheduledAt: ''
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createExam(formData);
      toast.success('Exam created!');
      navigate('/admin/manage-exams');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "14px 16px",
    border: focusedField === fieldName ? "2px solid #7c3aed" : "2px solid #E5E7EB",
    borderRadius: "12px",
    fontSize: "15px",
    color: "#1a202c",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6" }}>
      <Sidebar role="admin" />
      <div style={{ flex: 1, marginLeft: "260px", padding: "32px", overflowY: "auto" }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c" }}>Create New Exam</h1>
          <p style={{ color: "#718096", marginTop: "4px" }}>Add a new examination for students</p>
        </div>

        {/* Form Card */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          maxWidth: "600px"
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Exam Title *
              </label>
              <div style={{ position: "relative" }}>
                <FileText style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={{ ...inputStyle('title'), paddingLeft: "44px" }}
                  placeholder="Enter exam title"
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                rows={4}
                style={{ ...inputStyle('description'), resize: "none" }}
                placeholder="Enter exam description (optional)"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Duration (minutes) *
              </label>
              <div style={{ position: "relative" }}>
                <Clock style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('duration')}
                  onBlur={() => setFocusedField(null)}
                  required
                  min={1}
                  style={{ ...inputStyle('duration'), paddingLeft: "44px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Scheduled Date & Time *
              </label>
              <div style={{ position: "relative" }}>
                <Calendar style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('scheduledAt')}
                  onBlur={() => setFocusedField(null)}
                  required
                  min={getMinDateTime()}
                  style={{ ...inputStyle('scheduledAt'), paddingLeft: "44px" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", paddingTop: "8px" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: loading ? "#9CA3AF" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Creating..." : "Create Exam"}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                style={{
                  padding: "14px 24px",
                  background: "#F3F4F6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default CreateExam;