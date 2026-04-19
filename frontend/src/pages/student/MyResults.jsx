import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getMyResults } from '../../api/axios';
import { Award, TrendingUp, Target, FileText, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

console.log("MyResults component loaded");

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredResult, setHoveredResult] = useState(null);
  const [error, setError] = useState(null);

  console.log("MyResults rendering, loading:", loading);

  useEffect(() => {
    console.log("MyResults useEffect running");
    const fetchResults = async () => {
      try {
        console.log("Fetching my results...");
        const res = await getMyResults();
        console.log("My results response:", res);
        // Backend returns array directly, not wrapped in data
        const data = res.data;
        console.log("Results data:", data);
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError(error.message);
      } finally {
        setLoading(false);
        console.log("Loading set to false");
      }
    };
    fetchResults();
  }, []);

  const getGrade = (percentage) => {
    const pct = typeof percentage === 'number' ? percentage : parseFloat(percentage) || 0;
    if (pct >= 90) return { grade: 'A', color: '#059669', bg: '#D1FAE5' };
    if (pct >= 75) return { grade: 'B', color: '#2563EB', bg: '#DBEAFE' };
    if (pct >= 60) return { grade: 'C', color: '#D97706', bg: '#FEF3C7' };
    return { grade: 'F', color: '#EF4444', bg: '#FEE2E2' };
  };

  const getStarRating = (avgScore) => {
    if (avgScore >= 90) return '⭐⭐⭐⭐⭐';
    if (avgScore >= 75) return '⭐⭐⭐⭐';
    if (avgScore >= 60) return '⭐⭐⭐';
    if (avgScore >= 40) return '⭐⭐';
    return '⭐';
  };

  // Calculate stats - handle both response formats
  const stats = results.length > 0 ? {
    totalExams: results.length,
    avgScore: Math.round(results.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) / results.length),
    highestScore: Math.round(Math.max(...results.map(r => parseFloat(r.percentage) || 0))),
    passed: results.filter(r => (parseFloat(r.percentage) || 0) >= 60).length,
    failed: results.filter(r => (parseFloat(r.percentage) || 0) < 60).length
  } : null;

  // Helper to get exam title from either format
  const getExamTitle = (result) => {
    if (result.exam?.title) return result.exam.title;
    if (result.examId?.title) return result.examId.title;
    return 'Exam';
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white"
      }}>
        <Sidebar role="student" />
        <div style={{ 
          flex: 1, 
          marginLeft: "260px", 
          padding: "32px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          flexDirection: "column"
        }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            border: "4px solid rgba(255,255,255,0.3)", 
            borderTop: "4px solid white", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite" 
          }}></div>
          <p style={{ marginTop: "24px", fontSize: "18px" }}>Loading your results...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white"
      }}>
        <Sidebar role="student" />
        <div style={{ 
          flex: 1, 
          marginLeft: "260px", 
          padding: "32px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <div style={{ 
            textAlign: "center", 
            padding: "48px", 
            background: "white", 
            borderRadius: "16px",
            color: "#1a202c"
          }}>
            <p style={{ color: "#DC2626", fontSize: "20px", fontWeight: "700" }}>⚠️ Error</p>
            <p style={{ color: "#6B7280", marginTop: "12px" }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                marginTop: "24px", 
                padding: "12px 24px", 
                background: "#7c3aed", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600"
              }}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <Sidebar role="student" />
      <div style={{ flex: 1, marginLeft: "260px", padding: "32px", overflowY: "auto" }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c" }}>My Results</h1>
          <p style={{ color: "#718096", marginTop: "4px" }}>View your exam performance</p>
        </div>

        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px", background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <FileText size={64} style={{ color: "#9CA3AF", marginBottom: "16px" }} />
            <p style={{ color: "#374151", fontSize: "18px" }}>You haven't attempted any exams yet.</p>
            <Link
              to="/student/available-exams"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "16px", color: "#059669", textDecoration: "none", fontWeight: "500" }}
            >
              View Available Exams <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* Performance Summary Card */}
            {stats && (
              <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "24px", 
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
                marginBottom: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                {/* Left side - Big number */}
                <div style={{ textAlign: "center", padding: "0 32px" }}>
                  <div style={{ fontSize: "48px", fontWeight: "700", color: "#7c3aed" }}>{stats.avgScore}%</div>
                  <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px" }}>Overall Average</div>
                  <div style={{ fontSize: "20px" }}>{getStarRating(stats.avgScore)}</div>
                </div>
                
                {/* Divider */}
                <div style={{ width: "1px", height: "80px", background: "#F3F4F6" }} />
                
                {/* Right side - Mini breakdown */}
                <div style={{ display: "flex", gap: "32px", padding: "0 32px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      <CheckCircle size={20} style={{ color: "#059669" }} />
                      <span style={{ fontSize: "24px", fontWeight: "700", color: "#059669" }}>{stats.passed}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#6B7280" }}>Passed</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      <XCircle size={20} style={{ color: "#DC2626" }} />
                      <span style={{ fontSize: "24px", fontWeight: "700", color: "#DC2626" }}>{stats.failed}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#6B7280" }}>Failed</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#2563EB" }}>{stats.totalExams}</div>
                    <div style={{ fontSize: "13px", color: "#6B7280" }}>Total Taken</div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            {stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={24} style={{ color: "#7c3aed" }} />
                  </div>
                  <div>
                    <p style={{ color: "#718096", fontSize: "14px" }}>Total Exams</p>
                    <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.totalExams}</p>
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUp size={24} style={{ color: "#2563EB" }} />
                  </div>
                  <div>
                    <p style={{ color: "#718096", fontSize: "14px" }}>Average Score</p>
                    <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.avgScore}%</p>
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Target size={24} style={{ color: "#059669" }} />
                  </div>
                  <div>
                    <p style={{ color: "#718096", fontSize: "14px" }}>Highest Score</p>
                    <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.highestScore}%</p>
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Award size={24} style={{ color: "#7c3aed" }} />
                  </div>
                  <div>
                    <p style={{ color: "#718096", fontSize: "14px" }}>Passed</p>
                    <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.passed}/{stats.totalExams}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden", position: "relative" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <th style={{ textAlign: "left", padding: "16px", color: "#6B7280", fontWeight: "500", fontSize: "14px" }}>Exam</th>
                      <th style={{ textAlign: "left", padding: "16px", color: "#6B7280", fontWeight: "500", fontSize: "14px" }}>Date</th>
                      <th style={{ textAlign: "left", padding: "16px", color: "#6B7280", fontWeight: "500", fontSize: "14px" }}>Score</th>
                      <th style={{ textAlign: "left", padding: "16px", color: "#6B7280", fontWeight: "500", fontSize: "14px" }}>Progress</th>
                      <th style={{ textAlign: "left", padding: "16px", color: "#6B7280", fontWeight: "500", fontSize: "14px" }}>Grade</th>
                      <th style={{ textAlign: "left", padding: "16px", color: "#6B7280", fontWeight: "500", fontSize: "14px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => {
                      const percentage = parseFloat(result.percentage) || 0;
                      const gradeInfo = getGrade(percentage);
                      const passed = percentage >= 60;
                      return (
                        <tr 
                          key={result._id} 
                          style={{ borderBottom: "1px solid #F3F4F6" }}
                          onMouseEnter={() => setHoveredResult(result)}
                          onMouseLeave={() => setHoveredResult(null)}
                        >
                          <td style={{ padding: "16px" }}>
                            <span style={{ color: "#1a202c", fontWeight: "500" }}>{getExamTitle(result)}</span>
                          </td>
                          <td style={{ padding: "16px", color: "#6B7280" }}>
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ color: "#1a202c", fontWeight: "600" }}>{result.score}/{result.totalQuestions}</span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div style={{ width: "100px", background: "#F3F4F6", borderRadius: "4px", height: "8px" }}>
                              <div style={{
                                width: `${percentage}%`,
                                height: "100%",
                                borderRadius: "4px",
                                background: percentage >= 75 ? "#059669" : percentage >= 50 ? "#D97706" : "#DC2626"
                              }} />
                            </div>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", background: gradeInfo.bg, color: gradeInfo.color || "#374151" }}>
                              {gradeInfo.grade} ({percentage.toFixed(0)}%)
                            </span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", background: passed ? "#D1FAE5" : "#FEE2E2", color: passed ? "#065F46" : "#EF4444" }}>
                              {passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Tooltip */}
              {hoveredResult && (
                <div style={{
                  position: "absolute",
                  right: "20px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#1a202c",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  zIndex: 10,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}>
                  <div style={{ marginBottom: "4px" }}><strong>Exam:</strong> {getExamTitle(hoveredResult)}</div>
                  <div style={{ marginBottom: "4px" }}><strong>Attempted on:</strong> {new Date(hoveredResult.submittedAt).toLocaleDateString()}</div>
                  <div><strong>Status:</strong> {(parseFloat(hoveredResult.percentage) || 0) >= 60 ? 'Passed' : 'Failed'}</div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default MyResults;