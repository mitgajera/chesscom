import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import "../styles/ChessBoard.css";

interface ChessBoardProps {
  fen: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  playerColor: "white" | "black" | null;
  isSpectator: boolean;
  gameId: string;
  lastMove: { from: string; to: string } | null;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  onDrop,
  playerColor,
  isSpectator,
  gameId,
  lastMove
}) => {
  const [localChess] = useState<Chess>(new Chess());
  const [boardWidth, setBoardWidth] = useState(calculateBoardWidth());
  
  // Update local chess instance whenever FEN changes
  useEffect(() => {
    try {
      localChess.load(fen);
    } catch (error) {
      console.error("Error loading FEN:", error);
    }
  }, [fen, localChess]);
  
  // Update board size on window resize
  useEffect(() => {
    const handleResize = () => {
      setBoardWidth(calculateBoardWidth());
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate if pieces should be draggable based on player role and turn
  const isDraggable = !isSpectator && playerColor && (
    (playerColor === "white" && localChess.turn() === 'w') || 
    (playerColor === "black" && localChess.turn() === 'b')
  );
  
  // Calculate optimal board width based on screen size
  function calculateBoardWidth(): number {
    if (typeof window === 'undefined') return 500;
    
    const width = window.innerWidth;
    
    if (width <= 350) return 300;
    if (width <= 576) return 350;
    if (width <= 768) return 400;
    return 500; // Default for larger screens
  }
  
  // Determine square styles for highlighting last move
  const squareStyles: any = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    squareStyles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
  }

  return (
    <div className="board-container">
      {/* Game ID display */}
      {gameId && (
        <div className="game-id-display">
          <div className="game-id-label">Game ID:</div>
          <div className="game-id">{gameId}</div>
          <button 
            className="copy-button" 
            onClick={() => {
              navigator.clipboard.writeText(gameId);
              const button = document.querySelector('.copy-button');
              if (button) {
                const originalText = button.textContent;
                button.textContent = "Copied!";
                setTimeout(() => {
                  if (button.textContent === "Copied!") {
                    button.textContent = originalText;
                  }
                }, 2000);
              }
            }}
            title="Copy Game ID"
          >
            Copy
          </button>
        </div>
      )}

      {/* Role indicator */}
      <div className={`role-indicator ${isSpectator ? 'spectator' : playerColor || 'white'}`}>
        {isSpectator 
          ? 'Spectating' 
          : `Playing as ${playerColor === 'white' ? 'White ♙' : 'Black ♟'}`}
      </div>

      <Chessboard
        position={fen}
        onPieceDrop={(sourceSquare, targetSquare) => onDrop(sourceSquare, targetSquare)}
        boardOrientation={playerColor || "white"}
        areArrowsAllowed={true}
        arePiecesDraggable={isDraggable}
        animationDuration={200}
        boardWidth={boardWidth}
        customBoardStyle={{
          borderRadius: "5px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)"
        }}
        customDarkSquareStyle={{ backgroundColor: "#b58863" }}
        customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
        customSquareStyles={squareStyles}
      />
    </div>
  );
};

export default ChessBoard;
