import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import "../styles/ChessBoard.css";

const socket = io("http://localhost:3000");

const ChessBoard = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [joinGameId, setJoinGameId] = useState<string>("");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");

  useEffect(() => {
    socket.on("gameCreated", (id: string) => {
      setGameId(id);
      setPlayerColor("white");
      alert(`Game created with ID: ${id}`);
    });

    socket.on("gameJoined", (id: string) => {
      setGameId(id);
      setPlayerColor("black");
      alert(`Joined game with ID: ${id}`);
    });

    socket.on("updateBoard", (newFen: string) => {
      setGame(new Chess(newFen));
      setFen(newFen);
    });

    socket.on("gameOver", (message: string) => {
      alert(message);
      setGameId(null);
      setGame(new Chess());
      setFen(new Chess().fen());
    });

    socket.on("error", (message: string) => {
      alert(message);
    });

    return () => {
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("updateBoard");
      socket.off("gameOver");
      socket.off("error");
    };
  }, []);

  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = () => {
    console.log("Joining game with ID:", joinGameId);
    socket.emit("joinGame", joinGameId);
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
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
    <div className="chess-container">
      <div className="controls">
        <button onClick={createGame}>Create Game</button>
        <input
          type="text"
          placeholder="Game ID"
          value={joinGameId}
          onChange={(e) => setJoinGameId(e.target.value)}
        />
        <button onClick={joinGame}>Join Game</button>
      </div>
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={playerColor}
        boardWidth={400}
      />
    </div>
  );
};

export default ChessBoard;