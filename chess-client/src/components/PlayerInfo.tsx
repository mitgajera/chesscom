
import React from 'react';
import { Player, ChessPiece, formatTime } from '@/utils/chessUtils';

interface PlayerInfoProps {
  player: Player;
  isActive: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, isActive }) => {
  return (
    <div className={`rounded-lg p-3 transition-all duration-300 ${
      isActive 
        ? 'bg-secondary/80 shadow-md' 
        : 'bg-secondary/30'
    }`}>
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            player.color === 'white' ? 'bg-white border border-gray-300' : 'bg-gray-800'
          }`} />
          <h3 className="font-medium text-sm md:text-base">{player.name}</h3>
          {player.rating && (
            <span className="text-xs text-muted-foreground">({player.rating})</span>
          )}
        </div>
        
        {player.timeLeft !== undefined && (
          <div className={`text-sm font-mono font-medium ${
            isActive 
              ? player.timeLeft < 30 
                ? 'text-red-500 animate-pulse' 
                : 'text-primary' 
              : 'text-muted-foreground'
          }`}>
            {formatTime(player.timeLeft)}
          </div>
        )}
      </div>
      
      {/* Captured pieces */}
      {player.capturedPieces && player.capturedPieces.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {player.capturedPieces.map((piece, index) => (
            <div key={index} className="w-6 h-6 opacity-70">
              {/* You can use your Piece component here with a smaller size or just show icons */}
              <span className="text-xs">{piece.type[0].toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;
