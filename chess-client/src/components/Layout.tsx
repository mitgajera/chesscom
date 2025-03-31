import React, { useState, useEffect, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`responsive-layout ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="min-h-screen flex flex-col">
        {/* Main content */}
        <main className="flex-1 container max-w-6xl mx-auto py-8 px-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
