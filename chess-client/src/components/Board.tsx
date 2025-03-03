
import React, { useState } from 'react';
import Piece from './Piece';
import { ChessPiece, FILES, RANKS, isLightSquare, GameState } from '@/utils/chessUtils';

interface BoardProps {
  gameState: GameState;
  onSquareClick: (square: string) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onSquareClick }) => {
  const { board, selectedSquare, validMoves } = gameState;
  
  // Function to determine square styling
  const getSquareClassName = (file: string, rank: string) => {
    const square = `${file}${rank}`;
    const isLight = isLightSquare(file, rank);
    const isSelected = selectedSquare === square;
    const isValidMove = validMoves.includes(square);
    
    let className = "relative w-full h-full flex items-center justify-center board-square";
    
    // Base color
    className += isLight 
      ? " bg-chessLight border-chessLight" 
      : " bg-chessDark border-chessDark";
    
    // Selection and valid move highlights
    if (isSelected) {
      className += " ring-2 ring-inset ring-yellow-400";
    } else if (isValidMove) {
      className += " after:absolute after:w-1/4 after:h-1/4 after:rounded-full after:bg-yellow-400/50 after:animate-pulse";
    }
    
    return className;
  };

  // Render board coordinates
  const renderCoordinates = () => {
    return (
      <>
        {/* File coordinates (a-h) at the bottom */}
        <div className="absolute bottom-0 left-0 w-full flex">
          {FILES.map((file, index) => (
            <div key={file} className="w-1/8 flex-1 h-6 flex justify-center items-center text-xs font-medium text-muted-foreground">
              {file}
            </div>
          ))}
        </div>
        
        {/* Rank coordinates (1-8) on the left */}
        <div className="absolute top-0 left-0 h-full flex flex-col">
          {[...RANKS].reverse().map((rank, index) => (
            <div key={rank} className="h-1/8 flex-1 w-6 flex justify-center items-center text-xs font-medium text-muted-foreground">
              {rank}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto shadow-board rounded-md overflow-hidden border border-chessBorder">
      {/* Board squares with pieces */}
      <div className="w-full h-full grid grid-cols-8 grid-rows-8">
        {[...RANKS].reverse().map((rank) => (
          FILES.map((file) => {
            const square = `${file}${rank}`;
            const piece = board[square];
            
            return (
              <div 
                key={square} 
                className={getSquareClassName(file, rank)}
                onClick={() => onSquareClick(square)}
              >
                {piece && <Piece piece={piece} isDragging={selectedSquare === square} />}
                
                {/* Valid move indicator */}
                {validMoves.includes(square) && !piece && (
                  <div className="absolute w-1/4 h-1/4 rounded-full bg-yellow-400/50 move-indicator"></div>
                )}
                
                {/* Capture indicator */}
                {validMoves.includes(square) && piece && (
                  <div className="absolute inset-0 rounded-sm ring-2 ring-yellow-400/70 move-indicator"></div>
                )}
              </div>
            );
          })
        ))}
      </div>
      
      {/* Coordinates */}
      {renderCoordinates()}
    </div>
  );
};

export default Board;
