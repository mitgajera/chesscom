import React, { useState } from "react";
import ReactDOM from "react-dom";
import ChessBoard from "./components/ChessBoard";
import "./styles/ChessBoard.css";
import io from "socket.io-client";

const App: React.FC = () => {
  const socket = io("http://localhost:3000");
  const [isSpectator, setIsSpectator] = useState<boolean>(false);
  const [fen, setFen] = useState<string>("start");
  const [gameId, setGameId] = useState<string>("");
  const [game, setGame] = useState<any>({});
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [whiteTime, setWhiteTime] = useState<number>(0);
  const [blackTime, setBlackTime] = useState<number>(0);
  const [isWhite, setIsWhite] = useState<boolean>(true);
  const [isBlack, setIsBlack] = useState<boolean>(false);
  const [joinGameId, setJoinGameId] = useState<string>("");

  return (
    <div>
      <h1>Chess Game</h1>
      <ChessBoard 
        fen={fen}
        onDrop={(sourceSquare: string, targetSquare: string) => {
          if (isSpectator) {
            alert("You are only watching the game and cannot make moves.");
            return false;
          }

          const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q || r || b || n", 
          });

          if (move === null) return false;

          setFen(game.fen());
          if (gameId) {
            socket.emit("move", { gameId, move: `${sourceSquare}${targetSquare}q` });
          }
          return true;
        }}
        playerColor={playerColor}
        createGame={() => {}}
        joinGame={() => {}}
        gameId={gameId}
        gameStatus=""
        gameResult=""
        moveHistory={[]}
        currentPlayer=""
        opponent=""
        timeLeft={{ white: whiteTime, black: blackTime }}
        onMove={() => {}}
        whiteTime={whiteTime}
        blackTime={blackTime}
        isWhite={isWhite}
        isBlack={isBlack}
        isSpectator={isSpectator}
        setIsWhite={setIsWhite}
        setIsBlack={setIsBlack}
        joinGameId={joinGameId}
        setIsSpectator={setIsSpectator}
        setJoinGameId={setJoinGameId}
        onGameOver={() => {}}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));