// filepath: frontend/src/components/Timer.jsx
import { useState, useEffect } from 'react';

const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 300; // 5 minutes
  const isCritical = timeLeft <= 60; // 1 minute

  return (
    <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
      isCritical ? 'bg-red-500' : isLowTime ? 'bg-orange-500' : 'bg-blue-500'
    } text-white font-bold text-xl`}>
      ⏰ {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;