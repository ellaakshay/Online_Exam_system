import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';
import { BookOpen, Clock, TrendingUp, Award, Activity, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, resultsRes] = await Promise.all([
          API.get('/exams/available'),
          API.get('/results/my')
        ]);
        // Handle both response formats
        setExams(examsRes.data.data || examsRes.data || []);
        setMyResults(resultsRes.data.data || resultsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate stats
  const getStats = () => {
    const attempted = myResults.length;
    const notAttempted = exams.length - attempted;
    const passed = myResults.filter(r => (parseFloat(r.percentage) || 0) >= 60).length;
    const failed = myResults.filter(r => (parseFloat(r.percentage) || 0) < 60).length;
    const avgScore = myResults.length > 0 
      ? Math.round(myResults.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) / myResults.length)
      : 0;
    const bestScore = myResults.length > 0 
      ? Math.max(...myResults.map(r => parseFloat(r.percentage) || 0))
      : 0;
    return { attempted, notAttempted, passed, failed, avgScore, bestScore: Math.round(bestScore) };
  };

  const stats = getStats();

  // Get exam title helper
  const getExamTitle = (result) => {
    if (result.exam?.title) return result.exam.title;
    if (result.examId?.title) return result.examId.title;
    return 'Exam';
  };

  // Get recent activity (last 3 results)
  const recentActivity = [...myResults]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 3);

  // Get upcoming exams (not attempted)
  const upcomingExams = exams.filter(exam => {
    const isAttempted = myResults.some(r => {
      const rExamId = typeof r.examId === 'object' ? r.examId?._id : r.examId;
      return rExamId?.toString() === exam._id?.toString();
    });
    return !isAttempted;
  }).slice(0, 3);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6" }}>
        <Sidebar role="student" />
        <div style={{ flex: 1, marginLeft: "260px", padding: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #E5E7EB", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1, marginLeft: "260px", padding: "32px", overflowY: "auto" }}>
        
        {/* Hero Welcome Banner */}
        <div style={{
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          borderRadius: "20px",
          padding: "32px 40px",
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{ color: "white", fontSize: "26px", fontWeight: "700", marginBottom: "8px" }}>
              Welcome back, {user.name}! 🎓
            </h1>
            <p style={{ color: "white", opacity: 0.85, fontSize: "16px" }}>
              You have {stats.notAttempted} exams available to take
            </p>
          </div>
          <div style={{ fontSize: "72px" }}>📝</div>
        </div>

        {/* SECTION A: Exam Stats Summary Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={24} style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Total Available</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{exams.length}</p>
            </div>
          </div>
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={24} style={{ color: "#059669" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Attempted</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.attempted}</p>
            </div>
          </div>
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={24} style={{ color: "#D97706" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Not Attempted</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.notAttempted}</p>
            </div>
          </div>
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={24} style={{ color: "#2563EB" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Passed</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.passed}</p>
            </div>
          </div>
        </div>

        {/* SECTION B: Recent Activity Feed */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Activity size={20} style={{ color: "#7c3aed" }} />
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a202c" }}>Recent Activity</h2>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#718096", background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <p>No recent activity yet. Take an exam to see your results here.</p>
            </div>
          ) : (
            <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              {recentActivity.map((result, index) => {
                const percentage = parseFloat(result.percentage) || 0;
                const passed = percentage >= 60;
                return (
                  <div key={result._id} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "16px", 
                    padding: "16px 20px",
                    borderBottom: index < recentActivity.length - 1 ? "1px solid #F3F4F6" : "none"
                  }}>
                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%", 
                      background: passed ? "#D1FAE5" : "#FEE2E2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: passed ? "#059669" : "#DC2626"
                    }}>
                      {getExamTitle(result).charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#1a202c" }}>Completed: {getExamTitle(result)}</div>
                      <div style={{ fontSize: "13px", color: "#718096" }}>{new Date(result.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ 
                      padding: "6px 12px", 
                      borderRadius: "20px", 
                      fontSize: "13px",
                      fontWeight: "600",
                      background: passed ? "#D1FAE5" : "#FEE2E2",
                      color: passed ? "#065F46" : "#DC2626"
                    }}>
                      {result.score}/{result.totalQuestions} — {percentage.toFixed(0)}%
                    </div>
                  </div>
                );
              })}
              <div style={{ padding: "16px 20px", borderTop: "1px solid #F3F4F6" }}>
                <Link 
                  to="/student/my-results" 
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}
                >
                  View All Results → <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* SECTION C: Upcoming Exams Mini List */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Clock size={20} style={{ color: "#7c3aed" }} />
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a202c" }}>Upcoming Exams</h2>
          </div>

          {upcomingExams.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#718096", background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <p>No upcoming exams. Check back later!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {upcomingExams.map((exam) => (
                <div key={exam._id} style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #F3F4F6",
                  borderLeft: "4px solid #7c3aed",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1a202c", marginBottom: "4px" }}>
                      {exam.title}
                    </h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ background: "#EDE9FE", color: "#7c3aed", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>
                        ⏱ {exam.duration} min
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/student/exam/${exam._id}`)}
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Start →
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {upcomingExams.length > 0 && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Link 
                to="/student/available-exams" 
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}
              >
                View All Available Exams → <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;