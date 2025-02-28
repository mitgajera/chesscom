export interface Player {
  id: string;
  name: string;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string; // optional promotion piece
}

export interface Game {
  id: string;
  players: Player[];
  moves: Move[];
  currentTurn: string; // player id of the current turn
  boardState: string; // FEN string representing the board state
}