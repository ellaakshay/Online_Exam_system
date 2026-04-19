// filepath: frontend/src/routes/StudentRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StudentRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

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

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  return storedUser.role === 'student' ? children : <Navigate to="/admin/dashboard" />;
};

export default StudentRoute;