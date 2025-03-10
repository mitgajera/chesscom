
import React, { ReactNode } from 'react';
import { useEntranceAnimation } from '../utils/animations';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const header = useEntranceAnimation(0, 400);
  const content = useEntranceAnimation(200, 500);
  const footer = useEntranceAnimation(400, 400);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header 
        ref={header.ref}
        className="w-full py-4 border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-10"
      >
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-6 h-6">
                <div className="bg-chessDark rounded-sm"></div>
                <div className="bg-chessLight rounded-sm"></div>
                <div className="bg-chessLight rounded-sm"></div>
                <div className="bg-chessDark rounded-sm"></div>
              </div>
              <h1 className="text-xl font-semibold">Chess</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">Play</a>
              <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">Learn</a>
              <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">Watch</a>
              <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">News</a>
              <a href="#" className="text-sm font-medium hover:text-primary/80 transition-colors">Social</a>
            </nav>
            <div className="flex items-center space-x-2">
              <button className="text-sm font-medium hover:text-primary/80 transition-colors">
                Sign In
              </button>
              <button className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main 
        ref={content.ref}
        className="flex-1 container max-w-6xl mx-auto py-8 px-4"
      >
        {children}
      </main>

      {/* Footer */}
      <footer 
        ref={footer.ref}
        className="w-full py-6 border-t border-border backdrop-blur-sm bg-background/80"
      >
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-5 h-5">
                <div className="bg-chessDark rounded-sm"></div>
                <div className="bg-chessLight rounded-sm"></div>
                <div className="bg-chessLight rounded-sm"></div>
                <div className="bg-chessDark rounded-sm"></div>
              </div>
              <span className="text-sm font-medium">Chess</span>
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Help</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
