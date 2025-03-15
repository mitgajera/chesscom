import React from 'react';
import '../styles/Controls.css';

interface ControlsProps {
  isWhite: boolean;
  isBlack: boolean;
  isSpectator: boolean;
  createGame: () => void;
  joinGame: () => void;
  joinGameId: string;
  setJoinGameId: React.Dispatch<React.SetStateAction<string>>;
}

const Controls: React.FC<ControlsProps> = ({
  isWhite,
  isBlack,
  isSpectator,
  createGame,
  joinGame,
  joinGameId,
  setJoinGameId
}) => {
  return (
    <div className="controls-container horizontal">
      <div className="control-buttons">
        <button 
          onClick={createGame}
          className="control-button create-game"
          disabled={isWhite || isBlack || isSpectator}
        >
          Create Game
        </button>
        
        <div className="join-game-controls">
          <input
            type="text"
            placeholder="Enter Game ID"
            value={joinGameId}
            onChange={(e) => setJoinGameId(e.target.value)}
            className="game-id-input"
          />
          <button 
            onClick={joinGame}
            className="control-button join-game"
            disabled={isWhite || isBlack || isSpectator}
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;