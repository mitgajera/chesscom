import express = require("express");
import * as http from "http";
import { Server as WebSocketServer } from "socket.io";
import net from "net";
import { Chess } from "chess.js";

const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server, { cors: { origin: "*" } });

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
      io.to(gameId).emit("updateBoard", game.fen());
    } else {
      socket.emit("error", "Invalid move");
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("HTTP/WebSocket server running on port 3000");
});

// TCP server
const tcpServer = net.createServer((socket) => {
  console.log("TCP client connected");

  socket.on("data", (data) => {
    const message = data.toString();
    const [command, gameId, move] = message.split(" ");

    if (command === "createGame") {
      const newGameId = Math.random().toString(36).substr(2, 6);
      games[newGameId] = new Chess();
      socket.write(`gameCreated ${newGameId}`);
    } else if (command === "joinGame") {
      if (games[gameId]) {
        socket.write(`gameJoined ${gameId}`);
      } else {
        socket.write("error Game not found");
      }
    } else if (command === "move") {
      const game = games[gameId];
      if (game && game.move(move)) {
        socket.write(`updateBoard ${game.fen()}`);
      } else {
        socket.write("error Invalid move");
      }
    }
  });

  socket.on("end", () => {
    console.log("TCP client disconnected");
  });
});

tcpServer.listen(4000, () => {
  console.log("TCP server running on port 4000");
});