// Common types
export type PlayerColor = "white" | "black";

// Game related types
export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  piece?: string;
  color?: string;
  flags?: string;
  san?: string;
}

export interface GameState {
    
  gameId: string | null;
  fen: string;
  whiteTime: number;
  blackTime: number;
  isWhiteTurn: boolean;
  moveHistory: ChessMove[];
  isGameOver: boolean;
  result?: string;
  winner?: PlayerColor | "draw" | null;
}

// Component props
export interface ChessBoardProps {
  fen: string;
  onDrop: (sourceSquare: string, targetSquare: string) => boolean;
  playerColor: PlayerColor;
  isSpectator: boolean;
  gameId: string;
  lastMove: {from: string, to: string} | null;
}

export interface ControlsProps {
  gameId: string;
  createGame: () => void;
  joinGame: () => void;
  spectateGame: () => void;
  joinGameId: string;
  setJoinGameId: React.Dispatch<React.SetStateAction<string>>;
  resignGame: () => void;
  offerDraw: () => void;
  gameStatus: string;
}

export interface GameInformationProps {
  blackPlayerTime: string;
  whitePlayerTime: string;
  gameStatus: string;
  moveHistory: string[];
  currentPlayer: PlayerColor;
  playerColor: PlayerColor;
}

export interface ChatMessage {
  message: string;
  senderName: string;
  playerType: PlayerColor | 'spectator';
  timestamp: string;
}

export interface ChatBoxProps {
  gameId: string;
  isSpectator: boolean;
  playerColor: PlayerColor;
}

// Socket event types
export interface GameCreatedEvent {
  gameId: string;
}

export interface GameJoinedEvent {
  gameId: string;
  color: PlayerColor;
  fen?: string;
  moveHistory?: ChessMove[];
}

export interface JoinedAsSpectatorEvent {
  gameId: string;
  message?: string;
  currentFen: string;
  moveHistory?: ChessMove[];
  whiteTime?: number;
  blackTime?: number;
}

export interface MoveEvent {
  fen: string;
  move: ChessMove;
  isWhiteTurn: boolean;
  whiteTime: number;
  blackTime: number;
  fromSocketId?: string;
  player?: 'w' | 'b';
}

export interface GameOverEvent {
  message: string;
  winner: PlayerColor | "draw" | null;
}

export interface TimerUpdateEvent {
  whiteTime: number;
  blackTime: number;
}

export interface DrawOfferEvent {
  gameId: string;
  offeredBy: PlayerColor;
}

// Socket interface
export interface ServerToClientEvents {
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
  gameCreated: (event: GameCreatedEvent) => void;
  gameJoined: (event: GameJoinedEvent) => void;
  opponentJoined: (event: { color: PlayerColor; playerName?: string }) => void;
  joinedAsSpectator: (event: JoinedAsSpectatorEvent) => void;
  spectatorJoined: (event: { spectatorsCount: number }) => void;
  startGame: (event: { gameId: string; whitePlayerName?: string; blackPlayerName?: string }) => void;
  move: (event: MoveEvent) => void;
  timerUpdate: (event: TimerUpdateEvent) => void;
  drawOffered: (event: DrawOfferEvent) => void;
  gameOver: (event: GameOverEvent | string) => void;
  error: (message: string) => void;
  chatMessage: (message: ChatMessage) => void;
  spectatorCountUpdate: (event: { spectatorsCount: number }) => void;
}

export interface ClientToServerEvents {
  createGame: () => void;
  joinGame: (data: { gameId: string }) => void;
  spectateGame: (data: { gameId: string }) => void;
  move: (data: {
    gameId: string;
    move: ChessMove;
    fen: string;
    isWhiteTurn: boolean;
    whiteTime: number;
    blackTime: number;
    fromSocketId?: string;
    player?: 'w' | 'b';
  }) => void;
  timerUpdate: (data: { gameId: string; whiteTime: number; blackTime: number }) => void;
  timeUp: (data: { gameId: string; loser: PlayerColor }) => void;
  resignGame: (data: { gameId: string; color: PlayerColor }) => void;
  offerDraw: (data: { gameId: string; offeredBy: PlayerColor }) => void;
  acceptDraw: (data: { gameId: string }) => void;
  declineDraw: (data: { gameId: string }) => void;
  sendMessage: (data: { gameId: string; message: string }) => void;
}