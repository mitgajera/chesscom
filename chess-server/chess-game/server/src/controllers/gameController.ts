class GameController {
  private games: { [key: string]: Chess } = {};

  createGame(): string {
    const gameId = Math.random().toString(36).substr(2, 6);
    this.games[gameId] = new Chess();
    return gameId;
  }

  joinGame(gameId: string): boolean {
    return !!this.games[gameId];
  }

  makeMove(gameId: string, move: string): boolean {
    const game = this.games[gameId];
    if (game && game.move(move)) {
      return true;
    }
    return false;
  }

  getGameState(gameId: string): string | null {
    const game = this.games[gameId];
    return game ? game.fen() : null;
  }
}

export default GameController;