import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home, FileText } from 'lucide-react';

const ExamResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Try to get data from location state first, then from localStorage
    let data = location.state;

    // If no state, try to get from localStorage (in case user refreshed)
    if (!data) {
      const savedResult = localStorage.getItem('lastExamResult');
      if (savedResult) {
        data = JSON.parse(savedResult);
      }
    }

    if (!data) {
      // Don't redirect - just show a message
      setResult({ score: 0, totalQuestions: 0, examTitle: 'Exam', percentage: 0 });
      return;
    }

    // Save to localStorage as backup
    localStorage.setItem('lastExamResult', JSON.stringify(data));
    setResult(data);
  }, [location, navigate]);

  if (!result) {
    return null;
  }

  const { score, totalQuestions, examTitle, submittedAt } = result;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  
  const getGrade = (pct) => {
    if (pct >= 90) return 'A';
    if (pct >= 75) return 'B';
    if (pct >= 60) return 'C';
    return 'F';
  };

  const grade = getGrade(percentage);
  const passed = percentage >= 60;

  const getGradeMessage = (g) => {
    switch(g) {
      case 'A': return "Outstanding performance! You have mastered this topic.";
      case 'B': return "Great job! You have a solid understanding.";
      case 'C': return "Good effort! Review the topics you missed.";
      default: return "Do not give up! Study harder and try again.";
    }
  };

  const getScoreGradient = (pct) => {
    if (pct >= 75) return "linear-gradient(135deg, #059669, #047857)";
    if (pct >= 50) return "linear-gradient(135deg, #D97706, #B45309)";
    return "linear-gradient(135deg, #DC2626, #B91C1C)";
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F3F4F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Success Message */}
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '20px',
        padding: '32px 48px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#D1FAE5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '40px'
        }}>
          ✓
        </div>

        {/* Success Message */}
        <h2 style={{
          color: '#059669',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px'
        }}>
          Exam Submitted Successfully!
        </h2>
        <p style={{
          color: '#6B7280',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          Your answers have been recorded.
        </p>

        {/* Result Card */}
        <div style={{
          background: '#F9FAFB',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          {/* Score Circle */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: getScoreGradient(percentage),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'white'
          }}>
            <span style={{ fontSize: '36px', fontWeight: '700' }}>{percentage}%</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Score</span>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>{score}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Correct</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>{totalQuestions - score}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Wrong</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>{totalQuestions}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>{grade}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Grade</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => navigate('/student/available-exams')}
            style={{
              flex: 1,
              background: 'white',
              color: '#7c3aed',
              border: '2px solid #7c3aed',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Take More Exams
          </button>
          <button
            onClick={() => navigate('/student/dashboard')}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;