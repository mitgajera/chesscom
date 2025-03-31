import React, { useState, useEffect, useRef } from "react";
import { Chess } from 'chess.js';
import Layout from "./components/Layout";
import Controls from "./components/Controls";
import ResponsiveBoard from "./components/ResponsiveBoard";
import GameInformation from "./components/GameInformation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "./socket";
import "./styles/App.css";
import "./styles/Controls.css";
import "./styles/ChessBoard.css";
import "./styles/Responsive.css";
import "./styles/ToastFix.css";

// Initialize chess instance
const chess = new Chess();

const App = () => {
  // Unified toast function to handle mobile vs desktop properly
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, options = {}) => {
    const isMobileView = window.innerWidth < 768;
    
    const defaultOptions = {
      position: isMobileView ? "bottom-center" : "bottom-right",
      autoClose: isMobileView ? 2000 : 4000,
      hideProgressBar: isMobileView,
      closeOnClick: true,
      pauseOnHover: !isMobileView,
      draggable: !isMobileView,
      style: isMobileView ? { 
        fontSize: '14px',
        maxWidth: '100%',
        padding: '8px'
      } : undefined
    };
    
    toast[type](message, { ...defaultOptions, ...options });
  };

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
  const isMobile = useRef<boolean>(window.innerWidth < 768);

  // Helper function to show move notifications based on device size
  const showMobileAwareToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, options = {}) => {
    const defaultOptions = isMobile.current ? 
      {
        position: "bottom-center" as const,
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        style: { fontSize: '14px', maxWidth: '90%' }
      } : 
      {
        position: "bottom-right" as const,
        autoClose: 3000,
      };
    
    toast[type](message, { ...defaultOptions, ...options });
  };

  // Track window resize to detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      isMobile.current = window.innerWidth < 768;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track connection status
  useEffect(() => {
    const onConnect = () => {
      console.log("Connected to WebSocket server");
      setConnectionStatus('connected');
      showMobileAwareToast('success', "Connected to server");
    };

    const onDisconnect = () => {
      console.log("Disconnected from WebSocket server");
      setConnectionStatus('disconnected');
      showMobileAwareToast('error', "Disconnected from server");
    };

    const onConnectError = (error: any) => {
      console.error("Connection error:", error);
      setConnectionStatus('error');
      showMobileAwareToast('error', "Failed to connect to server", { autoClose: false });
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
      
      showMobileAwareToast('success', `Game created! ID: ${gameId}`);
      
      // Copy the game ID to clipboard for easier sharing
      navigator.clipboard.writeText(gameId)
        .then(() => {
          showMobileAwareToast('info', "Game ID copied to clipboard");
        })
        .catch(err => console.error("Could not copy game ID", err));
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
      
      showMobileAwareToast('success', `Joined game as ${color}`);
    });
    
    socket.on("opponentJoined", ({ color }) => {
      showMobileAwareToast('info', `Opponent joined as ${color}`);
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
        console.log("Processing move history for spectator:", moveHistory);
        
        // Convert all move objects to a consistent format for display
        const processedMoves = moveHistory.map(move => {
          // Handle different move formats that might come from the server
          if (typeof move === 'string') {
            return move;
          } else if (move && move.san) {
            return move.san;
          } else if (move && move.from && move.to) {
            // If we only have from/to coordinates, create a basic move notation
            return `${move.from}-${move.to}`;
          }
          return '';
        }).filter(Boolean); // Remove any empty entries
        
        console.log("Processed moves:", processedMoves);
        setMoveHistory(processedMoves);
        
        // Set the last move for highlighting if available
        if (moveHistory.length > 0) {
          const lastMoveData = moveHistory[moveHistory.length - 1];
          if (typeof lastMoveData === 'object' && lastMoveData.from && lastMoveData.to) {
            setLastMove({
              from: lastMoveData.from,
              to: lastMoveData.to
            });
          }
        }
      }
      
      showMobileAwareToast('info', `Watching game ${gameId} as spectator`, { autoClose: 3000 });
    });

    socket.on("move", ({ fen, move, isWhiteTurn, whiteTime, blackTime }) => {
      console.log("Received move:", { fen, move, isWhiteTurn });
      
      try {
        chess.load(fen);
        setFen(fen);
        
        // Update current player turn
        const newCurrentPlayer = isWhiteTurn ? "white" : "black";
        setCurrentPlayer(newCurrentPlayer);
        
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
        }
      } catch (error) {
        console.error("Error processing move:", error);
      }
    });

    socket.on("drawOffered", () => {
      setShowDrawDialog(true);
      showMobileAwareToast('info', "Your opponent has offered a draw", { autoClose: false });
    });

    socket.on("gameOver", (result) => {
      console.log("Game over event received:", result);
      const { message, winner } = typeof result === 'string' ? { message: result, winner: null } : result;
      
      setGameOver(true);
      setGameOverMessage(message);
      setWinner(winner);
      setGameStarted(false);
      
      // Show different messages based on player type
      if (isSpectator) {
        const winnerColor = winner === 'white' ? 'White' : 'Black';
        showToast('info', `Game over: ${winnerColor} ${winner ? 'won' : 'drew the game'}. ${message}`, { autoClose: 10000 });
      } else if (winner === playerColor) {
        showToast('success', `You won! ${message}`, { autoClose: 10000 });
      } else if (winner) {
        showToast('error', `You lost! ${message}`, { autoClose: 10000 });
      } else {
        showToast('info', `Game over: ${message}`, { autoClose: 10000 });
      }
      
      if (timerRef.current) clearInterval(timerRef.current);
    });

    socket.on("error", (message) => {
      showMobileAwareToast('error', message);
    });

    return () => {
      socket.off("gameCreated");
      socket.off("gameJoined");
      socket.off("opponentJoined");
      socket.off("joinedAsSpectator");
      socket.off("move");
      socket.off("drawOffered");
      socket.off("gameOver");
      socket.off("error");
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Modified timer effect that correctly handles both players' timers
  useEffect(() => {
    // Only run timer when game has started and not over
    if (gameStarted && !gameOver && gameId) {
      timerRef.current = setInterval(() => {
        if (currentPlayer === "white") {
          // Only decrement white's timer when it's white's turn
          setWhiteTime((prev) => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              if (timerRef.current) clearInterval(timerRef.current);
              // Only emit timeUp if you're the player whose time ran out
              if (playerColor === "white" && !isSpectator) {
                socket.emit("timeUp", { gameId, loser: "white" });
              }
              return 0;
            }
            
            // Only send timer updates if you're one of the players (not spectator)
            if (!isSpectator && playerColor) {
              socket.emit("timerUpdate", { gameId, whiteTime: newTime, blackTime });
            }
            return newTime;
          });
        } else {
          // Only decrement black's timer when it's black's turn
          setBlackTime((prev) => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              if (timerRef.current) clearInterval(timerRef.current);
              // Only emit timeUp if you're the player whose time ran out
              if (playerColor === "black" && !isSpectator) {
                socket.emit("timeUp", { gameId, loser: "black" });
              }
              return 0;
            }
            
            // Only send timer updates if you're one of the players (not spectator)
            if (!isSpectator && playerColor) {
              socket.emit("timerUpdate", { gameId, whiteTime, blackTime: newTime });
            }
            return newTime;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [gameStarted, gameOver, currentPlayer, playerColor, isSpectator, gameId, whiteTime, blackTime]);

  // Manual reconnect function
  const handleReconnect = () => {
    setConnectionStatus('connecting');
    socket.connect();
    showMobileAwareToast('info', "Attempting to reconnect...");
  };

  // Game actions
  const createGame = () => {
    console.log("Creating new game");
    socket.emit("createGame");
  };

  const joinGame = () => {
    if (!joinGameId.trim()) {
      showMobileAwareToast('warning', "Please enter a game ID");
      return;
    }
    
    // Check if user is trying to join their own game
    if (joinGameId === gameId) {
      showMobileAwareToast('error', "You cannot join your own game!");
      return;
    }
    
    console.log("Joining game with ID:", joinGameId);
    socket.emit("joinGame", { gameId: joinGameId });
  };

  const spectateGame = () => {
    if (!joinGameId.trim()) {
      showMobileAwareToast('warning', "Please enter a game ID to spectate");
      return;
    }
    
    console.log("Spectating game with ID:", joinGameId);
    socket.emit("spectateGame", { gameId: joinGameId });
  };

  const resignGame = () => {
    if (gameId && !isSpectator) {
      socket.emit("resignGame", { gameId, color: playerColor });
      showMobileAwareToast('info', "You resigned the game");
    } else if (isSpectator) {
      showMobileAwareToast('warning', "Spectators cannot resign games");
    }
  };

  const offerDraw = () => {
    if (gameId && !isSpectator) {
      socket.emit("offerDraw", { gameId, offeredBy: playerColor });
      showMobileAwareToast('info', "Draw offered to opponent");
    } else if (isSpectator) {
      showMobileAwareToast('warning', "Spectators cannot offer draws");
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
      showMobileAwareToast('warning', "You are only watching the game");
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
      showMobileAwareToast('warning', `It's ${chessTurn}'s turn. Please wait for your turn.`);
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
          fromPlayerId: socket.id
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
              {isSpectator ? (
                // Spectator view
                <h3>{winner ? `${winner === 'white' ? 'White' : 'Black'} Won!` : "Game Over"}</h3>
              ) : (
                // Player view
                <h3>{winner ? (winner === playerColor ? "You Won!" : "You Lost") : "Game Over"}</h3>
              )}
              
              <p>{gameOverMessage}</p>
              
              <div className="modal-buttons">
                <button onClick={() => setGameOver(false)} className="btn primary-btn">Close</button>
                {!isSpectator && (
                  <button onClick={createGame} className="btn success-btn">New Game</button>
                )}
                {isSpectator && (
                  <button onClick={() => navigate('/')} className="btn primary-btn">Back to Home</button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile-friendly toast container */}
        <ToastContainer
          position={isMobile.current ? "bottom-center" : "bottom-right"}
          autoClose={isMobile.current ? 2000 : 4000}
          hideProgressBar={isMobile.current}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={!isMobile.current}
          draggable={!isMobile.current}
          pauseOnHover={!isMobile.current}
          theme="light"
          style={isMobile.current ? {
            width: '100%',
            maxWidth: '100%',
            margin: 0,
            padding: 0,
            bottom: 0,
            left: 0,
            right: 0
          } : undefined}
          toastClassName={isMobile.current ? "mobile-toast" : ""}
          bodyClassName={isMobile.current ? "mobile-toast-body" : ""}
        />
      </div>
    </Layout>
  );
};

export default App;
