import React from "react";
import "../styles/Controls.css";
import { Move } from 'chess.js';

type ControlsProps = {
  gameId: string;
  gameStatus: string;
  gameResult: string;
  moveHistory: string[];
  createGame: () => void;
  joinGame: () => void;
  joinGameId: string;
  setJoinGameId: React.Dispatch<React.SetStateAction<string>>;
  resignGame: () => void;
  offerDraw: () => void;
};

const Controls: React.FC<ControlsProps> = ({
  gameId,
  gameStatus,
  gameResult,
  moveHistory,
  createGame,
  joinGame,
  joinGameId,
  setJoinGameId,
  resignGame,
  offerDraw,
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
      <button onClick={resignGame}>Resign</button>
      <button onClick={offerDraw}>Offer Draw</button>
    </div>
  );
};

export default Controls;