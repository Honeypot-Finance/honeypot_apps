import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialTime: string
  onComplete?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  initialTime, 
  onComplete 
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    // Convert HH:MM:SS to total seconds
    const getSecondsFromTime = (time: string) => {
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };
    
    // Convert total seconds back to HH:MM:SS format
    const formatTime = (totalSeconds: number) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    let totalSeconds = getSecondsFromTime(initialTime);
    
    // If time is already at 00:00:00, don't start the countdown
    if (totalSeconds === 0) {
      setTimeLeft('00:00:00');
      return;
    }
    
    const intervalId = setInterval(() => {
      totalSeconds -= 1;
      
      if (totalSeconds <= 0) {
        clearInterval(intervalId);
        setTimeLeft('00:00:00');
        if (onComplete) onComplete();
      } else {
        setTimeLeft(formatTime(totalSeconds));
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [initialTime, onComplete]);
  
  return <span>{timeLeft}</span>;
};
