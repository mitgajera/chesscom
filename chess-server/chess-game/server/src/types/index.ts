export interface Game {
  id: string;
  players: Player[];
  state: string; // e.g., "in-progress", "finished"
  moves: Move[];
}

export interface Move {
  from: string; // e.g., "e2"
  to: string;   // e.g., "e4"
  piece: string; // e.g., "pawn"
  playerId: string; // ID of the player making the move
}

export interface Player {
  id: string;
  name: string;
  color: string; // e.g., "white" or "black"
}