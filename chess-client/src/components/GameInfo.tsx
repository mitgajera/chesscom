
import React from 'react';
import PlayerInfo from './PlayerInfo';
import MoveHistory from './MoveHistory';
import { GameState } from '@/utils/chessUtils';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, Play, Pause, SkipForward, Clock, Trophy
} from 'lucide-react';

interface GameInfoProps {
  gameState: GameState;
  onNewGame: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onFlipBoard?: () => void; // Optional prop for flipping the board
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  onNewGame,
  onResign,
  onOfferDraw,
  onFlipBoard,
}) => {
  const { whitePlayer, blackPlayer, currentTurn, status, moves } = gameState;
  const isGameActive = status === 'in_progress' || status === 'check';
  const isGameOver = status === 'checkmate' || status === 'stalemate' || status === 'draw';

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Players info */}
      <div className="space-y-2">
        <PlayerInfo 
          player={blackPlayer} 
          isActive={isGameActive && currentTurn === 'black'} 
        />
        <PlayerInfo 
          player={whitePlayer} 
          isActive={isGameActive && currentTurn === 'white'} 
        />
      </div>

      {/* Game status */}
      <div className="text-center py-2 px-4 rounded-lg bg-muted/50">
        {status === 'not_started' && (
          <span className="text-muted-foreground">Game not started</span>
        )}
        {status === 'in_progress' && (
          <span className="font-medium">
            {currentTurn === 'white' ? "White's" : "Black's"} turn
          </span>
        )}
        {status === 'check' && (
          <span className="font-medium text-yellow-600">
            {currentTurn === 'white' ? "White" : "Black"} is in check
          </span>
        )}
        {status === 'checkmate' && (
          <span className="font-medium text-red-500">
            Checkmate! {currentTurn === 'white' ? "Black" : "White"} wins
          </span>
        )}
        {status === 'stalemate' && (
          <span className="font-medium text-amber-600">
            Stalemate - Game drawn
          </span>
        )}
        {status === 'draw' && (
          <span className="font-medium text-amber-600">
            Game drawn
          </span>
        )}
      </div>

      {/* Game controls */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewGame}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Game
        </Button>
        
        {!isGameActive && status === 'not_started' && (
          <Button 
            variant="default" 
            size="sm"
            className="flex-1"
            onClick={onNewGame}
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        )}
        
        {isGameActive && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onResign}
              className="flex-1"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Resign
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onOfferDraw}
              className="flex-1"
            >
              <Clock className="w-4 h-4 mr-2" />
              Draw
            </Button>
          </>
        )}
        
        {isGameOver && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            <Trophy className="w-4 h-4 mr-2" />
            View Analysis
          </Button>
        )}
      </div>

      {/* Move history */}
      <div className="h-64 mt-4">
        <MoveHistory moves={moves} />
      </div>
    </div>
  );
};

export default GameInfo;
