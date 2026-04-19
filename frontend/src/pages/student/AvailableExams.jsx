import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import toast from "react-hot-toast";

// ── Countdown hook ──────────────────────────────────────────
// Returns { days, hours, minutes, seconds, isPast }
function useCountdown(targetDateStr) {
  const calculate = () => {
    const diff = new Date(targetDateStr) - new Date();
    if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, isPast:true };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
      isPast:  false,
    };
  };

  const [time, setTime] = useState(calculate);

  useEffect(() => {
    const id = setInterval(() => setTime(calculate()), 1000);
    return () => clearInterval(id);
  }, [targetDateStr]);

  return time;
}

// ── Single exam card ────────────────────────────────────────
function ExamCard({ exam, myResults, onStart }) {
  const countdown = useCountdown(exam.scheduledAt);

  // Check if student already attempted
  const attempted = myResults.some(r => {
    const rId = typeof r.examId === "object" ? r.examId?._id : r.examId;
    return rId?.toString() === exam._id?.toString();
  });

  const result = myResults.find(r => {
    const rId = typeof r.examId === "object" ? r.examId?._id : r.examId;
    return rId?.toString() === exam._id?.toString();
  });

  const percentage = result
    ? Math.round((result.score / result.totalQuestions) * 100)
    : 0;

  // Format scheduled date nicely
  const formattedDate = exam.scheduledAt 
    ? new Date(exam.scheduledAt).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    : "No schedule";

  // Card top border color
  const borderColor = attempted
    ? "#059669"
    : countdown.isPast
    ? "#7c3aed"
    : "#F59E0B";

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      border: "1px solid #F3F4F6",
      borderTop: `4px solid ${borderColor}`,
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>

      {/* ── Status badge row ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ fontSize:"17px", fontWeight:"700", color:"#1a202c", margin:0 }}>
          {exam.title}
        </h3>

        {attempted ? (
          <span style={{
            background:"#D1FAE5", color:"#065F46",
            padding:"4px 12px", borderRadius:"20px",
            fontSize:"12px", fontWeight:"600",
          }}>✓ Attempted</span>
        ) : countdown.isPast ? (
          <span style={{
            background:"#EDE9FE", color:"#5B21B6",
            padding:"4px 12px", borderRadius:"20px",
            fontSize:"12px", fontWeight:"600",
          }}>🟢 Live Now</span>
        ) : (
          <span style={{
            background:"#FEF3C7", color:"#92400E",
            padding:"4px 12px", borderRadius:"20px",
            fontSize:"12px", fontWeight:"600",
          }}>⏳ Upcoming</span>
        )}
      </div>

      {/* ── Description ── */}
      {exam.description && (
        <p style={{
          fontSize:"14px", color:"#6B7280",
          margin:0, lineHeight:"1.5",
          display:"-webkit-box",
          WebkitLineClamp:2,
          WebkitBoxOrient:"vertical",
          overflow:"hidden",
        }}>
          {exam.description}
        </p>
      )}

      {/* ── Info badges ── */}
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
        <span style={{
          background:"#EDE9FE", color:"#5B21B6",
          padding:"4px 10px", borderRadius:"20px", fontSize:"12px",
        }}>
          ⏱ {exam.duration} mins
        </span>
        <span style={{
          background:"#DBEAFE", color:"#1D4ED8",
          padding:"4px 10px", borderRadius:"20px", fontSize:"12px",
        }}>
          📝 {exam.questionCount || 0} Questions
        </span>
        <span style={{
          background:"#F3F4F6", color:"#374151",
          padding:"4px 10px", borderRadius:"20px", fontSize:"12px",
        }}>
          📅 {formattedDate}
        </span>
      </div>

      {/* ── Countdown OR score box ── */}
      {attempted ? (
        // Show score if already attempted
        <div style={{
          background:"#F0FDF4", borderRadius:"12px", padding:"16px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <div>
            <p style={{ fontSize:"12px", color:"#6B7280", margin:"0 0 4px" }}>
              Your Score
            </p>
            <p style={{ fontSize:"22px", fontWeight:"700", color:"#059669", margin:0 }}>
              {result.score} / {result.totalQuestions}
            </p>
          </div>
          <div style={{
            width:"56px", height:"56px", borderRadius:"50%",
            background: percentage >= 75
              ? "linear-gradient(135deg,#059669,#047857)"
              : percentage >= 50
              ? "linear-gradient(135deg,#D97706,#B45309)"
              : "linear-gradient(135deg,#DC2626,#B91C1C)",
            color:"white",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"15px", fontWeight:"700",
          }}>
            {percentage}%
          </div>
        </div>
      ) : !countdown.isPast ? (
        // Show live countdown before scheduled time
        <div style={{
          background:"#FFFBEB", borderRadius:"12px", padding:"16px",
          textAlign:"center", border:"1px dashed #F59E0B",
        }}>
          <p style={{ fontSize:"12px", color:"#92400E", margin:"0 0 8px", fontWeight:"600" }}>
            EXAM STARTS IN
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:"8px" }}>
            {countdown.days > 0 && (
              <TimeBox value={countdown.days} label="Days" />
            )}
            <TimeBox value={countdown.hours}   label="Hrs"  />
            <TimeBox value={countdown.minutes} label="Min"  />
            <TimeBox value={countdown.seconds} label="Sec"  />
          </div>
        </div>
      ) : null }

      {/* ── Action buttons ── */}
      <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
        {attempted ? (
          <>
            <button
              onClick={() => onStart(exam._id)}
              style={{
                flex:1, padding:"10px",
                background:"white", color:"#7c3aed",
                border:"2px solid #7c3aed",
                borderRadius:"10px", fontWeight:"600",
                cursor:"pointer", fontSize:"14px",
              }}
            >
              Retake Exam
            </button>
            <button
              onClick={() => window.location.href = "/student/my-results"}
              style={{
                flex:1, padding:"10px",
                background:"#F0FDF4", color:"#059669",
                border:"1px solid #D1FAE5",
                borderRadius:"10px", fontWeight:"600",
                cursor:"pointer", fontSize:"14px",
              }}
            >
              View Result
            </button>
          </>
        ) : countdown.isPast ? (
          // Time has passed — show active Start Exam button
          <button
            onClick={() => onStart(exam._id)}
            style={{
              width:"100%", padding:"13px",
              background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
              color:"white", border:"none",
              borderRadius:"10px", fontWeight:"700",
              cursor:"pointer", fontSize:"15px",
              boxShadow:"0 4px 12px rgba(124,58,237,0.3)",
            }}
          >
            Start Exam →
          </button>
        ) : (
          // Exam not started yet — disabled button
          <button
            disabled
            style={{
              width:"100%", padding:"13px",
              background:"#F3F4F6",
              color:"#9CA3AF", border:"1px solid #E5E7EB",
              borderRadius:"10px", fontWeight:"600",
              cursor:"not-allowed", fontSize:"15px",
            }}
          >
            🔒 Not Started Yet
          </button>
        )}
      </div>
    </div>
  );
}

