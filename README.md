# Multiplayer Chess Game

A real-time online chess application built with React, TypeScript, and Socket.IO that allows players to compete in chess matches over the internet.

## Features

- ♟️ Create and join games with unique game IDs
- ⚡ Real-time gameplay with move validation
- 👁️ Spectator mode for watching games
- ⏱️ Game timers with countdown
- 📜 Complete move history display
- 🤝 Draw offers and resignation
- 🎉 Victory animations
- 📱 Mobile-responsive design

## Tech Stack

### Frontend
- **React**: Component-based UI library
- **TypeScript**: Strongly-typed JavaScript
- **Chess.js**: Chess logic and move validation
- **Chessboard.jsx**: Interactive chess board component

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **Socket.IO**: Real-time bidirectional communication

### Styling & Tools
- **CSS3**: Custom responsive styling
- **Git**: Version control and collaboration

## Installation & Setup

1. **Clone the repository**
    ```bash
    git clone https://github.com/mitgajera/chesscom
    cd chesscom
    ```

2. **Install dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3. **Start the application**
    ```bash
    # Run the server
    cd ../server
    npm start

    # In a new terminal, run the client
    cd ../client
    npm start
    ```

4. **Open your browser** and navigate to `http://localhost:3000`

## How to Play

1. Create a new game or join an existing one using a game ID
2. Share the game ID with your opponent
3. Make moves by clicking and dragging chess pieces
4. Use the game controls to offer draws or resign

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
