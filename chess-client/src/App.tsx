import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Chess } from 'chess.js';  // Import Chess as named export
import Layout from "./components/Layout";
import Controls from "./components/Controls";
import Timers from "./components/Timers";
import ChessBoard from "./components/ChessBoard";
import GameInformation from "./components/GameInformation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/App.css";
import "./styles/Controls.css";
import "./styles/ChessBoard.css";

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

// Initialize chess instance properly
const chess = new Chess();

const App = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [fen, setFen] = useState<string>(chess.fen());
  const [joinGameId, setJoinGameId] = useState<string>("");
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [whiteTime, setWhiteTime] = useState<number>(600); // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState<number>(600); // 10 minutes in seconds
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");
  const [gameStarted, setGameStarted] = useState<boolean>(false);
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
      setGameId(gameId);
      setPlayerColor("white"); // Creator typically plays as white
      setIsSpectator(false);
      
      // Show success notification with game ID
      toast.success(`Game created successfully! Game ID: ${gameId}`, {
        position: "bottom-right",
        autoClose: 5000, // Longer duration to ensure user sees the game ID
      });
      
      // Optional: Copy the game ID to clipboard for easier sharing
      navigator.clipboard.writeText(gameId)
        .then(() => {
          toast.info("Game ID copied to clipboard", {
            position: "bottom-right",
            autoClose: 1000,
            delay: 1000 // Show this toast 1 second after the success toast
          });
        })
        .catch(err => console.error("Could not copy game ID to clipboard", err));
    });

    socket.on("gameJoined", ({ gameId, color }) => {
      console.log("GAME JOINED EVENT:", { gameId, color });
      setGameId(gameId);
      setPlayerColor(color);
      setIsSpectator(false);
      toast.success(`Successfully joined game with ID: ${gameId} as ${color}`, {
        position: "bottom-right",
        autoClose: 3000
      });
    });

    socket.on("joinedAsSpectator", ({ gameId, message }) => {
      console.log("SPECTATOR EVENT RECEIVED:", { gameId, message });
      setGameId(gameId);
      setPlayerColor("white"); // Default view perspective, could be configurable
      setIsSpectator(true);
      toast.info(message || `You joined game ${gameId} as a spectator`, {
        position: "bottom-right",
        autoClose: 5000 // Longer duration so user can read the message
      });
    });

    socket.on("startGame", ({ gameId }) => {
      console.log(`Game started with ID: ${gameId}`);
      setGameId(gameId);
      setCurrentPlayer("white");
      setGameStarted(true);
    });

    socket.on("move", ({ fen, isWhiteTurn, whiteTime, blackTime }) => {
      setFen(fen);
      setCurrentPlayer(isWhiteTurn ? "white" : "black");
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
    });

    socket.on("timerUpdate", ({ whiteTime, blackTime }) => {
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
    });

    socket.on("gameOver", (message: string) => {
      alert(message);
      setGameId(null);
      setFen(new Chess().fen());
      clearInterval(timerRef.current!);
    });

    // Handle specific errors including joining own game
    socket.on("error", (message: string) => {
      toast.error(message, {
        position: "bottom-right",
        autoClose: 5000
      });
    });

    // Debug all incoming events
    const debugSocketEvent = (event, data) => {
      console.log(`Socket event received: ${event}`, data);
    };
    
    socket.onAny(debugSocketEvent);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("joinedAsSpectator");
      socket.off("startGame");
      socket.off("move");
      socket.off("timerUpdate");
      socket.off("gameOver");
      socket.off("error");
      socket.offAny(debugSocketEvent);
      clearInterval(timerRef.current!);
    };
  }, [currentPlayer]);

  useEffect(() => {
    if (gameStarted && currentPlayer === playerColor && !isSpectator && gameId) {
      timerRef.current = setInterval(() => {
        if (currentPlayer === "white") {
          setWhiteTime((prev) => {
            const newTime = prev - 1;
            socket.emit("timerUpdate", { gameId, whiteTime: newTime, blackTime });
            return newTime;
          });
        } else {
          setBlackTime((prev) => {
            const newTime = prev - 1;
            socket.emit("timerUpdate", { gameId, whiteTime, blackTime: newTime });
            return newTime;
          });
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }
    return () => clearInterval(timerRef.current!);
  }, [gameStarted, currentPlayer, playerColor, isSpectator, gameId]);

  useEffect(() => {
    if (chessBoardRef.current) {
      console.log("ChessBoard DOM node is available:", chessBoardRef.current);
    }
  }, [chessBoardRef]);

  const createGame = () => {
    console.log("Creating new game");
    socket.emit("createGame");
  };

  const joinGame = () => {
    if (!joinGameId.trim()) {
      toast.warning("Please enter a game ID", {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }
    
    // Check if user is trying to join their own game
    if (joinGameId === gameId) {
      toast.error("You cannot join your own game!", {
        position: "bottom-right",
        autoClose: 5000
      });
      return;
    }
    
    console.log("Joining game with ID:", joinGameId);
    socket.emit("joinGame", { gameId: joinGameId });
  };

  const resignGame = () => {
    if (gameId) {
      socket.emit("resignGame", { gameId });
    }
  };

  const offerDraw = () => {
    if (gameId) {
      socket.emit("offerDraw", { gameId });
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Check if spectator
    if (isSpectator) {
      toast.warning("You are only watching the game and cannot make moves.", {
        position: "bottom-right",
        autoClose: 3000
      });
      return false;
    }
  
    // Check if it's this player's turn
    const currentTurn = chess.turn() === 'w' ? "white" : "black";
    if (playerColor !== currentTurn) {
      toast.warning("It's not your turn.", {
        position: "bottom-right",
        autoClose: 3000
      });
      return false;
    }
  
    // Try to make the move - wrap this in a try/catch to handle any errors
    try {
      // Check if move is legal without actually making it
      const possibleMoves = chess.moves({ verbose: true });
      const moveIsLegal = possibleMoves.some(
        move => move.from === sourceSquare && move.to === targetSquare
      );
  
      if (!moveIsLegal) {
        toast.error("Invalid move!", {
          position: "bottom-right",
          autoClose: 3000
        });
        return false;
      }
  
      // Now actually make the move
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q"
      });
  
      setFen(chess.fen());
      
      // After making a move, update the current player
      const newCurrentPlayer = currentTurn === "white" ? "black" : "white";
      setCurrentPlayer(newCurrentPlayer);
      
      if (gameId) {
        socket.emit("move", { 
          gameId, 
          fen: chess.fen(), 
          isWhiteTurn: newCurrentPlayer === "white",
          whiteTime, 
          blackTime 
        });
      }
  
      // Start the timer after the first move if needed
      if (!gameStarted) {
        setGameStarted(true);
      }
  
      // Show toast notification
      toast.info(`Move made: ${move.san}`, {
        position: "bottom-right",
        autoClose: 3000,
      });
  
      return true;
    } catch (error) {
      console.error("Error making move:", error);
      toast.error("Invalid move! Please try again.", {
        position: "bottom-right",
        autoClose: 3000
      });
      return false;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // @ts-ignore - Working around type incompatibility
  const moveHistoryData = chess.history();
  const moveHistory = moveHistoryData.map((san: string, index: number) => {
    // Create a simple Move object with just the properties we need
    return {
      san: san,
      // Add placeholder values for required properties
      from: "unknown",
      to: "unknown",
      color: index % 2 === 0 ? "w" : "b",
      piece: "p"
    };
  });

  const timeLeft = { white: whiteTime, black: blackTime };

  function onMove(move: string): void {
    const [sourceSquare, targetSquare, promotion] = move.split("");
    const moveObj = chess.move({
      from: (sourceSquare + targetSquare) as any, // Fix type error
      to: promotion as any,
      promotion: "q", // Use a valid promotion value
    });
  
    if (moveObj === null) {
      alert("Invalid move");
      return;
    }
  
    setFen(chess.fen());
    setCurrentPlayer(currentPlayer === "white" ? "black" : "white");
  
    if (gameId) {
      socket.emit("move", { gameId, fen: chess.fen(), isWhiteTurn: currentPlayer === "white", whiteTime, blackTime });
    }
  }

  function onGameOver(): void {
    alert("Game over!");
    setGameId(null);
    setFen(new Chess().fen());
    setWhiteTime(300);
    setBlackTime(300);
    setCurrentPlayer("white");
    clearInterval(timerRef.current!);
  }

  // Convert the moveHistory to an array of strings for the components
  type Move = {
    san: string;
    from: string;
    to: string;
    color: string;
    piece: string;
  };

  const moveHistoryStrings = moveHistory.map((move: Move) => {
    if (typeof move === 'string') {
      return move;
    } else {
      return move.san || `${move.from}-${move.to}`;
    }
  });

  return (
    <Layout>
      <div className="app-container">
        <div className="controls-container">
          <Controls
            gameId={gameId || ""}
            createGame={createGame}
            joinGame={joinGame}
            joinGameId={joinGameId}
            setJoinGameId={setJoinGameId}
            resignGame={resignGame}
            offerDraw={offerDraw}
            gameStatus={chess.isGameOver() ? "over" : "ongoing"}
            gameResult={chess.isCheckmate() ? (currentPlayer === "white" ? "black" : "white") : "draw"}
            moveHistory={moveHistoryStrings}
          />
        </div>
        <div className="game-container">
          <div className="chessboard-container" ref={chessBoardRef}>
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
              gameStatus={chess.isGameOver() ? "over" : "ongoing"}
              gameResult={chess.isCheckmate() ? (currentPlayer === "white" ? "black" : "white") : "draw"}
              moveHistory={moveHistoryStrings}
              opponent={playerColor === "white" ? "black" : "white"}
            />
          </div>
          <GameInformation
            blackPlayerTime={formatTime(blackTime)}
            whitePlayerTime={formatTime(whiteTime)}
            gameStatus={chess.isGameOver() ? "over" : "ongoing"}
            moveHistory={moveHistoryStrings}
          />
        </div>
        <ToastContainer />
      </div>
    </Layout>
  );
};

export default App;