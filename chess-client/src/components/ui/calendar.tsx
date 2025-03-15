import React from 'react';

interface CalendarProps {
  date?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export function Calendar({ date, onSelect, className }: CalendarProps) {
  return (
    <div className={className}>
      <div>Simplified Calendar Component</div>
      <button onClick={() => onSelect && onSelect(new Date())}>
        Select Today
      </button>
    </div>
  );
}