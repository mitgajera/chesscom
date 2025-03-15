
declare module 'chess.js' {
  export type Square = string;
  
  export interface Move {
    color: 'w' | 'b';
    from: Square;
    to: Square;
    flags: string;
    piece: string;
    san?: string;
    promotion?: string;
    captured?: string;
  }
  
  export interface ChessInstance {
    ascii(): string;
    board(): Array<Array<{ type: string; color: string } | null>>;
    clear(): void;
    fen(): string;
    game_over(): boolean;
    get(square: Square): { type: string; color: string } | null;
    history(): string[];
    in_check(): boolean;
    in_checkmate(): boolean;
    in_draw(): boolean;
    in_stalemate(): boolean;
    in_threefold_repetition(): boolean;
    insufficient_material(): boolean;
    load(fen: string): boolean;
    load_pgn(pgn: string, options?: { sloppy?: boolean }): boolean;
    move(move: string | { from: Square; to: Square; promotion?: string }): Move | null;
    moves(options?: { square?: string; verbose?: boolean }): string[] | Move[];
    pgn(options?: { max_width?: number; newline_char?: string }): string;
    put(piece: { type: string; color: string }, square: Square): boolean;
    remove(square: Square): { type: string; color: string } | null;
    reset(): void;
    square_color(square: Square): string;
    turn(): string;
    undo(): Move | null;
    validate_fen(fen: string): { valid: boolean; error_number: number; error: string };
    
    // Add these aliases for your code
    isGameOver(): boolean;
    isCheckmate(): boolean;
  }

  export class Chess implements ChessInstance {
    constructor(fen?: string);
    // Include all methods from ChessInstance
    ascii(): string;
    board(): Array<Array<{ type: string; color: string } | null>>;
    clear(): void;
    fen(): string;
    game_over(): boolean;
    get(square: Square): { type: string; color: string } | null;
    history(): string[];
    in_check(): boolean;
    in_checkmate(): boolean;
    in_draw(): boolean;
    in_stalemate(): boolean;
    in_threefold_repetition(): boolean;
    insufficient_material(): boolean;
    load(fen: string): boolean;
    load_pgn(pgn: string, options?: { sloppy?: boolean }): boolean;
    move(move: string | { from: Square; to: Square; promotion?: string }): Move | null;
    moves(options?: { square?: string; verbose?: boolean }): string[] | Move[];
    pgn(options?: { max_width?: number; newline_char?: string }): string;
    put(piece: { type: string; color: string }, square: Square): boolean;
    remove(square: Square): { type: string; color: string } | null;
    reset(): void;
    square_color(square: Square): string;
    turn(): string;
    undo(): Move | null;
    validate_fen(fen: string): { valid: boolean; error_number: number; error: string };
    
    // Add these aliases for your code
    isGameOver(): boolean;
    isCheckmate(): boolean;
  }
}