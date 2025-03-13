import React from "react";
import "../styles/GameInformation.css";

interface GameInformationProps {
  blackPlayerTime: string;
  whitePlayerTime: string;
  gameStatus: string;
  moveHistory: string[];
}

const GameInformation: React.FC<GameInformationProps> = ({
  blackPlayerTime,
  whitePlayerTime,
  gameStatus,
  moveHistory,
}) => {
  return (
    <div className="game-information">
      <h2>Game Information</h2>
      <div className="player-info">
        <div className="player">
          <span className="player-color black"></span>
          <span>Black Player</span>
          <span className="player-time">{blackPlayerTime}</span>
        </div>
        <div className="player">
          <span className="player-color white"></span>
          <span>White Player</span>
          <span className="player-time">{whitePlayerTime}</span>
        </div>
      </div>
      <div className="game-status">
        <p>{gameStatus}</p>
      </div>
      <div className="move-history">
        <h3>Move History</h3>
        <div className="move-history-table-container">
          <table>
            <thead>
              <tr>
                <th>Move</th>
                <th>White</th>
                <th>Black</th>
              </tr>
            </thead>
            <tbody>
              {moveHistory.length > 0 ? (
                moveHistory.map((move, index) => (
                  <tr key={index}>
                    <td>{Math.ceil((index + 1) / 2)}</td>
                    <td>{index % 2 === 0 ? move : ""}</td>
                    <td>{index % 2 !== 0 ? move : ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No moves yet. The game hasn't started.</td>
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