import React, { useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { enhanceForTouchDevices, preventZoomOnBoard } from '../utils/TouchEnhancer';
import '../styles/ChessBoard.css';

const ResponsiveBoard = ({ 
  position, 
  onDrop, 
  orientation, 
  lastMove,
  currentPlayer,
  gameOver,
  isSpectator,
  playerColor
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const isTouchDevice = enhanceForTouchDevices();
    
    if (isTouchDevice && boardRef.current) {
      preventZoomOnBoard(boardRef.current);
    }
    
    // Handle orientation changes
    const handleOrientationChange = () => {
      // Force redraw after orientation change
      if (boardRef.current) {
        setTimeout(() => {
          if (boardRef.current) {
            const currentWidth = boardRef.current.offsetWidth;
            boardRef.current.style.width = `${currentWidth - 1}px`;
            setTimeout(() => {
              if (boardRef.current) {
                boardRef.current.style.width = '';
              }
            }, 50);
          }
        }, 300);
      }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);
  
  // Calculate square styles for highlighting the last move
  const squareStyles = lastMove ? {
    [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
    [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
  } : {};
  
  // Only allow dragging pieces if it's the player's turn and they're not a spectator
  const isDraggable = !isSpectator && !gameOver && currentPlayer === playerColor;
  
  // Custom piece dragging behavior for touch devices
  const customPieceDragBeginHandler = () => {
    // Add haptic feedback if available (iOS)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    return true;
  };
  
  return (
    <div className="responsive-board" ref={boardRef}>
      <Chessboard
        position={position}
        onPieceDrop={onDrop}
        boardOrientation={orientation || 'white'}
        customSquareStyles={squareStyles}
        isDraggablePiece={({ piece }) => {
          if (isSpectator || gameOver) return false;
          const pieceColor = piece[0] === 'w' ? 'white' : 'black';
          return currentPlayer === pieceColor && playerColor === pieceColor;
        }}
        onPieceDragBegin={customPieceDragBeginHandler}
        customDarkSquareStyle={{ backgroundColor: '#779952' }}
        customLightSquareStyle={{ backgroundColor: '#edeed1' }}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        boardWidth={undefined}
      />
    </div>
  );
};

export default ResponsiveBoard;
