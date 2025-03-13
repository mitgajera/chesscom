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

const games = {}; // Store ongoing games

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('createGame', () => {
    const gameId = generateGameId();
    games[gameId] = { players: [socket.id], spectators: [] };
    socket.join(gameId);
    socket.emit('gameCreated', { gameId }); // Emit the game ID to the client
    console.log(`Game created with ID: ${gameId}`);
  });

  socket.on('joinGame', (data) => {
    const { gameId } = data;
    if (games[gameId]) {
      if (games[gameId].players.length < 2) {
        games[gameId].players.push(socket.id);
        socket.join(gameId);
        socket.emit('gameJoined', { gameId, color: 'black' });
        io.to(gameId).emit('startGame', { gameId });
        console.log(`User joined game with ID: ${gameId}`);
      } else {
        games[gameId].spectators.push(socket.id);
        socket.join(gameId);
        socket.emit('spectatorJoined', { gameId });
        console.log(`Spectator joined game with ID: ${gameId}`);
      }
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('move', (data) => {
    const { gameId, fen, isWhiteTurn } = data;
    socket.to(gameId).emit('move', { fen, isWhiteTurn });
    console.log(`Move made in game ${gameId}: ${fen}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    for (const gameId in games) {
      const game = games[gameId];
      game.players = game.players.filter((id) => id !== socket.id);
      game.spectators = game.spectators.filter((id) => id !== socket.id);
      if (game.players.length === 0 && game.spectators.length === 0) {
        delete games[gameId];
      }
    }
  });
});

function generateGameId() {
  return Math.random().toString(36).substring(2, 9);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
