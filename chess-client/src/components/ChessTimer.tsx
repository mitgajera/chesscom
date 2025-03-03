
import React, { useEffect, useState } from 'react';
import { PieceColor, formatTime } from '@/utils/chessUtils';

interface ChessTimerProps {
  initialTime: number; // in seconds
  currentTurn: PieceColor;
  color: PieceColor;
  isGameActive: boolean;
  onTimeUp: () => void;
}

const ChessTimer: React.FC<ChessTimerProps> = ({
  initialTime,
  currentTurn,
  color,
  isGameActive,
  onTimeUp,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const isActive = isGameActive && currentTurn === color;

  useEffect(() => {
    let timer: number | undefined;

    if (isActive && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, timeLeft, onTimeUp]);

  const getTimerColor = () => {
    if (timeLeft <= 30) return 'text-red-500';
    if (timeLeft <= 60) return 'text-amber-500';
    return isActive ? 'text-primary' : 'text-muted-foreground';
  };

  return (
    <div className={`text-xl font-mono font-bold ${getTimerColor()} transition-colors duration-300 ${
      isActive && timeLeft <= 30 ? 'animate-pulse' : ''
    }`}>
      {formatTime(timeLeft)}
    </div>
  );
};

export default ChessTimer;
