import React, { useState, useEffect } from "react";
import Chessboard from "chessboardjsx";
import { useIsMobile } from "../hooks/use-mobile";

interface ResponsiveBoardProps {
  fen: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  playerColor: "white" | "black";
  isSpectator: boolean;
  lastMove: { from: string, to: string } | null;
  chess: any; // Chess.js instance
}

const ResponsiveBoard: React.FC<ResponsiveBoardProps> = ({
  fen,
  onDrop,
  playerColor,
  isSpectator,
  lastMove,
  chess
}) => {
  const isMobile = useIsMobile();
  const [boardWidth, setBoardWidth] = useState(calculateBoardWidth());
  
  // Calculate optimal board width based on screen size
  function calculateBoardWidth() {
    if (typeof window === 'undefined') return 500;
    
    const width = window.innerWidth;
    
    if (width <= 350) return 280;
    if (width <= 480) return 300;
    if (width <= 576) return 350;
    if (width <= 768) return 400;
    return 500; // Default for larger screens
  }
  
  // Update board size on window resize
  useEffect(() => {
    const handleResize = () => {
      setBoardWidth(calculateBoardWidth());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="board-wrapper">
      <Chessboard
        position={fen}
        onDrop={({ sourceSquare, targetSquare }) => onDrop(sourceSquare, targetSquare)}
        orientation={playerColor}
        draggable={!isSpectator && ((playerColor === "white" && chess.turn() === 'w') || 
                 (playerColor === "black" && chess.turn() === 'b'))}
        width={boardWidth}
        calcWidth={({ screenWidth, screenHeight }) => {
          // Custom calculation to ensure board fits on screen
          const smallerDimension = Math.min(screenWidth, screenHeight);
          if (screenWidth <= 480) return Math.min(300, smallerDimension * 0.9);
          return boardWidth;
        }}
        boardStyle={{
          borderRadius: "5px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)"
        }}
        lightSquareStyle={{ backgroundColor: "#f0d9b5" }}
        darkSquareStyle={{ backgroundColor: "#b58863" }}
        squareStyles={lastMove ? {
          [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
          [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
        } : {}}
      />
    </div>
  );
};

export default ResponsiveBoard;