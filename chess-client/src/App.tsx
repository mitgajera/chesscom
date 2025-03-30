import React, { useState, useEffect, useRef } from "react";
import { Chess } from 'chess.js';
import Layout from "./components/Layout";
import Controls from "./components/Controls";
import GameInformation from "./components/GameInformation";
import MobileToaster, { toast } from "./components/MobileToaster";
import ResponsiveBoard from "./components/ResponsiveBoard";
import "./styles/App.css";
import "./styles/Controls.css";
import "./styles/ChessBoard.css";
import "./styles/Responsive.css";
import "./styles/ToastFix.css";
import socket from "./socket";

// Initialize chess instance
const chess = new Chess();

const App = () => {
  // Game state
  const [gameId, setGameId] = useState<string | null>(null);
  const [fen, setFen] = useState<string>(chess.fen());
  const [joinGameId, setJoinGameId] = useState<string>("");
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [whiteTime, setWhiteTime] = useState<number>(600); // 10 minutes
  const [blackTime, setBlackTime] = useState<number>(600); // 10 minutes
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<any[]>([]);
  const [lastMove, setLastMove] = useState<{from: string, to: string} | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [showDrawDialog, setShowDrawDialog] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameOverMessage, setGameOverMessage] = useState<string>("");
  const [winner, setWinner] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chessBoardRef = useRef<HTMLDivElement>(null);

  // Add this helper function in your App component
  const showMoveNotification = (
    moveData: any, 
    fromCurrentPlayer: boolean, 
    moveColor: "white" | "black"
  ) => {
    // If the current player made the move, only show confirmation if we want to
    if (fromCurrentPlayer) {
      // Optionally show a confirmation the move was made successfully
      // Commented out to avoid duplicate notifications
      // toast.success(`Move: ${moveData?.san || ""}`, { 
      //   position: "bottom-right", 
      //   autoClose: 1000 
      // });
      return;
    }
    
    // For spectators, show which color made the move
    if (isSpectator) {
      toast.info(`${moveColor === "white" ? "⚪ White" : "⚫ Black"} moved: ${moveData?.san || ""}`, {
        position: "bottom-right",
        autoClose: 2000
      });
      return;
    }
    
    // For the opponent, just show the move
    toast.info(`Opponent moved: ${moveData?.san || ""}`, {
      position: "bottom-right",
      autoClose: 2000
    });
  };

  // Track connection status
  useEffect(() => {
    const onConnect = () => {
      console.log("Connected to WebSocket server");
      setConnectionStatus('connected');
      toast.success("Connected to server", {
        position: "bottom-right",
        autoClose: 2000
      });
    };

    const onDisconnect = () => {
      console.log("Disconnected from WebSocket server");
      setConnectionStatus('disconnected');
      toast.error("Disconnected from server. Attempting to reconnect...", {
        position: "bottom-right",
        autoClose: 2000
      });
    };

    const onConnectError = (error: any) => {
      console.error("Connection error:", error);
      setConnectionStatus('error');
      toast.error("Failed to connect to server. Please check your connection.", {
        position: "bottom-right",
        autoClose: false
      });
    };

    // Set up event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Initial connection status
    if (socket.connected) {
      setConnectionStatus('connected');
    }

    // Try reconnecting if not connected
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, []);

  // Game event listeners
  useEffect(() => {
    socket.on("gameCreated", ({ gameId }) => {
      setGameId(gameId);
      setPlayerColor("white");
      setIsSpectator(false);
      
      // Reset the chess board to initial state
      chess.reset();
      setFen(chess.fen());
      setMoveHistory([]);
      setGameOver(false);
      setGameOverMessage("");
      setWinner(null);
      
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
      
      // Reset chess state when joining a game
      chess.reset();
      setFen(chess.fen());
      setMoveHistory([]);
      setGameStarted(true);
      setGameOver(false);
      setGameOverMessage("");
      setWinner(null);
      
      toast.success(`Successfully joined game with ID: ${gameId} as ${color}`, {
        position: "bottom-right",
        autoClose: 3000
      });
    });
    
    socket.on("opponentJoined", ({ color }) => {
      toast.info(`Opponent joined as ${color}. Game starting!`, {
        position: "bottom-right",
        autoClose: 3000
      });
      setGameStarted(true);
    });

    socket.on("joinedAsSpectator", ({ gameId, message, currentFen, moveHistory, whiteTime, blackTime, currentPlayer }) => {
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
        
        // Convert all move objects to a consistent format
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
        position: "bottom-right",
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

    socket.on("move", ({ fen, move, isWhiteTurn, whiteTime, blackTime, fromSocketId, playerColor: movePlayerColor }) => {
      // Update local chess instance with the new FEN
      console.log("Received move from server:", { fen, move, isWhiteTurn, movePlayerColor });
      
      try {
        // Determine which player made the move (the opposite of isWhiteTurn)
        const moveColor = isWhiteTurn ? "black" : "white"; // isWhiteTurn is the next player's turn
        
        // Load new position
        chess.load(fen);
        setFen(fen);
        
        // Update current player turn
        const newCurrentPlayer = isWhiteTurn ? "white" : "black";
        setCurrentPlayer(newCurrentPlayer);
        console.log("Current player set to:", newCurrentPlayer);
        
        // Update timers if they were provided
        if (typeof whiteTime === 'number') setWhiteTime(whiteTime);
        if (typeof blackTime === 'number') setBlackTime(blackTime);
        
        // Update move history and last move
        if (move) {
          // Add move to history if it has a san notation
          if (move.san) {
            setMoveHistory(prevHistory => {
              const lastMove = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
              
              if (!lastMove || 
                  (typeof lastMove === 'string' && lastMove !== move.san) || 
                  (typeof lastMove === 'object' && lastMove.san !== move.san)) {
                return [...prevHistory, move.san];
              }
              return prevHistory;
            });
          }
          
          // Update last move for highlighting
          if (move.from && move.to) {
            setLastMove({from: move.from, to: move.to});
          }
          
          // Only show notification for appropriate situations
          const fromCurrentPlayer = fromSocketId === socket.id;
          showMoveNotification(move, fromCurrentPlayer, moveColor);
        }
      } catch (error) {
        console.error("Error processing move:", error);
      }
    });

    socket.on("timerUpdate", ({ whiteTime, blackTime }) => {
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
    });
    
    socket.on("drawOffered", () => {
      setShowDrawDialog(true);
      toast.info("Your opponent has offered a draw", {
        position: "bottom-right",
        autoClose: false
      });
    });

    socket.on("gameOver", (result) => {
      const { message, winner } = typeof result === 'string' ? { message: result, winner: null } : result;
      
      setGameOver(true);
      setGameOverMessage(message);
      setWinner(winner);
      setGameStarted(false);
      
      toast.info(message, {
        position: "bottom-center",
        autoClose: 10000
      });
      
      if (timerRef.current) clearInterval(timerRef.current);
    });

    socket.on("error", (message) => {
      toast.error(message, {
        position: "bottom-right",
        autoClose: 5000
      });
    });

    const debugSocketEvent = (event: string, data: any) => {
      console.log(`Socket event received: ${event}`, data);
    };
    
    socket.onAny(debugSocketEvent);

    return () => {
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("opponentJoined");
      socket.off("joinedAsSpectator");
      socket.off("startGame");
      socket.off("move");
      socket.off("timerUpdate");
      socket.off("drawOffered");
      socket.off("gameOver");
      socket.off("error");
      socket.offAny(debugSocketEvent);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameStarted && currentPlayer === playerColor && !isSpectator && gameId) {
      timerRef.current = setInterval(() => {
        if (currentPlayer === "white") {
          setWhiteTime((prev) => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              if (timerRef.current) clearInterval(timerRef.current);
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
              if (timerRef.current) clearInterval(timerRef.current);
              socket.emit("timeUp", { gameId, loser: "black" });
              return 0;
            }
            socket.emit("timerUpdate", { gameId, whiteTime, blackTime: newTime });
            return newTime;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, currentPlayer, playerColor, isSpectator, gameId, whiteTime, blackTime]);

  // Manual reconnect function
  const handleReconnect = () => {
    setConnectionStatus('connecting');
    socket.connect();
    toast.info("Attempting to reconnect...", {
      position: "bottom-right",
      autoClose: 2000
    });
  };

  // Game actions
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

  const spectateGame = () => {
    if (!joinGameId.trim()) {
      toast.warning("Please enter a game ID to spectate", {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }
    
    console.log("Spectating game with ID:", joinGameId);
    socket.emit("spectateGame", { gameId: joinGameId });
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
  
  const acceptDraw = () => {
    if (gameId && !isSpectator) {
      socket.emit("acceptDraw", { gameId });
      setShowDrawDialog(false);
    }
  };
  
  const declineDraw = () => {
    if (gameId && !isSpectator) {
      socket.emit("declineDraw", { gameId });
      setShowDrawDialog(false);
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Check if spectator
    if (isSpectator) {
      toast.warning("You are only watching the game", {
        position: "bottom-right",
        autoClose: 3000
      });
      return false;
    }

    // Get current turn from chess.js (w = white, b = black)
    const chessTurn = chess.turn() === 'w' ? "white" : "black";
    
    // Debug information
    console.log({
      playerColor,
      chessTurn,
      isMyTurn: playerColor === chessTurn
    });
    
    // Check if it's this player's turn
    if (playerColor !== chessTurn) {
      toast.warning(`It's ${chessTurn}'s turn. Please wait for your turn.`, {
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
        return false;
      }
      
      // Update UI states
      setFen(chess.fen());
      
      // Update last move for highlighting
      setLastMove({from: sourceSquare, to: targetSquare});
      
      // Determine the next player's turn after this move
      const isWhiteTurn = chess.turn() === 'w';
      const newCurrentPlayer = isWhiteTurn ? "white" : "black";
      setCurrentPlayer(newCurrentPlayer);
      
      // Add to move history
      setMoveHistory(prev => [...prev, move.san]);
      
      // Emit move to server
      if (gameId) {
        socket.emit("move", { 
          gameId, 
          move: move,
          fen: chess.fen(), 
          isWhiteTurn: isWhiteTurn,
          whiteTime, 
          blackTime,
          fromPlayerId: socket.id,
          playerColor: playerColor  // Add player color to the move data
        });
        
        // Show a success toast for the player who made the move
        toast.success(`You moved: ${move.san}`, {
          position: "bottom-right",
          autoClose: 1500
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error making move:", error);
      return false;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Convert the moveHistory to an array of strings for the components
  const moveHistoryStrings = moveHistory.map((move) => {
    if (typeof move === 'string') {
      return move;
    } else {
      return move.san || `${move.from}-${move.to}`;
    }
  });

  return (
    <Layout>
      <div className="app-container">
        {/* Connection status indicator */}
        {connectionStatus !== 'connected' && (
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connecting' && "Connecting to server..."}
            {connectionStatus === 'error' && (
              <>
                Failed to connect with server
                <button onClick={handleReconnect} className="reconnect-button">
                  Reconnect
                </button>
              </>
            )}
            {connectionStatus === 'disconnected' && (
              <>
                Disconnected from server
                <button onClick={handleReconnect} className="reconnect-button">
                  Reconnect
                </button>
              </>
            )}
          </div>
        )}

        <div className="controls-container">
          <Controls
            gameId={gameId || ""}
            createGame={createGame}
            joinGame={joinGame}
            spectateGame={spectateGame}
            joinGameId={joinGameId}
            setJoinGameId={setJoinGameId}
            resignGame={resignGame}
            offerDraw={offerDraw}
            gameStatus={chess.isGameOver() ? "over" : "ongoing"}
            isWhite={playerColor === "white"}
            isBlack={playerColor === "black"}
            isSpectator={isSpectator}
            isConnected={connectionStatus === 'connected'}
          />
        </div>
        
        <div className="game-container">
          <div className="chessboard-container" ref={chessBoardRef}>
            <ResponsiveBoard
              fen={fen}
              onDrop={onDrop}
              playerColor={playerColor || "white"}
              isSpectator={isSpectator}
              lastMove={lastMove}
              chess={chess}
            />
          </div>
          <div className="game-sidebar">
            <GameInformation
              blackPlayerTime={formatTime(blackTime)}
              whitePlayerTime={formatTime(whiteTime)}
              gameStatus={chess.isGameOver() ? "over" : "ongoing"}
              moveHistory={moveHistoryStrings}
              currentPlayer={currentPlayer}
              playerColor={playerColor || "white"}
              isSpectator={isSpectator}
            />
          </div>
        </div>
        
        {/* Draw Dialog */}
        {showDrawDialog && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3>Draw Offered</h3>
              <p>Your opponent has offered a draw. Do you accept?</p>
              <div className="modal-buttons">
                <button onClick={declineDraw} className="btn decline-btn">Decline</button>
                <button onClick={acceptDraw} className="btn accept-btn">Accept</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Game Over Dialog */}
        {gameOver && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3>{winner ? (winner === playerColor ? "You Won!" : "You Lost") : "Game Over"}</h3>
              <p>{gameOverMessage}</p>
              <div className="modal-buttons">
                <button onClick={() => setGameOver(false)} className="btn primary-btn">Close</button>
                <button onClick={createGame} className="btn success-btn">New Game</button>
              </div>
            </div>
          </div>
        )}
        
        <MobileToaster />
      </div>
    </Layout>
  );
};

export default App;
