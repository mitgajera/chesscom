import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
