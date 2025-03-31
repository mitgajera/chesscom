/**
 * Enhances the application for touch devices by adding touch-specific styles and behavior
 * @returns boolean indicating if the current device is a touch device
 */
export const enhanceForTouchDevices = (): boolean => {
  // Detect if it's a touch device
  const isTouchDevice = 'ontouchstart' in window || 
                        navigator.maxTouchPoints > 0 || 
                        // @ts-ignore - For IE support if needed
                        (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);
  
  if (isTouchDevice) {
    // Add touch-specific CSS class to body
    document.body.classList.add('touch-device');
    
    // Increase clickable/tappable areas
    const style = document.createElement('style');
    style.innerHTML = `
      .square {
        touch-action: manipulation;
      }
      .piece {
        touch-action: manipulation;
        transform: scale(1.1);
      }
      button {
        min-height: 44px;
        min-width: 44px;
      }
    `;
    document.head.appendChild(style);
  }
  
  return isTouchDevice;
};

/**
 * Prevents zoom gestures on the chessboard element
 * @param boardElement - DOM element reference to the chess board
 */
export const preventZoomOnBoard = (boardElement: HTMLElement | null): void => {
  if (!boardElement) return;
  
  boardElement.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Prevent double-tap zoom
  boardElement.addEventListener('touchend', (e) => {
    const now = Date.now();
    const lastTouch = boardElement.getAttribute('data-last-touch') || '0';
    const timeDiff = now - parseInt(lastTouch);
    
    if (timeDiff < 300) {
      e.preventDefault();
    }
    
    boardElement.setAttribute('data-last-touch', now.toString());
  }, { passive: false });
};

/**
 * Adds haptic feedback for moves (vibration on supported devices)
 * @param isValid - Whether the move was valid or not
 */
export const provideHapticFeedback = (isValid: boolean): void => {
  if (!('vibrate' in navigator)) return;
  
  if (isValid) {
    // Short vibration for valid moves
    navigator.vibrate(15);
  } else {
    // Pattern vibration for invalid moves
    navigator.vibrate([30, 30, 30]);
  }
};