// ── Small time box for countdown display ────────────────────
function TimeBox({ value, label }) {
  return (
    <div style={{
      background:"white", borderRadius:"8px",
      padding:"8px 12px", textAlign:"center",
      border:"1px solid #FDE68A", minWidth:"52px",
    }}>
      <div style={{ fontSize:"22px", fontWeight:"700", color:"#92400E", lineHeight:1 }}>
        {String(value).padStart(2,"0")}
      </div>
      <div style={{ fontSize:"10px", color:"#B45309", marginTop:"2px", fontWeight:"600" }}>
        {label}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function AvailableExams() {
  const [exams,     setExams]     = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, rRes] = await Promise.all([
          API.get("/exams/available"),
          API.get("/results/my"),
        ]);
        setExams(eRes.data);
        setMyResults(rRes.data);
      } catch (err) {
        toast.error("Failed to load exams");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStart = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  // Filter by tab — NEVER filter by date
  const filtered = exams.filter(exam => {
    const attempted = myResults.some(r => {
      const rId = typeof r.examId === "object" ? r.examId?._id : r.examId;
      return rId?.toString() === exam._id?.toString();
    });
    if (tab === "attempted")     return attempted;
    if (tab === "not-attempted") return !attempted;
    return true; // "all"
  });

  if (loading) {
    return (
      <div style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar />
        <div style={{
          marginLeft:"260px", flex:1,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <p style={{ color:"#6B7280", fontSize:"16px" }}>Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F3F4F6" }}>
      <Sidebar />

      <main style={{ marginLeft:"260px", flex:1, padding:"32px" }}>

        {/* Header */}
        <div style={{ marginBottom:"24px" }}>
          <h1 style={{ fontSize:"26px", fontWeight:"700", color:"#1a202c", margin:0 }}>
            Available Exams
          </h1>
          <p style={{ color:"#6B7280", marginTop:"4px", fontSize:"14px" }}>
            {exams.length} exam{exams.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
          {[
            { key:"all",          label:`All (${exams.length})` },
            { key:"not-attempted",label:"Not Attempted" },
            { key:"attempted",    label:"Attempted" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding:"8px 20px", borderRadius:"20px",
                border: tab === t.key ? "none" : "1px solid #E5E7EB",
                background: tab === t.key ? "#7c3aed" : "white",
                color: tab === t.key ? "white" : "#6B7280",
                fontWeight:"500", cursor:"pointer", fontSize:"14px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Exam grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign:"center", padding:"60px",
            background:"white", borderRadius:"16px",
          }}>
            <p style={{ fontSize:"48px" }}>📋</p>
            <p style={{ fontSize:"18px", fontWeight:"600", color:"#374151" }}>
              No exams found
            </p>
            <p style={{ color:"#6B7280" }}>
              Check back later — your instructor will add exams soon.
            </p>
          </div>
        ) : (
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))",
            gap:"24px",
          }}>
            {filtered.map(exam => (
              <ExamCard
                key={exam._id}
                exam={exam}
                myResults={myResults}
                onStart={handleStart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}