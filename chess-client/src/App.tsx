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

const SOCKET_URL = typeof process !== 'undefined' && process.env && process.env.REACT_APP_SOCKET_URL 
  ? process.env.REACT_APP_SOCKET_URL 
  : "http://localhost:3000";

const socket = io(SOCKET_URL, {
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
  const [moveHistory, setMoveHistory] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chessBoardRef = useRef<HTMLDivElement>(null);
  const [lastMoveByMe, setLastMoveByMe] = useState<string | null>(null);
  const [isHandlingMyMove, setIsHandlingMyMove] = useState<boolean>(false);
  
  useEffect(() => {
    console.log("App component mounted");
    
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      toast.error("Failed to connect to server. Please try again.", {
        position: "bottom-right",
      });
    });

    socket.on("gameCreated", ({ gameId }) => {
      setGameId(gameId);
      setPlayerColor("white");
      setIsSpectator(false);
      
      // Show success notification with game ID
      toast.success(`Game created successfully! Game ID: ${gameId}`, {
        position: "bottom-right",
        autoClose: 5000,
      });
      
      // Copy the game ID to clipboard for easier sharing
      navigator.clipboard.writeText(gameId)
        .then(() => {
          toast.info("Game ID copied to clipboard", {
            position: "bottom-right",
            autoClose: 1000,
            delay: 1000
          });
        })
        .catch(err => console.error("Could not copy game ID to clipboard", err));
    });

    socket.on("gameJoined", ({ gameId, color }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setIsSpectator(false);
      toast.success(`Successfully joined game with ID: ${gameId} as ${color}`, {
        position: "bottom-right",
        autoClose: 3000
      });
      
      // Reset the chessboard to initial position
      setFen(chess.fen());
      setGameStarted(true);
    });

    socket.on("joinedAsSpectator", ({ gameId, currentFen, moveHistory, whiteTime, blackTime, currentPlayer }) => {
      console.log("Joined as spectator:", { gameId, currentFen, moveHistory });
      setGameId(gameId);
      setIsSpectator(true);
      
      // If a current FEN was provided, update the board
      if (currentFen) {
        chess.load(currentFen);
        setFen(currentFen);
      }
      
      // If timers were provided, update them
      if (typeof whiteTime === 'number') setWhiteTime(whiteTime);
      if (typeof blackTime === 'number') setBlackTime(blackTime);
      
      // If current player was provided, update it
      if (currentPlayer) setCurrentPlayer(currentPlayer);
      
      // Process and set move history properly
      if (moveHistory && Array.isArray(moveHistory)) {
        console.log("Processing received move history:", moveHistory);
        
        // Convert all move objects to a consistent format (strings for display)
        const processedMoves = moveHistory.map(move => {
          if (typeof move === 'string') {
            return move;
          } else if (move && move.san) {
            return move.san;
          } else if (move && move.from && move.to) {
            return `${move.from}-${move.to}`;
          }
          return '';
        }).filter(Boolean); // Remove any empty entries
        
        console.log("Processed move history:", processedMoves);
        setMoveHistory(processedMoves);
        
        // Set the last move for highlighting if available
        if (moveHistory.length > 0) {
          const lastMoveData = moveHistory[moveHistory.length - 1];
          if (typeof lastMoveData !== 'string' && lastMoveData.from && lastMoveData.to) {
            setLastMove({
              from: lastMoveData.from,
              to: lastMoveData.to
            });
          }
        }
      }
      
      toast.info(`Watching game ${gameId} as spectator`, {
        position: "bottom-center",
        autoClose: 3000
      });
    });

    socket.on("startGame", () => {
      console.log(`Game started`);
      setCurrentPlayer("white");
      setGameStarted(true);
      
      toast.success("Game has started! White's turn.", {
        position: "bottom-right",
        autoClose: 3000
      });
    });

    socket.on("move", ({ fen, move, isWhiteTurn, whiteTime, blackTime, fromSocketId }) => {
      // Update local chess instance with the new FEN
      chess.load(fen);
      setFen(fen);
      
      // Update current player turn
      setCurrentPlayer(isWhiteTurn ? "white" : "black");
      
      // Update timers
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
      
      // Update move history - check if this is a new move to prevent duplicates
      if (move && move.san) {
        setMoveHistory(prevHistory => {
          // Check if the last move in history is the same as the new move to avoid duplicates
          const lastMove = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
          
          // Only add the move if it's different from the last one or if it's the first move
          if (!lastMove || 
              (typeof lastMove === 'string' && lastMove !== move.san) || 
              (typeof lastMove === 'object' && lastMove.san !== move.san)) {
            
            return [...prevHistory, move.san];
          }
          
          // Return unchanged if it would be a duplicate
          return prevHistory;
        });
        
        // Update last move for highlighting
        if (move.from && move.to) {
          setLastMove({from: move.from, to: move.to});
        }
      }
      
      // Only show notification for opponent moves
      if (fromSocketId !== socket.id) {
        toast.info(`Opponent moved: ${move?.san || ""}`, {
          position: "bottom-right",
          autoClose: 1500
        });
      }
    });

    socket.on("timerUpdate", ({ whiteTime, blackTime }) => {
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
    });

    socket.on("gameOver", (result) => {
      const { message, winner } = typeof result === 'string' ? { message: result, winner: null } : result;
      toast.info(message, {
        position: "center",
        autoClose: 10000
      });
      
      setGameStarted(false);
      clearInterval(timerRef.current!);
    });

    socket.on("error", (message) => {
      toast.error(message, {
        position: "bottom-right",
        autoClose: 5000
      });
    });

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
  }, []);

  useEffect(() => {
    if (gameStarted && currentPlayer === playerColor && !isSpectator && gameId) {
      timerRef.current = setInterval(() => {
        if (currentPlayer === "white") {
          setWhiteTime((prev) => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              clearInterval(timerRef.current!);
              socket.emit("timeUp", { gameId, loser: "white" });
              return 0;
            }
            socket.emit("timerUpdate", { gameId, whiteTime: newTime, blackTime });
            return newTime;
          });
        } else {
          setBlackTime((prev) => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              clearInterval(timerRef.current!);
              socket.emit("timeUp", { gameId, loser: "black" });
              return 0;
            }
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
    if (gameId && !isSpectator) {
      socket.emit("resignGame", { gameId, color: playerColor });
      toast.info("You resigned the game", {
        position: "bottom-right",
        autoClose: 3000
      });
    } else if (isSpectator) {
      toast.warning("Spectators cannot resign games", {
        position: "bottom-right",
        autoClose: 3000
      });
    }
  };

  const offerDraw = () => {
    if (gameId && !isSpectator) {
      socket.emit("offerDraw", { gameId, offeredBy: playerColor });
      toast.info("Draw offered to opponent", {
        position: "bottom-right",
        autoClose: 3000
      });
    } else if (isSpectator) {
      toast.warning("Spectators cannot offer draws", {
        position: "bottom-right",
        autoClose: 3000
      });
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
  
    // Try to make the move
    try {
      // Make the move
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q" // Always promote to queen for simplicity
      });
  
      // If invalid move
      if (!move) {
        toast.error("Invalid move!", {
          position: "bottom-right",
          autoClose: 3000
        });
        return false;
      }
      
      // Set flag to indicate we're handling our own move
      setIsHandlingMyMove(true);
      
      // Update UI states
      setFen(chess.fen());
      
      // Get the new turn after the move
      const newCurrentPlayer = chess.turn() === "w" ? "white" : "black";
      setCurrentPlayer(newCurrentPlayer);
      
      // Add to move history
      setMoveHistory(prev => [...prev, move]);
      
      // Show notification for the player's own move
      toast.success(`Move: ${move.san}`, {
        position: "bottom-right",
        autoClose: 1500
      });
      
      // Emit move to server with socket ID
      if (gameId) {
        socket.emit("move", { 
          gameId, 
          move: move,
          fen: chess.fen(), 
          isWhiteTurn: newCurrentPlayer === "white",
          whiteTime, 
          blackTime,
          fromSocketId: socket.id // Send the socket ID to identify who made the move
        });
      }
      
      // Reset flag after a short delay to ensure socket event has been processed
      setTimeout(() => {
        setIsHandlingMyMove(false);
      }, 500);
      
      return true;
    } catch (error) {
      console.error("Error making move:", error);
      toast.error("Error making move. Please try again.", {
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
  // Change the variable name from moveHistory to formattedMoveHistory
  const formattedMoveHistory = moveHistoryData.map((san: string, index: number) => {
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
              isSpectator={isSpectator}
              gameId={gameId || ""} // Pass the gameId here
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