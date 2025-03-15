"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

let games = {}; // Store ongoing games

// Game ID generation function
function generateGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  // Generate a random length between 6 and 8
  const length = Math.floor(Math.random() * 3) + 6;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Ensure uniqueness by checking against existing game IDs
  if (games[result]) {
    return generateGameId(); // Recursively try again if ID already exists
  }
  
  return result;
}

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on("createGame", () => {
    const gameId = generateGameId(); // Your existing function to generate game IDs
    
    // Create new game state
    games[gameId] = {
      creator: socket.id,
      whitePlayer: socket.id,
      blackPlayer: null,
      whiteTime: 600,
      blackTime: 600,
      spectators: [],
      fen: 'start'
    };
    
    // Add socket to the game room
    socket.join(gameId);
    
    // Emit the gameCreated event with the game ID
    socket.emit("gameCreated", { gameId });
    
    console.log(`Game created with ID: ${gameId}`);
  });

  // Complete logic for joining a game

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
      if (!game.spectators) {
        game.spectators = [];
      }
      game.spectators.push(socket.id);
      
      // Join the socket room to receive game updates
      socket.join(gameId);
      
      // Explicitly notify client they are a spectator
      socket.emit("joinedAsSpectator", {
        gameId,
        message: "Game already has two players. You joined as a spectator."
      });
      
      // Send current game state to the spectator
      socket.emit("gameState", {
        fen: game.fen,
        turn: game.turn,
        moveHistory: game.moveHistory || [],
        // Other game state properties
        whiteTime: game.whiteTime,
        blackTime: game.blackTime
      });
      
      return;  // Important! Stop execution here
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
      // Additional game start logic if needed
    }
  });

  socket.on('move', ({ gameId, fen, isWhiteTurn, whiteTime, blackTime }) => {
    if (games[gameId]) {
      games[gameId].fen = fen;
      games[gameId].whiteTime = whiteTime;
      games[gameId].blackTime = blackTime;
      io.to(gameId).emit('move', { fen, isWhiteTurn, whiteTime, blackTime });
    }
  });

  socket.on('timerUpdate', ({ gameId, whiteTime, blackTime }) => {
    if (games[gameId]) {
      games[gameId].whiteTime = whiteTime;
      games[gameId].blackTime = blackTime;
      io.to(gameId).emit('timerUpdate', { whiteTime, blackTime });
    }
  });

  socket.on('resignGame', ({ gameId }) => {
    if (games[gameId]) {
      io.to(gameId).emit('gameOver', 'Opponent resigned');
      delete games[gameId];
    }
  });

  socket.on('offerDraw', ({ gameId }) => {
    if (games[gameId]) {
      io.to(gameId).emit('gameOver', 'Draw offered');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
