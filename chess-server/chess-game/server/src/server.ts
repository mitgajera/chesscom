import express from "express";
import http from "http";
import { Server } from "socket.io";
import { GameController } from "./controllers/gameController";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const gameController = new GameController();

app.use(express.json());

app.use("/api/games", gameController.router);

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("createGame", () => {
    const gameId = gameController.createGame();
    socket.join(gameId);
    socket.emit("gameCreated", gameId);
  });

  socket.on("joinGame", (gameId) => {
    if (gameController.joinGame(gameId, socket.id)) {
      socket.join(gameId);
      socket.emit("gameJoined", gameId);
    } else {
      socket.emit("error", "Game not found");
    }
  });

  socket.on("move", ({ gameId, move }) => {
    const result = gameController.makeMove(gameId, move);
    if (result.success) {
      io.to(gameId).emit("updateBoard", result.fen);
    } else {
      socket.emit("error", result.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});