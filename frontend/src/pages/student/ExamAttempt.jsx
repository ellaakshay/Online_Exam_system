import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExamById, submitResult } from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';

const ExamAttempt = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await getExamById(examId);
        // Handle both response formats: response.data.data or response.data
        const examData = response.data.data || response.data;
        setExam(examData);
        setTimeLeft(examData.duration * 60);
      } catch (error) {
        console.error('Error fetching exam:', error);
        toast.error('Failed to load exam');
        navigate('/student/available-exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, [exam, timeLeft]);

  // Format time as MM:SS (or HH:MM:SS if > 1 hour)
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Timer color logic
  const getTimerStyle = () => {
    if (timeLeft <= 300) { // ≤ 5 minutes = DANGER
      return {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '2px solid #DC2626',
        animation: 'pulse 1s infinite'
      };
    }
    if (timeLeft <= 600) { // ≤ 10 minutes = WARNING
      return {
        background: '#FEF3C7',
        color: '#92400E',
        border: '2px solid #F59E0B'
      };
    }
    return { // normal
      background: '#F3F4F6',
      color: '#1a202c',
      border: '2px solid #E5E7EB'
    };
  };

  const handleAnswerChange = (answer) => {
    const questionId = exam.questions[currentIndex]._id;
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleAutoSubmit = async () => {
    clearInterval(timerRef.current);
    toast('⏰ Time is up! Auto-submitting your exam...', {
      duration: 3000,
      style: { background: '#DC2626', color: 'white' }
    });
    setSubmitting(true);
    
    try {
      const answersArray = questions.map(q => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || ""
      }));
      
      const res = await submitResult({ examId, answers: answersArray });
      
      navigate('/student/exam-result', {
        state: {
          score: res.data.score,
          totalQuestions: res.data.totalQuestions,
          percentage: res.data.percentage,
          examTitle: exam.title,
          submittedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit');
      navigate('/student/available-exams');
    }
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);

    try {
      // Build answers array in correct backend format
      const answersArray = questions.map(q => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || ""
        // empty string if student skipped this question
      }));

      console.log("Submitting answers:", {
        examId: examId,
        answers: answersArray
      });

      const res = await submitResult({ examId, answers: answersArray });

      console.log("Submit response:", res.data);

      // Get the score data - handle both response formats
      const score = res.data.score ?? res.data.data?.score;
      const totalQuestions = res.data.totalQuestions ?? res.data.data?.totalQuestions;
      const percentage = res.data.percentage ?? res.data.data?.percentage;

      toast.success(
        `Exam submitted successfully! Score: ${score}/${totalQuestions}`
      );

      // Navigate to result page with data (using replace to prevent back loop)
      navigate('/student/exam-result', {
        state: {
          score: score,
          totalQuestions: totalQuestions,
          percentage: percentage,
          examTitle: exam.title,
          submittedAt: new Date().toISOString()
        },
        replace: true
      });
    } catch (error) {
      console.error("Submit error:", error.response?.data);
      // If 401, don't logout - just show error
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to submit. Try again."
        );
      }
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.02); } }`}</style>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6B7280' }}>Exam not found</div>
      </div>
    );
  }

  const questions = exam.questions || [];
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];
  const timerStyle = getTimerStyle();

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      {/* Top Bar */}
      <div style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ color: '#1a202c', fontWeight: '600', fontSize: '18px' }}>{exam.title}</h1>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          
          {/* Timer Display */}
          <div style={{
            ...timerStyle,
            padding: '10px 24px',
            borderRadius: '12px',
            fontSize: '28px',
            fontWeight: '700',
            fontFamily: 'monospace',
            letterSpacing: '2px',
            minWidth: '120px',
            textAlign: 'center'
          }}>
            ⏱ {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Send size={16} />
            Submit
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 16px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {currentQuestion && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: '#6B7280' }}>Question {currentIndex + 1} of {questions.length}</span>
                <div style={{ width: '200px', height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <h2 style={{ color: '#1a202c', fontSize: '18px', fontWeight: '500', marginBottom: '24px' }}>{currentQuestion.questionText}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['A', 'B', 'C', 'D'].map((opt, i) => {
                  const optionText = currentQuestion.options[i];
                  const isSelected = answers[currentQuestion._id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerChange(opt)}
                      style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '10px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.2s',
                        border: isSelected ? '2px solid #7c3aed' : '2px solid #E5E7EB',
                        background: isSelected ? '#EDE9FE' : 'white',
                        color: isSelected ? '#7c3aed' : '#374151',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        background: isSelected ? '#7c3aed' : '#F3F4F6',
                        color: isSelected ? 'white' : '#6B7280',
                        flexShrink: 0
                      }}>
                        {opt}
                      </span>
                      <span>{optionText}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
                <button
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: '#F3F4F6',
                    color: '#6B7280',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentIndex === 0 ? 0.5 : 1
                  }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                  disabled={currentIndex === questions.length - 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: currentIndex === questions.length - 1 ? 0.5 : 1
                  }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertCircle size={24} style={{ color: '#F59E0B' }} />
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>Confirm Submission</h2>
            </div>
            <p style={{ color: '#6B7280', marginBottom: '8px' }}>
              You have answered <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
            </p>
            {answeredCount < questions.length && (
              <p style={{ color: '#D97706', fontSize: '14px', marginBottom: '16px' }}>
                ⚠ You have {questions.length - answeredCount} unanswered questions.
              </p>
            )}
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  color: '#374151',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Review
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.5 : 1
                }}
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.02); } }`}</style>
    </div>
  );
};

export default ExamAttempt;