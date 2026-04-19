import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { Trash2, Plus, X, CheckCircle, Clock } from 'lucide-react';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: 'A' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await API.get('/exams');
      setExams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get exam status based on scheduledAt
  const getExamStatus = (exam) => {
    if (!exam.scheduledAt) return { label: 'Active', bg: '#D1FAE5', color: '#065F46' };
    
    const now = new Date();
    const scheduled = new Date(exam.scheduledAt);
    const diffMinutes = (scheduled - now) / (1000 * 60);
    
    if (diffMinutes > 60) {
      return { label: 'Upcoming', bg: '#DBEAFE', color: '#1D4ED8' };
    } else if (diffMinutes > 0) {
      return { label: 'Starting Soon', bg: '#FEF3C7', color: '#D97706' };
    } else if (diffMinutes > -exam.duration) {
      return { label: 'Active', bg: '#D1FAE5', color: '#065F46' };
    } else {
      return { label: 'Completed', bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      await API.delete(`/exams/${examId}`);
      toast.success('Exam deleted');
      fetchExams();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const openQuestionPanel = (exam) => {
    setSelectedExam(exam);
    setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 'A' }]);
    setShowQuestionPanel(true);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const addMoreQuestions = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 'A' }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmitQuestions = async () => {
    for (const q of questions) {
      if (!q.questionText || q.options.some(o => !o) || !q.correctAnswer) {
        toast.error('Please fill all fields for all questions');
        return;
      }
    }

    setSaving(true);
    try {
      await API.post(`/exams/${selectedExam._id}/questions`, { questions });
      toast.success('Questions added!');
      setShowQuestionPanel(false);
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add questions');
    } finally {
      setSaving(false);
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
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1a202c" }}>Manage Exams</h1>
          <p style={{ color: "#718096", marginTop: "4px" }}>Add questions to your exams</p>
        </div>

        {exams.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#718096" }}>No exams found. Create your first exam!</p>
            <a href="/admin/create-exam" style={{ display: "inline-block", marginTop: "16px", color: "#7c3aed", textDecoration: "none" }}>
              Create Exam →
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: showQuestionPanel ? "2fr 1fr" : "1fr", gap: "24px" }}>
            
            {/* Exams List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {exams.map((exam) => {
                const status = getExamStatus(exam);
                return (
                <div key={exam._id} style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #F3F4F6"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1a202c" }}>{exam.title}</h3>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                          background: status.bg,
                          color: status.color
                        }}>
                          {status.label}
                        </span>
                      </div>
                      <p style={{ color: "#718096", fontSize: "14px", marginBottom: "12px" }}>{exam.description || 'No description'}</p>
                      <div style={{ display: "flex", gap: "16px", fontSize: "14px", color: "#718096" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> {exam.duration} min</span>
                        <span>📅 {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleDateString() : 'No schedule'}</span>
                        <span>❓ {exam.questions?.length || 0} questions</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => openQuestionPanel(exam)}
                        style={{
                          padding: "8px 16px",
                          background: "#EDE9FE",
                          color: "#7c3aed",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <Plus size={16} />
                        Add Questions
                      </button>
                      <button
                        onClick={() => handleDelete(exam._id)}
                        style={{
                          padding: "8px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#EF4444"
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Question Panel */}
            {showQuestionPanel && selectedExam && (
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                height: "fit-content",
                position: "sticky",
                top: "32px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1a202c" }}>Add Questions</h3>
                  <button
                    onClick={() => setShowQuestionPanel(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <p style={{ color: "#718096", fontSize: "14px", marginBottom: "16px" }}>{selectedExam.title}</p>

                {questions.map((q, index) => (
                  <div key={index} style={{ border: "1px solid #E5E7EB", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ color: "#1a202c", fontWeight: "600", fontSize: "14px" }}>Q{index + 1}</span>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(index)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                      placeholder="Question text"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#1a202c",
                        marginBottom: "12px",
                        boxSizing: "border-box"
                      }}
                    />
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {['A', 'B', 'C', 'D'].map((opt, i) => (
                        <div key={opt} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#6B7280", fontSize: "14px", width: "20px" }}>{opt}.</span>
                          <input
                            type="text"
                            value={q.options[i]}
                            onChange={(e) => {
                              const newOptions = [...q.options];
                              newOptions[i] = e.target.value;
                              handleQuestionChange(index, 'options', newOptions);
                            }}
                            placeholder={`Option ${opt}`}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              border: "1px solid #E5E7EB",
                              borderRadius: "8px",
                              fontSize: "14px",
                              color: "#1a202c",
                              boxSizing: "border-box"
                            }}
                          />
                          {q.correctAnswer === opt && (
                            <CheckCircle size={16} style={{ color: "#059669" }} />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#6B7280", fontSize: "14px" }}>Correct:</span>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid #E5E7EB",
                          borderRadius: "6px",
                          fontSize: "14px",
                          color: "#1a202c"
                        }}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                  <button
                    onClick={addMoreQuestions}
                    style={{ background: "none", border: "none", color: "#7c3aed", fontSize: "14px", cursor: "pointer" }}
                  >
                    + Add More
                  </button>
                  <button
                    onClick={handleSubmitQuestions}
                    disabled={saving}
                    style={{
                      padding: "8px 16px",
                      background: saving ? "#9CA3AF" : "#7c3aed",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: saving ? "not-allowed" : "pointer"
                    }}
                  >
                    {saving ? 'Saving...' : 'Save All'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageExams;