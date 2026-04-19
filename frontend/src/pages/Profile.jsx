import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { LogOut, User as UserIcon } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(user.role === 'student');

  useEffect(() => {
    if (user.role === 'student') {
      const fetchResults = async () => {
        try {
          const res = await API.get('/results/my');
          setResults(res.data.data || []);
        } catch (err) {
          console.error('Failed to fetch results');
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [user.role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Calculate student stats
  const getStats = () => {
    if (results.length === 0) {
      return { attempted: 0, avgScore: 0, bestScore: 0, passRate: 0 };
    }
    const percentages = results.map(r => {
      const pct = parseFloat(r.percentage) || 0;
      return pct;
    });
    const passed = percentages.filter(p => p >= 60).length;
    return {
      attempted: results.length,
      avgScore: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
      bestScore: Math.round(Math.max(...percentages)),
      passRate: Math.round((passed / results.length) * 100)
    };
  };

  const stats = getStats();
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const roleBadgeStyle = user.role === 'admin'
    ? { background: '#EDE9FE', color: '#7c3aed' }
    : { background: '#D1FAE5', color: '#065F46' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6' }}>
      <Sidebar role={user.role} />
      <div style={{ flex: 1, marginLeft: '260px', padding: '32px', overflowY: 'auto' }}>
        
        {/* Profile Card */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          
          {/* Avatar Section */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white',
              fontSize: '40px',
              fontWeight: '700',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {userInitial}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', marginTop: '16px' }}>
              {user.name || 'User'}
            </h2>
            <span style={{
              display: 'inline-block',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              marginTop: '8px',
              ...roleBadgeStyle
            }}>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </span>
            <p style={{ color: '#6B7280', fontSize: '15px', marginTop: '8px' }}>
              {user.email || 'No email'}
            </p>
          </div>

          {/* Info Section */}
          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
              Account Information
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F9FAFB' }}>
              <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Full Name</span>
              <span style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>{user.name || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F9FAFB' }}>
              <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Email</span>
              <span style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>{user.email || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F9FAFB' }}>
              <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Role</span>
              <span style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F9FAFB' }}>
              <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Member Since</span>
              <span style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>N/A</span>
            </div>
          </div>

          {/* Stats Section (Student Only) */}
          {user.role === 'student' && (
            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '24px', marginTop: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                Your Statistics
              </h3>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>Loading...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ background: '#F3F4F6', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#7c3aed' }}>{stats.attempted}</div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Exams Attempted</div>
                  </div>
                  <div style={{ background: '#F3F4F6', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563EB' }}>{stats.avgScore}%</div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Average Score</div>
                  </div>
                  <div style={{ background: '#F3F4F6', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{stats.bestScore}%</div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Best Score</div>
                  </div>
                  <div style={{ background: '#F3F4F6', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: stats.passRate >= 60 ? '#059669' : '#DC2626' }}>
                      {stats.passRate}%
                    </div>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Pass Rate</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              marginTop: '32px',
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </div>
    </div>
  );
};

export default Profile;