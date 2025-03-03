import express = require("express");
import * as http from "http";
import { Server as WebSocketServer } from "socket.io";
import net from "net";
import { Chess } from "chess.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server, { cors: { origin: "*" } });

const games: { [key: string]: { chess: Chess, players: string[], spectators: string[] } } = {}; // Store ongoing games, players, and spectators

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("createGame", () => {
    const gameId = Math.random().toString(36).substr(2, 6);
    games[gameId] = { chess: new Chess(), players: [socket.id], spectators: [] };
    socket.join(gameId);
    socket.emit("gameCreated", gameId);
    console.log(`Game created with ID: ${gameId}`);
  });

  socket.on("joinGame", (gameId) => {
    console.log(`Join game request for ID: ${gameId}`);
    if (games[gameId]) {
      if (games[gameId].players.length < 2) {
        games[gameId].players.push(socket.id);
        socket.join(gameId);
        socket.emit("gameJoined", gameId);
        console.log(`Player joined game with ID: ${gameId}`);
      } else {
        games[gameId].spectators.push(socket.id);
        socket.join(gameId);
        socket.emit("gameWatching", gameId);
        console.log(`Spectator joined game with ID: ${gameId}`);
      }
    } else {
      console.log(`Game not found: ${gameId}`);
      socket.emit("error", "Game not found");
    }
  });

  socket.on("move", ({ gameId, move }) => {
    const game = games[gameId]?.chess;
    if (game && game.move(move)) {
      io.to(gameId).emit("updateBoard", game.fen());
      console.log(`Move made in game ${gameId}: ${move}`);
    } else {
      socket.emit("error", "Invalid move");
      console.log(`Invalid move in game ${gameId}: ${move}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
    for (const gameId in games) {
      const game = games[gameId];
      const playerIndex = game.players.indexOf(socket.id);
      const spectatorIndex = game.spectators.indexOf(socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        if (game.players.length === 1) {
          const remainingPlayer = game.players[0];
          io.to(remainingPlayer).emit("gameOver", "Your opponent left the game. You win!");
          delete games[gameId];
          console.log(`Game ${gameId} ended. Player ${remainingPlayer} wins by default.`);
        } else if (game.players.length === 0) {
          delete games[gameId];
          console.log(`Game ${gameId} ended. No players left.`);
        }
        break;
      } else if (spectatorIndex !== -1) {
        game.spectators.splice(spectatorIndex, 1);
        console.log(`Spectator left game ${gameId}`);
      }
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`HTTP/WebSocket server running on port ${port}`);
});

// TCP server
const tcpServer = net.createServer((socket) => {
  console.log("TCP client connected");

  socket.on("data", (data) => {
    const message = data.toString();
    const [command, gameId, move] = message.split(" ");

    if (command === "createGame") {
      const newGameId = Math.random().toString(36).substr(2, 6);
      games[newGameId] = { chess: new Chess(), players: [socket.id], spectators: [] };
      socket.write(`gameCreated ${newGameId}`);
    } else if (command === "joinGame") {
      if (games[gameId]) {
        if (games[gameId].players.length < 2) {
          games[gameId].players.push(socket.id);
          socket.write(`gameJoined ${gameId}`);
        } else {
          games[gameId].spectators.push(socket.id);
          socket.write(`gameWatching ${gameId}`);
        }
      } else {
        socket.write("error Game not found");
      }
    } else if (command === "move") {
      const game = games[gameId]?.chess;
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

const tcpPort = process.env.TCP_PORT || 4000;
tcpServer.listen(tcpPort, () => {
  console.log(`TCP server running on port ${tcpPort}`);
});