import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/Authcontext';
import AdminRoute from './routes/AdminRoute';
import StudentRoute from './routes/StudentRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateExam from './pages/admin/CreateExam';
import ManageExams from './pages/admin/ManageExams';
import ViewResults from './pages/admin/ViewResults';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import ExamAttempt from './pages/student/ExamAttempt';
import MyResults from './pages/student/MyResults';
import ExamResult from './pages/student/ExamResult';

// Shared Pages
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              border: '1px solid #e5e7eb',
              color: '#1f2937',
            },
          }}
        />
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/create-exam"
              element={
                <AdminRoute>
                  <CreateExam />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/manage-exams"
              element={
                <AdminRoute>
                  <ManageExams />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/view-results"
              element={
                <AdminRoute>
                  <ViewResults />
                </AdminRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <StudentRoute>
                  <StudentDashboard />
                </StudentRoute>
              }
            />
            <Route
              path="/student/available-exams"
              element={
                <StudentRoute>
                  <AvailableExams />
                </StudentRoute>
              }
            />
            <Route
              path="/student/exam/:examId"
              element={
                <StudentRoute>
                  <ExamAttempt />
                </StudentRoute>
              }
            />
            <Route
              path="/student/my-results"
              element={
                <StudentRoute>
                  <MyResults />
                </StudentRoute>
              }
            />
            <Route
              path="/student/exam-result/:resultId"
              element={
                <StudentRoute>
                  <ExamResult />
                </StudentRoute>
              }
            />

            {/* Shared Routes - accessible to both admin and student */}
            <Route
              path="/profile"
              element={
                <StudentRoute>
                  <Profile />
                </StudentRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <AdminRoute>
                  <Profile />
                </AdminRoute>
              }
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;