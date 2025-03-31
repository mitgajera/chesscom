"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Chess } = require('chess.js');
const path = require('path');

const app = express();
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic health check route
app.get('/health', (req, res) => {
  res.send({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = http.createServer(app);

// Enhanced Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Listen on all interfaces with your port
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

let games = {}; // Store ongoing games

// Game ID generation function
function generateGameId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Socket event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'using', socket.conn.transport.name);

  socket.on("createGame", () => {
    const gameId = generateGameId();
    
    // Create new game state
    games[gameId] = {
      creator: socket.id,
      whitePlayer: socket.id,
      blackPlayer: null,
      chess: new Chess(),
      whiteTime: 600,
      blackTime: 600,
      spectators: [],
      moveHistory: [],
      isGameActive: false
    };
    
    // Add socket to the game room
    socket.join(gameId);
    
    // Emit the gameCreated event with the game ID
    socket.emit("gameCreated", { gameId });
    
    console.log(`Game created with ID: ${gameId}`);
  });

  // Logic for joining a game
  socket.on("joinGame", ({ gameId }) => {
    const game = games[gameId];
    
    if (!game) {
      socket.emit("error", "Game not found. Please check the game ID.");
      return;
    }
    
    // Check if this user is the creator of the game
    if (game.creator === socket.id) {
      socket.emit("error", "You cannot join your own game!");
      return;
    }
    
    // Check if BOTH player slots are filled
    if (game.whitePlayer && game.blackPlayer) {
      console.log(`Game ${gameId} already has two players. User ${socket.id} joining as spectator.`);
      
      // Add to spectators list
      game.spectators.push(socket.id);
      
      // Join the socket room to receive game updates
      socket.join(gameId);
      
      // Explicitly notify client they are a spectator
      socket.emit("joinedAsSpectator", {
        gameId,
        message: "Game already has two players. You joined as a spectator.",
        currentFen: game.chess.fen()
      });
      
      return;
    }
    
    // If we reach here, at least one player slot is open
    let assignedColor;
    
    if (!game.whitePlayer) {
      game.whitePlayer = socket.id;
      assignedColor = "white";
    } else if (!game.blackPlayer) {
      game.blackPlayer = socket.id;
      assignedColor = "black";
    }
    
    // Join the socket room
    socket.join(gameId);
    
    // Notify the client they joined successfully as a player
    socket.emit("gameJoined", { gameId, color: assignedColor });
    
    // Notify other players that someone joined
    socket.to(gameId).emit("opponentJoined", { color: assignedColor });
    
    console.log(`Player joined game ${gameId} as ${assignedColor}`);
    
    // If the game is now full, update game status
    if (game.whitePlayer && game.blackPlayer) {
      console.log(`Game ${gameId} is now full with both players`);
      game.isGameActive = true;
      
      // Emit startGame event to all clients in the room
      io.to(gameId).emit("startGame", { gameId });
    }
  });

  // Handle move events
  socket.on('move', ({ gameId, move, fen, isWhiteTurn, whiteTime, blackTime, fromPlayerId }) => {
    if (!games[gameId]) return;
    
    const game = games[gameId];
    
    // Update game state with the new position
    game.chess.load(fen);
    game.fen = fen;
    
    // Update timers
    if (typeof whiteTime === 'number') game.whiteTime = whiteTime;
    if (typeof blackTime === 'number') game.blackTime = blackTime;
    
    // Store the move in history
    if (move) {
      game.moveHistory.push(move);
    }
    
    // Determine which color's turn it is from the chess board state
    // Note: After the move, it's the other player's turn
    const currentTurn = game.chess.turn() === 'w' ? 'white' : 'black';
    // The player who made the move is the opposite of the current turn
    const movePlayerColor = currentTurn === 'white' ? 'black' : 'white';
    
    // Broadcast the move to all clients
    io.to(gameId).emit('move', { 
      fen, 
      move, 
      isWhiteTurn: currentTurn === 'white',
      whiteTime: game.whiteTime, 
      blackTime: game.blackTime,
      fromPlayerId,
      playerColor: movePlayerColor  // Add the color of the player who made the move
    });
    
    // Check if the game is over after this move
    if (game.chess.isGameOver()) {
      let message = "";
      
      if (game.chess.isCheckmate()) {
        const winner = game.chess.turn() === 'w' ? "Black" : "White";
        message = `Checkmate! ${winner} wins.`;
      } else if (game.chess.isDraw()) {
        message = "Game ended in a draw.";
      }
      
      io.to(gameId).emit('gameOver', { 
        message,
        winner: game.chess.turn() === 'w' ? "black" : "white" 
      });
      
      // Optionally clean up the game after a delay
      setTimeout(() => {
        delete games[gameId];
      }, 3600000); // Clean up after 1 hour
    }
  });

  socket.on('timerUpdate', ({ gameId, whiteTime, blackTime }) => {
    if (!games[gameId]) return;
    
    games[gameId].whiteTime = whiteTime;
    games[gameId].blackTime = blackTime;
    
    // Broadcast timer updates to spectators and the other player
    socket.to(gameId).emit('timerUpdate', { whiteTime, blackTime });
  });
  
  socket.on('timeUp', ({ gameId, loser }) => {
    if (!games[gameId]) return;
    
    const winner = loser === 'white' ? 'Black' : 'White';
    io.to(gameId).emit('gameOver', {
      message: `Time's up! ${winner} wins by timeout.`,
      winner: loser === 'white' ? 'black' : 'white'
    });
    
    // Optionally clean up the game
    setTimeout(() => {
      delete games[gameId];
    }, 3600000); // Clean up after 1 hour
  });

  socket.on('resignGame', ({ gameId, color }) => {
    if (!games[gameId]) return;
    
    const winner = color === 'white' ? 'Black' : 'White';
    io.to(gameId).emit('gameOver', {
      message: `${color === 'white' ? 'White' : 'Black'} resigned. ${winner} wins!`,
      winner: color === 'white' ? 'black' : 'white'
    });
    
    // Optionally clean up the game
    setTimeout(() => {
      delete games[gameId];
    }, 3600000); // Clean up after 1 hour
  });

  socket.on('offerDraw', ({ gameId, offeredBy }) => {
    if (!games[gameId]) return;
    
    // Inform the other player about draw offer
    const game = games[gameId];
    const recipient = offeredBy === 'white' ? game.blackPlayer : game.whitePlayer;
    
    if (recipient) {
      io.to(recipient).emit('drawOffered', { 
        gameId,
        offeredBy
      });
    }
  });

  socket.on('acceptDraw', ({ gameId }) => {
    if (!games[gameId]) return;
    
    io.to(gameId).emit('gameOver', {
      message: 'Game ended in a draw by agreement.',
      winner: null
    });
    
    // Optionally clean up the game
    setTimeout(() => {
      delete games[gameId];
    }, 3600000); // Clean up after 1 hour
  });

  // Fix spectator handling to include proper move history
  socket.on('spectateGame', ({ gameId }) => {
    const game = games[gameId]; // Changed games.get(gameId) to games[gameId]
    
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }
    
    // Add spectator to the game
    game.spectators.push(socket.id);
    
    // Join the game room
    socket.join(gameId);
    
    // Ensure moveHistory exists
    if (!game.moveHistory) {
      game.moveHistory = [];
    }
    
    // Ensure all moves have from/to properties for highlighting
    const enhancedMoveHistory = game.moveHistory.map(move => {
      // If move is already an object with from/to, return as is
      if (typeof move === 'object' && move.from && move.to) {
        return move;
      }
      
      // If it's a string like "e2e4", extract from/to
      if (typeof move === 'string' && move.length >= 4) {
        return {
          from: move.substring(0, 2),
          to: move.substring(2, 4),
          san: move
        };
      }
      
      // As fallback, return original move
      return move;
    });
    
    // Send complete game state to spectator
    socket.emit('joinedAsSpectator', { 
      gameId,
      message: 'You joined as a spectator',
      currentFen: game.chess.fen(),
      moveHistory: enhancedMoveHistory,
      whiteTime: game.whiteTime,
      blackTime: game.blackTime,
      currentPlayer: game.chess.turn() === 'w' ? 'white' : 'black'
    });
    
    // Notify everyone about new spectator
    io.to(gameId).emit('spectatorCountUpdate', {
      spectatorsCount: game.spectators.length
    });
    
    console.log(`Spectator ${socket.id} joined game ${gameId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find any games where this player was participating
    for (const gameId in games) {
      const game = games[gameId];
      
      // If this was a player (not a spectator)
      if (game.whitePlayer === socket.id || game.blackPlayer === socket.id) {
        // If game hasn't started yet, just remove the player
        if (!game.isGameActive) {
          if (game.whitePlayer === socket.id) game.whitePlayer = null;
          if (game.blackPlayer === socket.id) game.blackPlayer = null;
          
          // If creator left and no one else joined, delete the game
          if (game.creator === socket.id && !game.whitePlayer && !game.blackPlayer && game.spectators.length === 0) {
            delete games[gameId];
          }
        } else {
          // Game was in progress, declare the other player as winner
          const winner = game.whitePlayer === socket.id ? 'Black' : 'White';
          io.to(gameId).emit('gameOver', {
            message: `${game.whitePlayer === socket.id ? 'White' : 'Black'} disconnected. ${winner} wins!`,
            winner: game.whitePlayer === socket.id ? 'black' : 'white'
          });
          
          // Clean up the game after a delay
          setTimeout(() => {
            delete games[gameId];
          }, 3600000); // Clean up after 1 hour
        }
      } else if (game.spectators.includes(socket.id)) {
        // Remove from spectators list
        game.spectators = game.spectators.filter(id => id !== socket.id);
      }
    }
  });
});
