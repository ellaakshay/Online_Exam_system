import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';
import { Search, TrendingUp, TrendingDown, Users, FileText, Download, CheckCircle, XCircle } from 'lucide-react';

const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsRes, examsRes] = await Promise.all([
        API.get('/results'),
        API.get('/exams')
      ]);
      // Handle both response formats: response.data.data or response.data
      const resultsData = resultsRes.data.data || resultsRes.data || [];
      const examsData = examsRes.data.data || examsRes.data || [];
      console.log("All results fetched:", resultsData.length, resultsData);
      setResults(resultsData);
      setExams(examsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A', color: '#059669', bg: '#D1FAE5' };
    if (percentage >= 75) return { grade: 'B', color: '#2563EB', bg: '#DBEAFE' };
    if (percentage >= 60) return { grade: 'C', color: '#D97706', bg: '#FEF3C7' };
    return { grade: 'F', color: '#EF4444', bg: '#FEE2E2' };
  };

  // Safe helpers for populated data
  const getStudentName = (result) => {
    if (typeof result.studentId === 'object' && result.studentId !== null) {
      return result.studentId.name || result.studentId.email || 'Student';
    }
    return result.student?.name || 'Student';
  };

  const getStudentEmail = (result) => {
    if (typeof result.studentId === 'object' && result.studentId !== null) {
      return result.studentId.email || '';
    }
    return result.student?.email || '';
  };

  const getExamTitle = (result) => {
    if (typeof result.examId === 'object' && result.examId !== null) {
      return result.examId.title || 'Exam';
    }
    return result.exam?.title || 'Exam';
  };

  const getPercentage = (result) => {
    if (!result.totalQuestions || result.totalQuestions === 0) return 0;
    return Math.round((result.score / result.totalQuestions) * 100);
  };

  const getStats = () => {
    if (results.length === 0) return { total: 0, highest: 0, lowest: 0, average: 0, passed: 0, failed: 0 };
    const percentages = results.map(r => {
      const total = r.totalQuestions || r.total || 1;
      return (r.score / total) * 100;
    });
    const passed = results.filter(r => {
      const total = r.totalQuestions || r.total || 1;
      return (r.score / total) * 100 >= 60;
    }).length;
    return {
      total: results.length,
      highest: Math.max(...percentages).toFixed(1),
      lowest: Math.min(...percentages).toFixed(1),
      average: (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1),
      passed,
      failed: results.length - passed
    };
  };

  // Get unique exams from results
  const getUniqueExams = () => {
    const examMap = new Map();
    results.forEach(r => {
      const examId = typeof r.examId === 'object' ? r.examId?._id : r.examId;
      const examTitle = r.exam?.title || r.examId?.title || 'Unknown';
      if (examId && !examMap.has(examId)) {
        examMap.set(examId, examTitle);
      }
    });
    return Array.from(examMap.entries()).map(([id, title]) => ({ _id: id, title }));
  };

  const filteredResults = results.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const examTitle = (r.exam?.title || r.examId?.title || '').toLowerCase();
    const matchesSearch = examTitle.includes(searchLower);
    const examId = typeof r.examId === 'object' ? r.examId?._id : r.examId;
    const matchesExam = examFilter === 'all' || examId === examFilter;
    return matchesSearch && matchesExam;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Student', 'Exam', 'Score', 'Percentage', 'Grade', 'Status', 'Date'];
    const rows = sortedResults.map(r => {
      const examTitle = r.exam?.title || r.examId?.title || 'Unknown';
      const studentName = r.student?.name || r.studentId?.name || 'Unknown';
      const totalQuestions = r.totalQuestions || r.total || 0;
      const percentage = ((r.score / totalQuestions) * 100).toFixed(1);
      const { grade } = getGrade(parseFloat(percentage));
      const passed = parseFloat(percentage) >= 60;
      return [studentName, examTitle, `${r.score}/${totalQuestions}`, `${percentage}%`, grade, passed ? 'Pass' : 'Fail', new Date(r.submittedAt).toLocaleDateString()];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = getStats();
  const uniqueExams = getUniqueExams();

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
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c" }}>View Results</h1>
            <p style={{ color: "#718096", marginTop: "4px" }}>All student examination results</p>
            {lastUpdated && (
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchData}
            style={{
              padding: "8px 20px",
              background: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🔄 Refresh Results
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={20} style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Total Results</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.total}</p>
            </div>
          </div>
          
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} style={{ color: "#059669" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Highest</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.highest}%</p>
            </div>
          </div>
          
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingDown size={20} style={{ color: "#EF4444" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Lowest</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.lowest}%</p>
            </div>
          </div>
          
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={20} style={{ color: "#2563EB" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Average</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#1a202c" }}>{stats.average}%</p>
            </div>
          </div>

          {/* Pass/Fail Summary */}
          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={20} style={{ color: "#059669" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Passed</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#059669" }}>{stats.passed}</p>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <XCircle size={20} style={{ color: "#EF4444" }} />
            </div>
            <div>
              <p style={{ color: "#718096", fontSize: "14px" }}>Failed</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: "#EF4444" }}>{stats.failed}</p>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          {/* Filters & Actions */}
          <div style={{ padding: "16px", borderBottom: "1px solid #F3F4F6", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "300px" }}>
              <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9CA3AF" }} />
              <input
                type="text"
                placeholder="Search by exam name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #E5E7EB",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "#1a202c",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Exam Filter Dropdown */}
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: "10px",
                fontSize: "14px",
                color: "#1a202c",
                outline: "none",
                background: "white",
                cursor: "pointer",
                minWidth: "180px"
              }}
            >
              <option value="all">All Exams</option>
              {uniqueExams.map(exam => (
                <option key={exam._id} value={exam._id}>{exam.title}</option>
              ))}
            </select>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#6B7280", fontSize: "13px", borderBottom: "1px solid #F3F4F6" }}>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>Student</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>Exam</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>Score</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>Percentage</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>Grade</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: "600" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result) => {
                  const examTitle = getExamTitle(result);
                  const studentName = getStudentName(result);
                  const studentEmail = getStudentEmail(result);
                  const percentage = getPercentage(result);
                  const { grade, color, bg } = getGrade(percentage);
                  const passed = percentage >= 60;
                  return (
                    <tr key={result._id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={{ padding: "16px", color: "#1a202c", fontWeight: "500" }}>{studentName}</td>
                      <td style={{ padding: "16px", color: "#374151" }}>{studentEmail}</td>
                      <td style={{ padding: "16px", color: "#374151" }}>{examTitle}</td>
                      <td style={{ padding: "16px", color: "#374151" }}>{result.score}/{result.totalQuestions}</td>
                      <td style={{ padding: "16px", color: "#374151" }}>{percentage}%</td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", background: bg, color: color }}>{grade}</span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: "20px", 
                          fontSize: "12px", 
                          background: passed ? "#D1FAE5" : "#FEE2E2", 
                          color: passed ? "#065F46" : "#DC2626" 
                        }}>
                          {passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td style={{ padding: "16px", color: "#6B7280", fontSize: "14px" }}>
                        {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        }) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedResults.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px", color: "#718096" }}>No results found</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewResults;