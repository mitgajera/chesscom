
import React from 'react';
import { ChessPiece } from '../utils/chessUtils';

interface PieceProps {
  piece: ChessPiece;
  isDragging?: boolean;
}

const Piece: React.FC<PieceProps> = ({ piece, isDragging = false }) => {
  const { type, color } = piece;
  
  // SVG paths for chess pieces
  const getSvgPath = () => {
    switch (type) {
      case 'pawn':
        return color === 'white'
          ? 'M22 9c0 1.1-.9 2-2 2h-6l-2 5h8c1.1 0 2 .9 2 2v7h-3v-3h-8v3H8v-7c0-1.1.9-2 2-2h8l-2-5h-6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v3z'
          : 'M22 9c0 1.1-.9 2-2 2h-6l-2 5h8c1.1 0 2 .9 2 2v7h-3v-3h-8v3H8v-7c0-1.1.9-2 2-2h8l-2-5h-6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v3z';
      case 'knight':
        return color === 'white'
          ? 'M19 22H5v-2h14v2M13 2V1h-2v1H8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1v2H7c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-2v-2h1c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-3z'
          : 'M19 22H5v-2h14v2M13 2V1h-2v1H8c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1v2H7c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2h-2v-2h1c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-3z';
      case 'bishop':
        return color === 'white'
          ? 'M8 16l1.5-3 2.5 3 2.5-3 1.5 3h2v2H6v-2h2zm8-10V4H8v2h8z'
          : 'M8 16l1.5-3 2.5 3 2.5-3 1.5 3h2v2H6v-2h2zm8-10V4H8v2h8z';
      case 'rook':
        return color === 'white'
          ? 'M5 20h14v2H5v-2zm0-2h2v-1h10v1h2v-8h-2V7h-3V4H10v3H7v3H5v8zm2-6h10v4H7v-4z'
          : 'M5 20h14v2H5v-2zm0-2h2v-1h10v1h2v-8h-2V7h-3V4H10v3H7v3H5v8zm2-6h10v4H7v-4z';
      case 'queen':
        return color === 'white'
          ? 'M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5.5 2c-.83 0-1.5.67-1.5 1.5S5.67 17 6.5 17s1.5-.67 1.5-1.5S7.33 14 6.5 14zm11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM5 20v-2h14v2H5z'
          : 'M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5.5 2c-.83 0-1.5.67-1.5 1.5S5.67 17 6.5 17s1.5-.67 1.5-1.5S7.33 14 6.5 14zm11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM5 20v-2h14v2H5z';
      case 'king':
        return color === 'white'
          ? 'M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-1 20v-6h2v6h-2zm6-8l-1 1H8l-1-1V9h10v6z'
          : 'M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-1 20v-6h2v6h-2zm6-8l-1 1H8l-1-1V9h10v6z';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
        isDragging ? 'z-10 scale-110' : 'z-0'
      }`}
    >
      <div 
        className={`relative w-4/5 h-4/5 chess-piece-shadow transition-transform ${
          isDragging ? 'scale-110' : ''
        }`}
      >
        <svg 
          viewBox="0 0 24 24" 
          className={`w-full h-full transition-transform duration-200 ${
            isDragging ? 'scale-110' : 'hover:scale-105'
          }`}
          fill={color === 'white' ? '#FFFFFF' : '#333333'}
          stroke={color === 'white' ? '#333333' : '#FFFFFF'}
          strokeWidth="0.6"
        >
          <path d={getSvgPath()} />
        </svg>
      </div>
    </div>
  );
};

export default Piece;
