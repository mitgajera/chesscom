"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var socket_io_1 = require("socket.io");
var chess_js_1 = require("chess.js");
var app = express();
var server = http.createServer(app);
var io = new socket_io_1.Server(server, { cors: { origin: "*" } });
var games = {}; // Store ongoing games
io.on("connection", function (socket) {
    console.log("A player connected:", socket.id);
    socket.on("createGame", function () {
        var gameId = Math.random().toString(36).substr(2, 6);
        games[gameId] = new chess_js_1.Chess();
        socket.join(gameId);
        socket.emit("gameCreated", gameId);
    });
    socket.on("joinGame", function (gameId) {
        if (games[gameId]) {
            socket.join(gameId);
            socket.emit("gameJoined", gameId);
        }
        else {
            socket.emit("error", "Game not found");
        }
    });
    socket.on("move", function (_a) {
        var gameId = _a.gameId, move = _a.move;
        var game = games[gameId];
        if (game && game.move(move)) {
            io.to(gameId).emit("updateBoard", game.fen()); // Send updated game state
        }
        else {
            socket.emit("error", "Invalid move");
        }
    });
    socket.on("disconnect", function () {
        console.log("A player disconnected:", socket.id);
    });
});
server.listen(3000, function () {
    console.log("Server running on port 3000");
});
