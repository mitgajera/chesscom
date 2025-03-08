export interface GameState {
  board: { [key: string]: any };
  selectedSquare: string | null;
  validMoves: string[];
  currentTurn: 'white' | 'black';
  moves: ChessMove[];
  status: 'not_started' | 'in_progress' | 'check' | 'checkmate' | 'stalemate' | 'draw';
  whitePlayer: Player;
  blackPlayer: Player;
}

export interface ChessMove {
  piece: any;
  from: string;
  to: string;
  notation: string;
  capturedPiece?: any;
}

export interface Player {
  name: string;
  rating: number;
}

export const getInitialGameState = (): GameState => ({
  board: {},
  selectedSquare: null,
  validMoves: [],
  currentTurn: 'white',
  moves: [],
  status: 'not_started',
  whitePlayer: { name: 'White Player', rating: 1200 },
  blackPlayer: { name: 'Black Player', rating: 1200 },
});