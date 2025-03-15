import React, { useEffect, useRef } from "react";
import "../styles/GameInformation.css";

interface GameInformationProps {
  blackPlayerTime: string;
  whitePlayerTime: string;
  gameStatus: string;
  moveHistory: (string | { san: string })[];
  currentPlayer: string;
  playerColor: string;
  isSpectator?: boolean;
}

const GameInformation: React.FC<GameInformationProps> = ({
  blackPlayerTime,
  whitePlayerTime,
  gameStatus,
  moveHistory,
  currentPlayer,
  playerColor,
  isSpectator = false
}) => {
  // Create a ref to access the move history container
  const moveHistoryContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of move history whenever it updates
  useEffect(() => {
    if (moveHistoryContainerRef.current) {
      moveHistoryContainerRef.current.scrollTop = moveHistoryContainerRef.current.scrollHeight;
    }
  }, [moveHistory]);

  // Format move history to show in pairs (white and black moves together)
  const formattedMoveHistory = [];
  for (let i = 0; i < Math.ceil(moveHistory.length / 2); i++) {
    const whiteMove = moveHistory[i * 2];
    const blackMove = moveHistory[i * 2 + 1];
    
    formattedMoveHistory.push({
      moveNumber: i + 1,
      white: typeof whiteMove === 'string' ? whiteMove : whiteMove?.san || "",
      black: typeof blackMove === 'string' ? blackMove : blackMove?.san || ""
    });
  }

  return (
    <div className="game-information">
      <h2>Game Information</h2>
      <div className="player-info">
        <div className={`player ${currentPlayer === "black" ? "active-player" : ""}`}>
          <div className="player-label">
            <span className="player-color black"></span>
            <span>Black</span>
          </div>
          <span className="player-time">{blackPlayerTime}</span>
        </div>
        <div className={`player ${currentPlayer === "white" ? "active-player" : ""}`}>
          <div className="player-label">
            <span className="player-color white"></span>
            <span>White</span>
          </div>
          <span className="player-time">{whitePlayerTime}</span>
        </div>
      </div>
      
      <div className="game-status">
        {gameStatus === "ongoing" ? (
          <p className={currentPlayer === playerColor && !isSpectator ? "your-turn" : ""}>
            {isSpectator 
              ? `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} to move`
              : currentPlayer === playerColor 
                ? "Your turn to move" 
                : "Waiting for opponent"}
          </p>
        ) : (
          <p className="game-over">Game over</p>
        )}
      </div>
      
      <div className="move-history">
        <h3>Move History</h3>
        <div className="move-history-table-container" ref={moveHistoryContainerRef}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>White</th>
                <th>Black</th>
              </tr>
            </thead>
            <tbody>
              {formattedMoveHistory.length > 0 ? (
                formattedMoveHistory.map((move, i) => (
                  <tr 
                    key={i} 
                    className={i === formattedMoveHistory.length - 1 && 
                      (moveHistory.length % 2 === 0 || !move.black) ? "latest-move" : ""}
                  >
                    <td>{move.moveNumber}</td>
                    <td className={i === formattedMoveHistory.length - 1 && moveHistory.length % 2 !== 0 ? "latest-move-cell" : ""}>
                      {move.white}
                    </td>
                    <td className={i === formattedMoveHistory.length - 1 && moveHistory.length % 2 === 0 && move.black ? "latest-move-cell" : ""}>
                      {move.black}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="no-moves">No moves yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GameInformation;
