import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Layout from "./components/Layout";
import Controls from "./components/Controls";
import Timers from "./components/Timers";
import ChessBoard from "./components/ChessBoard";
import GameInformation from "./components/GameInformation";
import { Chess } from "chess.js";
import "./styles/App.css";
import "./styles/ChessBoard.css";

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

const App = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [joinGameId, setJoinGameId] = useState<string>("");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [whiteTime, setWhiteTime] = useState<number>(600); // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState<number>(600); // 10 minutes in seconds
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chessBoardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("App component mounted");
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socket.on("gameCreated", ({ gameId }) => {
      console.log(`Game created with ID: ${gameId}`);
      setGameId(gameId);
      setPlayerColor("white");
      setIsSpectator(false);
      alert(`Game created with ID: ${gameId}`);
    });

    socket.on("gameJoined", ({ gameId, color }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setIsSpectator(false);
      alert(`Joined game with ID: ${gameId}`);
    });

    socket.on("startGame", ({ gameId }) => {
      console.log(`Game started with ID: ${gameId}`);
      setGameId(gameId);
      setCurrentPlayer("white");
    });

    socket.on("move", ({ fen, isWhiteTurn, whiteTime, blackTime }) => {
      setGame(new Chess(fen));
      setFen(fen);
      setCurrentPlayer(isWhiteTurn ? "white" : "black");
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
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
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("startGame");
      socket.off("move");
      socket.off("gameOver");
      socket.off("error");
      clearInterval(timerRef.current!);
    };
  }, [currentPlayer]);

  useEffect(() => {
    if (currentPlayer === playerColor && !isSpectator && gameId) {
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

  useEffect(() => {
    if (chessBoardRef.current) {
      console.log("ChessBoard DOM node is available:", chessBoardRef.current);
    }
  }, [chessBoardRef]);

  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = () => {
    console.log("Joining game with ID:", joinGameId);
    socket.emit("joinGame", { gameId: joinGameId });
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (isSpectator) {
      alert("You are only watching the game and cannot make moves.");
      return false;
    }

    if ((currentPlayer === "white" && playerColor !== "white") || (currentPlayer === "black" && playerColor !== "black")) {
      alert("It's not your turn.");
      return false;
    }

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move === null) return false;

    setFen(game.fen());
    if (gameId) {
      socket.emit("move", { gameId, fen: game.fen(), isWhiteTurn: currentPlayer === "white", whiteTime, blackTime });
    }
    return true;
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const moveHistory = game.history();
  const timeLeft = { white: whiteTime, black: blackTime };
  const gameResult = game.isCheckmate() ? (currentPlayer === "white" ? "black" : "white") : "draw";
  const gameStatus = game.isGameOver() ? "over" : "ongoing";

  function onMove(move: string): void {
    const [sourceSquare, targetSquare, promotion] = move.split("");
    const moveObj = game.move({
      from: sourceSquare + targetSquare,
      to: promotion,
      promotion: "q || r || b || n",
    });

    if (moveObj === null) {
      alert("Invalid move");
      return;
    }

    setFen(game.fen());
    setCurrentPlayer(currentPlayer === "white" ? "black" : "white");

    if (gameId) {
      socket.emit("move", { gameId, fen: game.fen(), isWhiteTurn: currentPlayer === "white", whiteTime, blackTime });
    }
  }

  function onGameOver(): void {
    alert("Game over!");
    setGameId(null);
    setGame(new Chess());
    setFen(new Chess().fen());
    setWhiteTime(300);
    setBlackTime(300);
    setCurrentPlayer("white");
    clearInterval(timerRef.current!);
  }

  return (
    <Layout>
      <div className="app-container">
        <Controls
          gameId={gameId || ""}
          gameStatus={game.isGameOver() ? "over" : "ongoing"}
          gameResult={game.isCheckmate() ? (currentPlayer === "white" ? "black" : "white") : "draw"}
          moveHistory={game.history()}
          createGame={createGame}
          joinGame={joinGame}
          joinGameId={joinGameId}
          setJoinGameId={setJoinGameId}
        />
        <Timers whiteTime={whiteTime} blackTime={blackTime} formatTime={formatTime} />
        <div className="game-container">
          <div ref={chessBoardRef}>
            <ChessBoard
              fen={fen}
              onDrop={onDrop}
              playerColor={playerColor}
              whiteTime={whiteTime}
              blackTime={blackTime}
              currentPlayer={currentPlayer}
              timeLeft={timeLeft}
              onMove={onMove}
              onGameOver={onGameOver}
              isSpectator={isSpectator}
              setIsSpectator={setIsSpectator}
              isWhite={playerColor === "white"}
              isBlack={playerColor === "black"}
              setIsWhite={() => setPlayerColor("white")}
              setIsBlack={() => setPlayerColor("black")}
              gameId={gameId || ""}
              createGame={createGame}
              joinGame={joinGame}
              joinGameId={joinGameId}
              setJoinGameId={setJoinGameId}
              gameStatus={gameStatus}
              gameResult={gameResult}
              moveHistory={moveHistory}
              opponent={playerColor === "white" ? "black" : "white"}
            />
          </div>
          <GameInformation
            blackPlayerTime={formatTime(blackTime)}
            whitePlayerTime={formatTime(whiteTime)}
            gameStatus={gameStatus}
            moveHistory={moveHistory}
          />
        </div>
      </div>
    </Layout>
  );
};

export default App;