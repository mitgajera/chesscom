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
  timeLeft?: number; // Added timeLeft property
  color?: 'white' | 'black'; // Added color property
  capturedPieces?: ChessPiece[]; // Added capturedPieces property
}

export interface ChessPiece {
  type: string;
  color: 'white' | 'black';
}

export const getInitialGameState = (): GameState => ({
  board: {},
  selectedSquare: null,
  validMoves: [],
  currentTurn: 'white',
  moves: [],
  status: 'not_started',
  whitePlayer: { name: 'White Player', rating: 200 },
  blackPlayer: { name: 'Black Player', rating: 200 },
});

export const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const PieceColor = (piece: ChessPiece): string => {
  return piece.color;
};

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const isLightSquare = (file: string, rank: string): boolean => {
  const fileIndex = FILES.indexOf(file);
  const rankIndex = RANKS.indexOf(rank);
  return (fileIndex + rankIndex) % 2 === 0;
};