"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');
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
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

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
    game.chess.load(fen);
    game.whiteTime = whiteTime;
    game.blackTime = blackTime;
    
    // Store the move in the game's move history
    if (move) {
      game.moveHistory.push(move);
    }
    
    // Broadcast the move to all clients in the game room including who made the move
    io.to(gameId).emit('move', { 
      fen, 
      move, 
      isWhiteTurn, 
      whiteTime, 
      blackTime,
      fromPlayerId // Pass the ID of who made the move
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

  // In your chess-server code, modify the spectateGame handler

  socket.on('spectateGame', ({ gameId }) => {
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }
    
    // Add spectator to the game
    game.spectators.push(socket.id);
    
    // Format move history to be consistent with what clients expect
    const formattedMoveHistory = game.moveHistory || [];
    
    // Join the game room
    socket.join(`game:${gameId}`);
    
    // Emit the current game state to the spectator
    socket.emit('joinedAsSpectator', { 
      gameId,
      message: 'You joined as a spectator',
      currentFen: game.fen,
      moveHistory: formattedMoveHistory, // Send complete move history
      whiteTime: game.whiteTime,
      blackTime: game.blackTime,
      currentPlayer: game.turn === 'w' ? 'white' : 'black'
    });
    
    // Notify players that a new spectator joined
    io.to(`game:${gameId}`).emit('spectatorJoined', {
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

server.use(express.static(path.join(__dirname, 'dist')));
server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
}); 

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
