import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, GraduationCap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
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
      await register(formData);
      toast.success('Account created! Please login.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "12px 16px",
    border: focusedField === fieldName ? "2px solid #7c3aed" : "2px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "15px",
    color: "#1a202c",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s"
  });

  const roleButtonStyle = (isSelected) => ({
    background: isSelected ? "#EDE9FE" : "#F9FAFB",
    border: isSelected ? "2px solid #7c3aed" : "2px solid #E5E7EB",
    color: isSelected ? "#7c3aed" : "#6B7280",
    borderRadius: "10px",
    padding: "10px 0",
    width: "48%",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px"
  });

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "48px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#059669",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <span style={{ fontSize: "28px" }}>🎓</span>
          </div>
          <h1 style={{ color: "#1a202c", fontSize: "26px", fontWeight: "700", textAlign: "center", marginBottom: "4px" }}>
            Create Account
          </h1>
          <p style={{ color: "#718096", fontSize: "14px", textAlign: "center" }}>
            Join the examination platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <User style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
                style={{ ...inputStyle('name'), paddingLeft: "40px" }}
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                style={{ ...inputStyle('email'), paddingLeft: "40px" }}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                minLength={6}
                style={{ ...inputStyle('password'), paddingLeft: "40px" }}
                placeholder="Enter your password"
              />
            </div>
            <p style={{ color: "#9CA3AF", fontSize: "12px", marginTop: "4px" }}>Must be at least 6 characters</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Select Role
            </label>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                style={roleButtonStyle(formData.role === 'student')}
              >
                <GraduationCap size={20} style={{ color: formData.role === 'student' ? "#7c3aed" : "#6B7280" }} />
                <span style={{ fontSize: "14px" }}>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                style={roleButtonStyle(formData.role === 'admin')}
              >
                <Shield size={20} style={{ color: formData.role === 'admin' ? "#7c3aed" : "#6B7280" }} />
                <span style={{ fontSize: "14px" }}>Admin</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              marginTop: "8px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s, transform 0.1s"
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.opacity = "0.92"; }}
            onMouseLeave={(e) => { e.target.style.opacity = "1"; }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Bottom Link */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: "#7c3aed", fontWeight: "600", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;