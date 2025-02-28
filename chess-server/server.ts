import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const games: { [key: string]: Chess } = {}; // Store ongoing games

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("createGame", () => {
    const gameId = Math.random().toString(36).substr(2, 6);
    games[gameId] = new Chess();
    socket.join(gameId);
    socket.emit("gameCreated", gameId);
  });

  socket.on("joinGame", (gameId) => {
    if (games[gameId]) {
      socket.join(gameId);
      socket.emit("gameJoined", gameId);
    } else {
      socket.emit("error", "Game not found");
    }
  });

  socket.on("move", ({ gameId, move }) => {
    const game = games[gameId];
    if (game && game.move(move)) {
      io.to(gameId).emit("updateBoard", game.fen()); // Send updated game state
    } else {
      socket.emit("error", "Invalid move");
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
