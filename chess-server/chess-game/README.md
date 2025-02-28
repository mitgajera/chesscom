# Chess Game Project

This project is a chess game implemented using TypeScript, featuring a server-side application built with Express and Socket.IO for real-time communication, and a client-side application built with React.

## Project Structure

```
chess-game
├── server
│   ├── src
│   │   ├── server.ts          # Entry point for the server-side application
│   │   ├── controllers
│   │   │   └── gameController.ts # Contains game logic and state management
│   │   ├── routes
│   │   │   └── gameRoutes.ts  # API routes for game-related endpoints
│   │   └── types
│   │       └── index.ts       # Type definitions for the application
│   ├── package.json            # Server dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration for the server
│   └── README.md               # Documentation for the server-side application
├── client
│   ├── src
│   │   ├── index.tsx          # Entry point for the client-side application
│   │   ├── components
│   │   │   └── ChessBoard.tsx  # React component for the chessboard
│   │   ├── styles
│   │   │   └── ChessBoard.css  # Styles for the ChessBoard component
│   │   └── types
│   │       └── index.ts       # Type definitions for the client application
│   ├── package.json            # Client dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration for the client
│   └── README.md               # Documentation for the client-side application
├── README.md                   # Overall documentation for the chess game project
└── .gitignore                  # Files and directories to ignore by Git
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chess-game
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```

2. Start the client:
   ```
   cd client
   npm start
   ```

### Usage

- Open your browser and navigate to `http://localhost:3000` to play the chess game.
- You can create a new game or join an existing one using the game ID.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.