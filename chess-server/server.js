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

  socket.on('createGame', () => {
    const gameId = generateGameId();
    games[gameId] = {
      whiteTime: 600,
      blackTime: 600,
      whitePlayer: socket.id,
      blackPlayer: null,
      spectators: [],
      fen: 'start',
    };
    socket.join(gameId);
    socket.emit('gameCreated', { gameId });
  });

  socket.on('joinGame', ({ gameId }) => {
    if (games[gameId]) {
      socket.join(gameId);
      socket.emit('gameJoined', { gameId, color: 'black' });
      io.to(gameId).emit('startGame', { gameId });
    } else {
      socket.emit('error', 'Game not found');
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
