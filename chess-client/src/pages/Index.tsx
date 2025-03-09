import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Board from '../components/Board';
import PlayerInfo from '../components/PlayerInfo';
import MoveHistory from '../components/MoveHistory';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { GameState, getInitialGameState, ChessMove } from '../utils/chessUtils';
import { RotateCcw, RotateCw, Play, X, CircleDot } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState());
  const [boardFlipped, setBoardFlipped] = useState(false);
  const { toast } = useToast();

  // Function to handle square click
  const handleSquareClick = (square: string) => {
  
    if (gameState.status === 'not_started') {
      toast({
        title: "Game not started",
        description: "Click 'Start Game' to begin playing.",
        duration: 3000,
      });
      return;
    }

    if (gameState.selectedSquare === null) {
      // If no square is selected, select this one if it has a piece of the current turn
      const piece = gameState.board[square];
      if (piece && piece.color === gameState.currentTurn) {
        setGameState(prev => ({
          ...prev,
          selectedSquare: square,
          validMoves: [], // In a real app, you would calculate valid moves here
        }));
      }
    } else if (gameState.selectedSquare === square) {
      // If the same square is clicked again, deselect it
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        validMoves: [],
      }));
    } else {
      // Simulating a move for demonstration
      const piece = gameState.board[gameState.selectedSquare];
      if (piece) {
        const newBoard = { ...gameState.board };
        newBoard[square] = piece;
        newBoard[gameState.selectedSquare] = null;
        
        // Create a mock move for demonstration
        const move: ChessMove = {
          piece,
          from: gameState.selectedSquare,
          to: square,
          notation: `${piece.type[0].toUpperCase()}${square}`,
          capturedPiece: gameState.board[square] || undefined,
        };
        
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          selectedSquare: null,
          validMoves: [],
          currentTurn: prev.currentTurn === 'white' ? 'black' : 'white',
          moves: [...prev.moves, move],
          status: 'in_progress',
        }));
        
        toast({
          title: "Move made",
          description: `${piece.color === 'white' ? 'White' : 'Black'} moved ${piece.type} to ${square}`,
          duration: 2000,
        });
      }
    }
  };

  // Start a new game
  const handleNewGame = () => {
    setGameState({
      ...getInitialGameState(),
      status: 'in_progress',
    });
    
    toast({
      title: "New game started",
      description: "White to move first.",
      duration: 3000,
    });
  };

  // Flip the board
  const handleFlipBoard = () => {
    setBoardFlipped(prev => !prev);
  };

  // Handle resignation
  const handleResign = () => {
    if (gameState.status !== 'in_progress' && gameState.status !== 'check') {
      toast({
        title: "No active game",
        description: "Cannot resign when no game is in progress.",
        duration: 3000,
      });
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      status: 'checkmate', // This is a simplification, normally would be more complex
    }));
    
    toast({
      title: "Game over",
      description: `${gameState.currentTurn === 'white' ? 'White' : 'Black'} resigned. ${gameState.currentTurn === 'white' ? 'Black' : 'White'} wins!`,
      duration: 3000,
    });
  };

  // Handle draw offer
  const handleOfferDraw = () => {
    if (gameState.status !== 'in_progress' && gameState.status !== 'check') {
      toast({
        title: "No active game",
        description: "Cannot offer a draw when no game is in progress.",
        duration: 3000,
      });
      return;
    }
    
    // In a real app, this would show a confirmation to the other player
    // For demo, we'll just accept the draw automatically
    setGameState(prev => ({
      ...prev,
      status: 'draw',
    }));
    
    toast({
      title: "Game drawn",
      description: "Players agreed to a draw.",
      duration: 3000,
    });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chess board section */}
        <div className="lg:col-span-7">
          <Card className="shadow-card overflow-hidden">
            <CardHeader className="p-4 bg-muted/40">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Chess Board</CardTitle>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleFlipBoard}
                  className="h-8 w-8"
                >
                  {boardFlipped ? <RotateCw className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className={`transition-transform duration-500 ${boardFlipped ? 'rotate-180' : ''}`}>
                <Board 
                  gameState={gameState} 
                  onSquareClick={handleSquareClick} 
                />
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {gameState.status === 'not_started' && (
                  <Button 
                    className="flex-1"
                    onClick={handleNewGame}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Game
                  </Button>
                )}
                {(gameState.status === 'in_progress' || gameState.status === 'check') && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleResign}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Resign
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleOfferDraw}
                    >
                      <CircleDot className="mr-2 h-4 w-4" />
                      Offer Draw
                    </Button>
                  </>
                )}
                {(gameState.status === 'checkmate' || gameState.status === 'stalemate' || gameState.status === 'draw') && (
                  <Button 
                    className="flex-1"
                    onClick={handleNewGame}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    New Game
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Game info section */}
        <div className="lg:col-span-5">
          <Card className="shadow-card h-full flex flex-col">
            <CardHeader className="p-4 bg-muted/40">
              <CardTitle className="text-lg">Game Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col space-y-4">
              {/* Player information */}
              <div className="space-y-2">
                <PlayerInfo 
                  player={gameState.blackPlayer} 
                  isActive={
                    (gameState.status === 'in_progress' || gameState.status === 'check') && 
                    gameState.currentTurn === 'black'
                  } 
                />
                <Separator />
                <PlayerInfo 
                  player={gameState.whitePlayer} 
                  isActive={
                    (gameState.status === 'in_progress' || gameState.status === 'check') && 
                    gameState.currentTurn === 'white'
                  }
                />
              </div>
              
              {/* Game status */}
              <div className="text-center py-2 px-4 rounded-lg bg-muted/50">
                {gameState.status === 'not_started' && (
                  <span className="text-muted-foreground">Game not started</span>
                )}
                {gameState.status === 'in_progress' && (
                  <span className="font-medium">
                    {gameState.currentTurn === 'white' ? "White's" : "Black's"} turn
                  </span>
                )}
                {gameState.status === 'check' && (
                  <span className="font-medium text-yellow-600">
                    {gameState.currentTurn === 'white' ? "White" : "Black"} is in check
                  </span>
                )}
                {gameState.status === 'checkmate' && (
                  <span className="font-medium text-red-500">
                    Checkmate! {gameState.currentTurn === 'white' ? "Black" : "White"} wins
                  </span>
                )}
                {gameState.status === 'stalemate' && (
                  <span className="font-medium text-amber-600">
                    Stalemate - Game drawn
                  </span>
                )}
                {gameState.status === 'draw' && (
                  <span className="font-medium text-amber-600">
                    Game drawn
                  </span>
                )}
              </div>
              
              {/* Move history */}
              <div className="flex-1">
                <MoveHistory moves={gameState.moves} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;

const someFunction = (prev: any) => {
  // ...existing code...
};

const anotherFunction = (prev: any) => {
  // ...existing code...
};

// Repeat for other functions with 'prev' parameter
