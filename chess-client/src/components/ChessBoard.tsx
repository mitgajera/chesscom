import React, { useState, useEffect } from "react";
import Chessboard from "chessboardjsx";
import "../styles/ChessBoard.css";

interface ChessBoardProps {
  fen: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  playerColor: "white" | "black";
  isSpectator: boolean;
  gameId: string;
  lastMove: { from: string, to: string } | null;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  onDrop,
  playerColor,
  isSpectator,
  gameId,
  lastMove
}) => {
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

      {/* User role indicator */}
      <div className={`role-indicator ${isSpectator ? 'spectator' : playerColor}`}>
        {isSpectator 
          ? 'Spectating' 
          : `Playing as ${playerColor === 'white' ? 'White ♙' : 'Black ♟'}`}
      </div>

      <Chessboard
        position={fen}
        onDrop={({ sourceSquare, targetSquare }) => onDrop(sourceSquare, targetSquare)}
        orientation={playerColor}
        draggable={!isSpectator && 
          ((playerColor === "white" && fen.split(' ')[1] === 'w') || 
           (playerColor === "black" && fen.split(' ')[1] === 'b'))}
        width={calculateBoardWidth()}
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

// Helper function to calculate responsive board width
function calculateBoardWidth(): number {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    
    if (width <= 480) return 280; // Mobile
    if (width <= 768) return 350; // Tablet
    if (width <= 1024) return 400; // Small desktop
    
    return 500; // Default size
  }
  return 500;
}

export default ChessBoard;
