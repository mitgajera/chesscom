declare module 'chess.js' {
  export type Square = string;
  
  export interface Move {
    color: string;
    from: string;
    to: string;
    piece: string;
    san?: string;
    flags?: string;
    promotion?: string;
    captured?: string;
    // Add any other properties your code might use
  }
  
  export interface ChessInstance {
    ascii(): string;
    board(): Array<Array<{ type: string; color: string } | null>>;
    clear(): void;
    fen(): string;
    game_over(): boolean;
    get(square: string): { type: string; color: string } | null;
    history(): string[];
    ischeck(): boolean;
    ischeckmate(): boolean;
    isdraw(): boolean;
    isstalemate(): boolean;
    isthreefold_repetition(): boolean;
    insufficient_material(): boolean;
    load(fen: string): boolean;
    load_pgn(pgn: string, options?: { sloppy?: boolean }): boolean;
    move(move: string | { from: string; to: string; promotion?: string }): Move | null;
    moves(options?: { square?: string; verbose?: boolean }): any[];
    pgn(options?: { max_width?: number; newline_char?: string }): string;
    put(piece: { type: string; color: string }, square: string): boolean;
    remove(square: string): { type: string; color: string } | null;
    reset(): void;
    square_color(square: string): string;
    turn(): string;
    undo(): Move | null;
    validate_fen(fen: string): { valid: boolean; error_number: number; error: string };
    
    // Legacy methods that your code might be using
    isGameOver(): boolean;
    isCheckmate(): boolean;
  }

  export class Chess implements ChessInstance {
    constructor(fen?: string);
    // Include all ChessInstance methods here
    ascii(): string;
    board(): Array<Array<{ type: string; color: string } | null>>;
    clear(): void;
    fen(): string;
    game_over(): boolean;
    get(square: string): { type: string; color: string } | null;
    history(): string[];
    ischeck(): boolean;
    ischeckmate(): boolean;
    isdraw(): boolean;
    isstalemate(): boolean;
    isthreefold_repetition(): boolean;
    insufficient_material(): boolean;
    load(fen: string): boolean;
    load_pgn(pgn: string, options?: { sloppy?: boolean }): boolean;
    move(move: string | { from: string; to: string; promotion?: string }): Move | null;
    moves(options?: { square?: string; verbose?: boolean }): any[];
    pgn(options?: { max_width?: number; newline_char?: string }): string;
    put(piece: { type: string; color: string }, square: string): boolean;
    remove(square: string): { type: string; color: string } | null;
    reset(): void;
    square_color(square: string): string;
    turn(): string;
    undo(): Move | null;
    validate_fen(fen: string): { valid: boolean; error_number: number; error: string };
    
    // Legacy methods
    isGameOver(): boolean;
    isCheckmate(): boolean;
  }
}