import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './ChessBoard.css';

const socket = io('http://localhost:3000');

const ChessBoard: React.FC = () => {
  const [board, setBoard] = useState<string>('');
  const [gameId, setGameId] = useState<string | null>(null);

  useEffect(() => {
    socket.on('updateBoard', (fen: string) => {
      setBoard(fen);
    });

    socket.on('error', (message: string) => {
      alert(message);
    });

    return () => {
      socket.off('updateBoard');
      socket.off('error');
    };
  }, []);

  const handleMove = (move: string) => {
    if (gameId) {
      socket.emit('move', { gameId, move });
    }
  };

  const createGame = () => {
    socket.emit('createGame');
    socket.on('gameCreated', (id: string) => {
      setGameId(id);
    });
  };

  const joinGame = (id: string) => {
    socket.emit('joinGame', id);
    socket.on('gameJoined', (id: string) => {
      setGameId(id);
    });
  };

  return (
    <div className="chess-board">
      <h1>Chess Game</h1>
      <button onClick={createGame}>Create Game</button>
      <input type="text" placeholder="Game ID" onBlur={(e) => joinGame(e.target.value)} />
      <div className="board">
        {/* Render the chessboard based on the FEN string */}
        {/* This is a placeholder for the actual chessboard rendering logic */}
        <div>{board}</div>
      </div>
    </div>
  );
};

export default ChessBoard;