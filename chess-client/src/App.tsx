import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FormProvider } from "react-hook-form"; // Import FormProvider
import Header from "./components/Header";
import Controls from "./components/Controls";
import Timers from "./components/Timers";
import ChessBoard from "./components/ChessBoard";
import { Chess } from "chess.js";
import "./styles/App.css";

const socket = io("http://localhost:3000");

const App = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [joinGameId, setJoinGameId] = useState<string>("");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [whiteTime, setWhiteTime] = useState<number>(300); // 5 minutes in seconds
  const [blackTime, setBlackTime] = useState<number>(300); // 5 minutes in seconds
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socket.on("gameCreated", (id: string) => {
      setGameId(id);
      setPlayerColor("white");
      setIsSpectator(false);
      alert(`Game created with ID: ${id}`);
    });

    socket.on("gameJoined", (id: string) => {
      setGameId(id);
      setPlayerColor("black");
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
      setFen(newFen);
      setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
    });

    socket.on("gameOver", (message: string) => {
      alert(message);
      setGameId(null);
      setGame(new Chess());
      setFen(new Chess().fen());
      clearInterval(timerRef.current!);
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
      clearInterval(timerRef.current!);
    };
  }, [currentPlayer]);

  useEffect(() => {
    if (currentPlayer === playerColor && !isSpectator) {
      timerRef.current = setInterval(() => {
        if (currentPlayer === "white") {
          setWhiteTime((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              socket.emit("gameOver", { gameId, winner: "black" });
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              socket.emit("gameOver", { gameId, winner: "white" });
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [currentPlayer, playerColor, isSpectator, gameId]);

  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = () => {
    console.log("Joining game with ID:", joinGameId);
    socket.emit("joinGame", joinGameId);
  };

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="app-container">
      <Header />
      <Controls
        createGame={createGame}
        joinGame={joinGame}
        joinGameId={joinGameId}
        setJoinGameId={setJoinGameId}
      />
      <Timers whiteTime={whiteTime} blackTime={blackTime} formatTime={formatTime} />
      <ChessBoard
        whiteTime={whiteTime}
        blackTime={blackTime}
        isWhite={isWhite}
        isBlack={isBlack}
        setIsWhite={setIsWhite}
        setIsBlack={setIsBlack}
        createGame={createGame}
        joinGame={joinGame}
        joinGameId={joinGameId}
        setJoinGameId={setJoinGameId}
      />
    </div>
  );
};

export default App;
