import React from "react";
import "../styles/Timers.css";

interface TimersProps {
  whiteTime: number;
  blackTime: number;
  formatTime: (time: number) => string;
}

const Timers: React.FC<TimersProps> = ({ whiteTime, blackTime, formatTime }) => {
  return (
    <div className="timers">
      <div className="timer white-timer">
        White: {formatTime(whiteTime)}
      </div>
      <div className="timer black-timer">
        Black: {formatTime(blackTime)}
      </div>
    </div>
  );
};

export default Timers;