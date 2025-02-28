import React from "react";
import ReactDOM from "react-dom";
import ChessBoard from "./components/ChessBoard";
import "./styles/ChessBoard.css";

const App = () => {
  return (
    <div>
      <h1>Chess Game</h1>
      <ChessBoard />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));