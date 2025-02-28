# Chess Game Server README

# Chess Game Server

This is the server-side implementation of the Chess Game project. It uses TypeScript, Express, and Socket.IO to provide real-time multiplayer functionality.

## Features

- Create and join chess games
- Make moves in real-time
- Handle game state updates
- Error handling for invalid moves and game states

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   git clone <repository-url>

2. Navigate to the server directory:

   cd chess-game/server

3. Install the dependencies:

   npm install

### Running the Server

To start the server, run the following command:

npm start

The server will be running on `http://localhost:3000`.

### API Endpoints

- **POST /createGame**: Create a new game.
- **POST /joinGame**: Join an existing game.
- **POST /move**: Make a move in the game.

### Real-time Communication

The server uses Socket.IO for real-time communication. Clients can listen for events such as:

- `gameCreated`: Emitted when a new game is created.
- `gameJoined`: Emitted when a player joins a game.
- `updateBoard`: Emitted when the game board is updated.
- `error`: Emitted when there is an error (e.g., invalid move).

## License

This project is licensed under the MIT License. See the LICENSE file for details.