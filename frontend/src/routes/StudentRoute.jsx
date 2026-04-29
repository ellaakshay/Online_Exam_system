// filepath: frontend/src/routes/StudentRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Authcontext } from '../context/Authcontext';

const StudentRoute = ({ children }) => {
  const { user, loading } = useContext(Authcontext);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'student' ? children : <Navigate to="/admin/dashboard" replace />;
};

export default StudentRoute;