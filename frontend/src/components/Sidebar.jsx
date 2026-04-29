import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Authcontext } from '../context/Authcontext';
import { useContext } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  BarChart2, 
  ClipboardList,
  LogOut,
  BookOpen as ExamIcon,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ role }) => {
  const { logout } = useContext(Authcontext);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/create-exam', label: 'Create Exam', icon: PlusCircle },
    { to: '/admin/manage-exams', label: 'Manage Exams', icon: BookOpen },
    { to: '/admin/view-results', label: 'View Results', icon: BarChart2 },
    { to: '/admin/profile', label: 'Profile', icon: User },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/available-exams', label: 'Available Exams', icon: ExamIcon },
    { to: '/student/my-results', label: 'My Results', icon: ClipboardList },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    localStorage.clear();
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      position: "fixed",
      left: 0,
      top: 0,
      width: "260px",
      height: "100vh",
      background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
      overflowY: "auto",
      boxShadow: "4px 0 24px rgba(0,0,0,0.15)"
    }}>
      {/* Top Logo Section */}
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ fontSize: "22px" }}>📚</span>
          </div>
          <span style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}>ExamPro</span>
        </div>
        <div style={{
          marginTop: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}></div>
      </div>

      {/* User Info Section */}
      <div style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "18px" }}>
              {getInitials(user.name)}
            </span>
          </div>
          <div>
            <div style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>
              {user.name || 'User'}
            </div>
            <span style={{
              background: role === 'admin' ? "#7c3aed" : "#059669",
              color: "white",
              fontSize: "11px",
              padding: "2px 10px",
              borderRadius: "20px",
              display: "inline-block",
              marginTop: "2px"
            }}>
              {role === 'admin' ? 'Admin' : 'Student'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Section */}
      <div style={{ flex: 1, padding: "16px 12px" }}>
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 16px",
                borderRadius: "12px",
                marginBottom: "4px",
                color: active ? "white" : "rgba(255,255,255,0.65)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none",
                background: active ? "rgba(255,255,255,0.15)" : "transparent",
                borderLeft: active ? "3px solid #a78bfa" : "3px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (!active) e.target.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.target.style.background = "transparent";
              }}
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </div>

      {/* Logout Button */}
      <div style={{ padding: "16px 12px" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: "12px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "rgba(255,255,255,0.65)",
            fontSize: "14px",
            fontWeight: "500"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#f87171";
            e.target.style.background = "rgba(248,113,113,0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "rgba(255,255,255,0.65)";
            e.target.style.background = "transparent";
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;