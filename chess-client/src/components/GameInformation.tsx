import React from "react";
import "../styles/GameInformation.css"; // Update this path to match your project structure

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
          <div>
            <span className="player-color black"></span>
            <span>Black</span>
          </div>
          <span className="player-time">{blackPlayerTime}</span>
        </div>
        <div className="player">
          <div>
            <span className="player-color white"></span>
            <span>White</span>
          </div>
          <span className="player-time">{whitePlayerTime}</span>
        </div>
      </div>
      <div className="game-status">
        <p style={{ margin: 0 }}>{gameStatus === "ongoing" ? "Game in progress" : "Game over"}</p>
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
                Array(Math.ceil(moveHistory.length / 2))
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{moveHistory[i * 2] || ""}</td>
                      <td>{moveHistory[i * 2 + 1] || ""}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={3}>No moves yet</td>
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