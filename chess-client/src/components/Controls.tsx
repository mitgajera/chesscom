import React from "react";
import "../styles/Controls.css";

interface ControlsProps {
  createGame: () => void;
  joinGame: () => void;
  joinGameId: string;
  setJoinGameId: (id: string) => void;
}

const Controls: React.FC<ControlsProps> = ({ createGame, joinGame, joinGameId, setJoinGameId }) => {
  return (
    <div className="controls">
      <button onClick={createGame}>Create Game</button>
      <input
        type="text"
        placeholder="Enter Game ID"
        value={joinGameId}
        onChange={(e) => setJoinGameId(e.target.value)}
      />
      <button onClick={joinGame}>Join Game</button>
    </div>
  );
};

export default Controls;