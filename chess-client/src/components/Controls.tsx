import React from "react";
import "../styles/Controls.css";

interface ControlsProps {
  gameId: string | null;
  gameStatus: string;
  gameResult: string;
  moveHistory: string[];
  createGame: () => void;
  joinGame: () => void;
  joinGameId: string;
  setJoinGameId: React.Dispatch<React.SetStateAction<string>>;
}

const Controls: React.FC<ControlsProps> = ({
  gameId,
  gameStatus,
  gameResult,
  moveHistory,
  createGame,
  joinGame,
  joinGameId,
  setJoinGameId,
}) => {
  return (
    <div className="controls">
      <button onClick={createGame}>Create Game</button>
      <input
        type="text"
        value={joinGameId}
        onChange={(e) => setJoinGameId(e.target.value)}
        placeholder="Enter Game ID"
      />
      <button onClick={joinGame}>Join Game</button>
      {gameId && <p>Game ID: {gameId}</p>}
      <p>Game Status: {gameStatus}</p>
      <p>Game Result: {gameResult}</p>
      <p>Move History: {moveHistory.join(", ")}</p>
    </div>
  );
};

export default Controls;