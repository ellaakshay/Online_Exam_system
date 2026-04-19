import { Bell, User } from 'lucide-react';

const TopBar = ({ title, subtitle, notifications = [], role = 'student' }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const hasNotifications = notifications.length > 0;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'white',
      padding: '16px 32px',
      marginBottom: '32px',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
    }}>
      {/* Left Side */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a202c', margin: 0 }}>{title}</h1>
        <p style={{ fontSize: '14px', color: '#718096', margin: '4px 0 0 0' }}>{subtitle}</p>
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Notification Bell */}
        <button style={{
          position: 'relative',
          background: '#F3F4F6',
          border: 'none',
          padding: '10px 12px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '20px'
        }}>
          <Bell size={20} style={{ color: '#6B7280' }} />
          {hasNotifications && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#DC2626',
              border: '2px solid white'
            }} />
          )}
        </button>

        {/* User Avatar */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '700'
        }}>
          {userInitial}
        </div>
      </div>
    </div>
  );
};

export default TopBar;