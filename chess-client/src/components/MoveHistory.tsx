import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import "../styles/ChessBoard.css";
import { ChessMove } from '../utils/chessUtils';

const socket = io("http://localhost:3000");

interface ChessBoardProps {
  fen: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  playerColor: "white" | "black";
  createGame: () => void;
  joinGame: () => void;
  joinGameId: string;
  setJoinGameId: (id: string) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  playerColor,
  createGame,
  joinGame,
  joinGameId,
  setJoinGameId,
}) => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState(new Chess());
  const [isSpectator, setIsSpectator] = useState<boolean>(false);

  useEffect(() => {
    socket.on("gameCreated", (id: string) => {
      setGameId(id);
      setIsSpectator(false);
      alert(`Game created with ID: ${id}`);
    });

    socket.on("gameJoined", (id: string) => {
      setGameId(id);
      setIsSpectator(false);
      alert(`Joined game with ID: ${id}`);
    });

    socket.on("gameWatching", (id: string) => {
      setGameId(id);
      setIsSpectator(true);
      alert(`You are watching the game with ID: ${id}`);
    });

    socket.on("updateBoard", (newFen: string) => {
      setGame(new Chess(newFen));
    });

    socket.on("gameOver", (message: string) => {
      alert(message);
      setGameId(null);
      setGame(new Chess());
    });

    socket.on("error", (message: string) => {
      alert(message);
    });

    return () => {
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("gameWatching");
      socket.off("updateBoard");
      socket.off("gameOver");
      socket.off("error");
    };
  }, []);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (isSpectator) {
      alert("You are only watching the game and cannot make moves.");
      return false;
    }

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", 
    });

    if (move === null) return false;const [fen, setFen] = useState<string>(''); // Declare setFen here

    setFen(game.fen());
    if (gameId) {
      socket.emit("move", { gameId, move: `${sourceSquare}${targetSquare}q` });
    }
    return true;
  };

  return (
    <div className="board-container">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={playerColor}
        boardWidth={500}
      />
    </div>
  );
};

interface MoveHistoryProps {
  moves: ChessMove[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  return (
    <div>
      <h2>Move History</h2>
      <ul>
        {moves.map((move, index) => (
          <li key={index}>
            {move.notation}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MoveHistory;