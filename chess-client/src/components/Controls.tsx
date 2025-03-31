import React from 'react';
import '../styles/Controls.css';

interface ControlsProps {
  gameId: string;
  createGame: () => void;
  joinGame: () => void;
  spectateGame: () => void;
  joinGameId: string;
  setJoinGameId: React.Dispatch<React.SetStateAction<string>>;
  resignGame: () => void;
  offerDraw: () => void;
  gameStatus: string;
  isWhite: boolean;
  isBlack: boolean;
  isSpectator: boolean;
  isConnected: boolean;
  isMobile?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  gameId,
  createGame,
  joinGame,
  spectateGame,
  joinGameId,
  setJoinGameId,
  resignGame,
  offerDraw,
  gameStatus,
  isWhite,
  isBlack,
  isSpectator,
  isConnected
}) => {
  const hasActiveGame = Boolean(gameId) && (isWhite || isBlack || isSpectator);
  
  return (
    <div className="controls-container">
      <div className="control-buttons">
        <button 
          onClick={createGame}
          className="control-button create-game"
          disabled={!isConnected || hasActiveGame}
          title={!isConnected ? "Connect to server first" : hasActiveGame ? "Already in a game" : "Create a new game"}
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
            disabled={!isConnected || hasActiveGame}
          />
          <button 
            onClick={joinGame}
            className="control-button join-game"
            disabled={!isConnected || hasActiveGame || !joinGameId.trim()}
            title={!isConnected ? "Connect to server first" : 
                  hasActiveGame ? "Already in a game" : 
                  !joinGameId.trim() ? "Enter a game ID" : "Join game"}
          >
            Join Game
          </button>
          <button 
            onClick={spectateGame}
            className="control-button spectate-game"
            disabled={!isConnected || hasActiveGame || !joinGameId.trim()}
            title={!isConnected ? "Connect to server first" : 
                  hasActiveGame ? "Already in a game" : 
                  !joinGameId.trim() ? "Enter a game ID" : "Spectate game"}
          >
            Spectate
          </button>
        </div>
        
        {gameId && gameStatus === "ongoing" && !isSpectator && (
          <div className="game-actions">
            <button
              onClick={resignGame}
              className="control-button resign-game"
              disabled={!isConnected}
            >
              Resign
            </button>
            
            <button
              onClick={offerDraw}
              className="control-button draw-game"
              disabled={!isConnected}
            >
              Offer Draw
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;