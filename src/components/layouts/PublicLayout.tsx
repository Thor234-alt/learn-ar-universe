import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
  showLogin?: boolean;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, showLogin = true }) => {
  const handleLoginClick = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Main Content */}
      <main className="h-screen w-full relative">
        {children}
      </main>

      {/* Login Button */}
      {showLogin && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Button
            onClick={handleLoginClick}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Access Platform
          </Button>
        </div>
      )}
    </div>
  );
};

export default PublicLayout;