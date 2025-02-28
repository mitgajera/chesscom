import { Router } from "express";
import GameController from "../controllers/gameController";

const router = Router();
const gameController = new GameController();

export function setRoutes(app: Router) {
  app.post("/api/games", gameController.createGame.bind(gameController));
  app.post("/api/games/:gameId/join", gameController.joinGame.bind(gameController));
  app.post("/api/games/:gameId/move", gameController.makeMove.bind(gameController));
  app.get("/api/games/:gameId", gameController.getGameState.bind(gameController));
}