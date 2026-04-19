import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';
import { BookOpen, Users, ClipboardCheck, TrendingUp, PlusCircle, Award, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({ exams: 0, students: 0, results: 0, avgScore: 0 });
  const [examStats, setExamStats] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, resultsRes] = await Promise.all([
          API.get('/exams'),
          API.get('/results')
        ]);
        
        // Handle both response formats: response.data.data or response.data
        const exams = examsRes.data.data || examsRes.data || [];
        const results = resultsRes.data.data || resultsRes.data || [];
        
        // Unique students - handle both populated and non-populated formats
        const uniqueStudents = [...new Set(results.map(r => {
          if (typeof r.studentId === 'object' && r.studentId !== null) {
            return r.studentId._id?.toString();
          }
          return r.student?._id || r.studentId;
        }).filter(Boolean))].length;
        
        // Average score
        const avgScore = results.length > 0 
          ? Math.round(results.reduce((acc, r) => {
              const total = r.totalQuestions || r.total || 1;
              return acc + (r.score / total * 100);
            }, 0) / results.length)
          : 0;

        setStats({
          exams: exams.length,
          students: uniqueStudents,
          results: results.length,
          avgScore
        });

        // Exam completion stats
        const examCompletion = exams.map(exam => {
          const examResults = results.filter(r => {
            const rExamId = typeof r.examId === 'object' ? r.examId?._id : r.examId;
            return rExamId?.toString() === exam._id?.toString();
          });
          const completed = examResults.length;
          const avgExamScore = completed > 0 
            ? Math.round(examResults.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) / completed)
            : 0;
          return {
            _id: exam._id,
            title: exam.title,
            total: exam.questions?.length || 0,
            completed,
            avgScore: avgExamScore
          };
        });
        setExamStats(examCompletion);

        // Top performers
        const studentScores = {};
        results.forEach(r => {
          const studentId = r.student?._id || r.studentId;
          const studentName = r.student?.name || 'Unknown';
          const percentage = parseFloat(r.percentage) || 0;
          if (!studentScores[studentId]) {
            studentScores[studentId] = { name: studentName, scores: [], count: 0 };
          }
          studentScores[studentId].scores.push(percentage);
          studentScores[studentId].count++;
        });
        
        const performers = Object.entries(studentScores)
          .map(([id, data]) => ({
            id,
            name: data.name,
            avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
            examsTaken: data.count
          }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 3);
        setTopPerformers(performers);

        setRecentExams(exams.slice(0, 5));
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto refresh every 30 seconds so new results appear
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh button handler
  const handleRefresh = () => {
    fetchData();
  };

  const statCards = [
    { title: 'Total Exams', value: stats.exams, icon: BookOpen, bgColor: "#EDE9FE", iconColor: "#7c3aed" },
    { title: 'Total Students', value: stats.students, icon: Users, bgColor: "#DBEAFE", iconColor: "#2563EB" },
    { title: 'Results Submitted', value: stats.results, icon: ClipboardCheck, bgColor: "#D1FAE5", iconColor: "#059669" },
    { title: 'Average Score', value: `${stats.avgScore}%`, icon: TrendingUp, bgColor: "#FEF3C7", iconColor: "#D97706" },
  ];

  const getStatusStyle = (status) => {
    if (status === 'upcoming') {
      return { background: "#FEF3C7", color: "#92400E" };
    } else if (status === 'active') {
      return { background: "#D1FAE5", color: "#065F46" };
    } else {
      return { background: "#F3F4F6", color: "#6B7280" };
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6" }}>
        <Sidebar role="admin" />
        <div style={{ flex: 1, marginLeft: "260px", padding: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #E5E7EB", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6" }}>
      <Sidebar role="admin" />
      <div style={{ flex: 1, marginLeft: "260px", padding: "32px", overflowY: "auto" }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c" }}>
              Good {getGreeting()}, {user.name}! 👋
            </h1>
            <p style={{ color: "#718096", marginTop: "4px" }}>
              Here is what is happening today
            </p>
          </div>
          <button
            onClick={handleRefresh}
            style={{
              padding: "8px 20px",
              background: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats Cards Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #F3F4F6"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: "#718096", fontSize: "14px", marginBottom: "4px" }}>{card.title}</p>
                    <p style={{ fontSize: "32px", fontWeight: "700", color: "#1a202c" }}>{card.value}</p>
                  </div>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: card.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Icon size={22} style={{ color: card.iconColor }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION A: Exam Completion Stats */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "28px"
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a202c", marginBottom: "20px" }}>Exam Completion Stats</h2>
          
          {examStats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#718096" }}>
              <p>No exam data available</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {examStats.map((exam) => (
                <div key={exam._id} style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #F3F4F6",
                  background: "#FAFAFA"
                }}>
                  <div style={{ fontWeight: "600", color: "#1a202c", marginBottom: "8px", fontSize: "14px" }}>
                    {exam.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#718096" }}>Completed: <strong style={{ color: "#1a202c" }}>{exam.completed}</strong></span>
                    <span style={{ color: "#718096" }}>Avg: <strong style={{ color: exam.avgScore >= 60 ? "#059669" : "#DC2626" }}>{exam.avgScore}%</strong></span>
                  </div>
                  <div style={{ marginTop: "8px", height: "6px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${Math.min((exam.completed / exam.total) * 100, 100)}%`, 
                      height: "100%", 
                      background: exam.completed > 0 ? "#7c3aed" : "#E5E7EB",
                      borderRadius: "3px"
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION B: Top Performers */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          marginBottom: "28px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Award size={20} style={{ color: "#7c3aed" }} />
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a202c" }}>Top Performers</h2>
          </div>
          
          {topPerformers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px", color: "#718096" }}>
              <p>No student results yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "16px" }}>
              {topPerformers.map((student, index) => (
                <div key={student.id} style={{
                  flex: 1,
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #F3F4F6",
                  background: index === 0 ? "linear-gradient(135deg, #FEF3C7, #FDE68A)" : "#FAFAFA",
                  textAlign: "center"
                }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "50%", 
                    background: index === 0 ? "#F59E0B" : "#E5E7EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: index === 0 ? "white" : "#6B7280"
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ fontWeight: "600", color: "#1a202c", marginBottom: "4px" }}>{student.name}</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#7c3aed" }}>{student.avgScore}%</div>
                  <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>{student.examsTaken} exams taken</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Exams Table */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a202c" }}>Recent Exams</h2>
            <button 
              onClick={() => navigate('/admin/create-exam')}
              style={{
                background: "#7c3aed",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <PlusCircle size={16} />
              Create Exam
            </button>
          </div>
          
          {recentExams.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderRadius: "8px" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Title</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Duration</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Questions</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((exam) => {
                  const statusStyle = getStatusStyle(exam.status);
                  return (
                    <tr key={exam._id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "14px 16px", fontSize: "14px", color: "#374151", fontWeight: "500" }}>{exam.title}</td>
                      <td style={{ padding: "14px 16px", fontSize: "14px", color: "#374151" }}>{exam.duration} mins</td>
                      <td style={{ padding: "14px 16px", fontSize: "14px", color: "#374151" }}>{exam.questions?.length || 0}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          background: statusStyle.background,
                          color: statusStyle.color
                        }}>
                          {exam.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", padding: "32px", color: "#718096" }}>
              <BookOpen size={48} style={{ opacity: 0.5, marginBottom: "12px" }} />
              <p>No exams created yet</p>
            </div>
          )}
          
          {recentExams.length > 0 && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Link 
                to="/admin/manage-exams" 
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#7c3aed", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}
              >
                View All Exams → <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;