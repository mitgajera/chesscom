import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import "../styles/ChessBoard.css";

const socket = io("http://localhost:3000");

interface ChessBoardProps {
  fen: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  playerColor: "white" | "black";
  createGame: () => void;
  joinGame: () => void;
  joinGameId: string;
  setJoinGameId: (id: string) => void;
  whiteTime: number;
  blackTime: number;
  isWhite: boolean;
  isBlack: boolean;
  setIsWhite: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBlack: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  playerColor,
  createGame,
  joinGame,
  joinGameId,
  setJoinGameId,
  whiteTime,
  blackTime,
  isWhite,
  isBlack,
  setIsWhite,
  setIsBlack,
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
      promotion: "q", // always promote to a queen for simplicity
    });

    if (move === null) return false;

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

export default ChessBoard;

function setFen(arg0: string) {
  throw new Error("Function not implemented.");
}
