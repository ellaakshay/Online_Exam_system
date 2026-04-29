import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Authcontext } from '../../context/Authcontext';
import { login } from '../../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const { login: authLogin } = useContext(Authcontext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData);
      const response = await login(formData);
      console.log('Login response:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);

      // Handle both response formats: { success: true, data: {...} } or direct {...}
      let userData;
      let token;
      
      if (response.data?.data) {
        // Format: { success: true, data: { _id, name, email, role, token } }
        userData = response.data.data;
        token = response.data.data.token;
      } else if (response.data?.token) {
        // Format: { _id, name, email, role, token }
        userData = response.data;
        token = response.data.token;
      } else {
        throw new Error('Invalid response format from server');
      }

      if (!userData || !token) {
        throw new Error('Invalid response from server - missing user data or token');
      }

      console.log('Extracted userData:', userData);
      console.log('Extracted token:', token);

      authLogin(userData, token);
      toast.success(`Welcome back, ${userData.name}!`);

      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
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
            background: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <span style={{ fontSize: "28px" }}>🔐</span>
          </div>
          <h1 style={{ color: "#1a202c", fontSize: "26px", fontWeight: "700", textAlign: "center", marginBottom: "4px" }}>
            Welcome Back
          </h1>
          <p style={{ color: "#718096", fontSize: "14px", textAlign: "center" }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#DC2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                style={{ ...inputStyle('password'), paddingLeft: "40px", paddingRight: "40px" }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF"
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" style={{ width: "16px", height: "16px", borderRadius: "4px", border: "1px solid #E5E7EB" }} />
              <span style={{ color: "#6B7280", fontSize: "14px" }}>Remember me</span>
            </label>
            <a href="#" style={{ color: "#7c3aed", fontSize: "14px", textDecoration: "none" }}>Forgot password?</a>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Bottom Link */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: "#7c3aed", fontWeight: "600", textDecoration: "none" }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;