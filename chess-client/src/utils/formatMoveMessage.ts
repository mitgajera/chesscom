/**
 * Formats the move notification message based on the player's role and the move made
 */
export function formatMoveMessage(moveInfo: {
  san?: string;
  from?: string;
  to?: string;
  color?: string;
  piece?: string;
}, playerRole: "player" | "spectator", moveColor: "white" | "black") {
  // Get the basic move text
  const moveSan = moveInfo.san || `${moveInfo.from}-${moveInfo.to || ""}`;
  
  // For spectators, show which color made the move
  if (playerRole === "spectator") {
    return `${moveColor === "white" ? "⚪ White" : "⚫ Black"} moved: ${moveSan}`;
  }
  
  // For players, show opponent moved
  return `Opponent moved: ${moveSan}`;
}