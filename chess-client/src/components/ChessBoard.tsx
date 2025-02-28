import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./ChessBoard.css";

const socket = io("http://localhost:3000");

const ChessBoard = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [fen, setFen] = useState<string>("");

  useEffect(() => {
    socket.on("gameCreated", (id: string) => {
      setGameId(id);
    });

    socket.on("gameJoined", (id: string) => {
      setGameId(id);
    });

    socket.on("updateBoard", (newFen: string) => {
      setFen(newFen);
    });

    socket.on("error", (message: string) => {
      alert(message);
    });

    return () => {
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("updateBoard");
      socket.off("error");
    };
  }, []);

  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = (id: string) => {
    socket.emit("joinGame", id);
  };

  const makeMove = (move: string) => {
    if (gameId) {
      socket.emit("move", { gameId, move });
    }
  };

  return (
    <div>
      <button onClick={createGame}>Create Game</button>
      <input
        type="text"
        placeholder="Game ID"
        onBlur={(e) => joinGame(e.target.value)}
      />
      <div className="chess-board">
        {/* Render the chess board using the FEN string */}
        {fen}
      </div>
      <input
        type="text"
        placeholder="Move"
        onBlur={(e) => makeMove(e.target.value)}
      />
    </div>
  );
};

export default ChessBoard;