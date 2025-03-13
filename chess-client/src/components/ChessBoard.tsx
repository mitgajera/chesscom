import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";
import "../styles/ChessBoard.css";

const socket = io("http://localhost:3001");

interface ChessBoardProps {
  fen: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  playerColor: "white" | "black";
  whiteTime: number;
  blackTime: number;
  isWhite: boolean;
  isBlack: boolean;
  isSpectator: boolean;
  setIsWhite: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBlack: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSpectator: React.Dispatch<React.SetStateAction<boolean>>;
  createGame: () => void;
  joinGame: () => void;
  joinGameId: string;
  setJoinGameId: React.Dispatch<React.SetStateAction<string>>;
  gameId: string;
  gameStatus: string;
  gameResult: string;
  moveHistory: string[];
  currentPlayer: string;
  opponent: string;
  timeLeft: { white: number; black: number };
  onMove: (move: string) => void;
  onGameOver: () => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  onDrop,
  playerColor,
  whiteTime,
  blackTime,
  isWhite,
  isBlack,
  isSpectator,
  setIsWhite,
  setIsBlack,
  createGame,
  joinGame,
  joinGameId,
  setJoinGameId,
  gameId,
  gameStatus,
  gameResult,
  moveHistory,
  currentPlayer,
  opponent,
  timeLeft,
  onMove,
  onGameOver,
  setIsSpectator,
}) => {
  const [game, setGame] = useState(new Chess());

  useEffect(() => {
    socket.on("gameCreated", (id: string) => {
      setIsSpectator(false);
      alert(`Game created with ID: ${id}`);
    });

    socket.on("gameJoined", (id: string) => {
      setIsSpectator(false);
      alert(`Joined game with ID: ${id}`);
    });

    socket.on("gameWatching", (id: string) => {
      setIsSpectator(true);
      alert(`You are watching the game with ID: ${id}`);
    });

    socket.on("updateBoard", (newFen: string) => {
      setGame(new Chess(newFen));
    });

    socket.on("gameOver", (message: string) => {
      alert(message);
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

  return (
    <div className="board-container">
      <Chessboard
        position={fen}
        onDrop={({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string }) => onDrop(sourceSquare, targetSquare)}
        orientation={playerColor}
        draggable={true}
      />
    </div>
  );
};

export default ChessBoard;
