
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200/50 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ARLearn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#demo" className="text-slate-600 hover:text-blue-600 transition-colors">Demo</a>
            <a href="#analytics" className="text-slate-600 hover:text-blue-600 transition-colors">Analytics</a>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Welcome, {profile?.full_name || user.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/student-auth">
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    Student Sign In
                  </Button>
                </Link>
                <Link to="/admin-auth">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Admin Portal
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 py-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors px-2 py-1">Features</a>
              <a href="#demo" className="text-slate-600 hover:text-blue-600 transition-colors px-2 py-1">Demo</a>
              <a href="#analytics" className="text-slate-600 hover:text-blue-600 transition-colors px-2 py-1">Analytics</a>
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-sm text-slate-600 px-2">
                    Welcome, {profile?.full_name || user.email}
                  </span>
                  <Button variant="outline" onClick={handleSignOut} className="mx-2">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200">
                  <Link to="/student-auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full mx-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                      Student Sign In
                    </Button>
                  </Link>
                  <Link to="/admin-auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full mx-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Admin Portal
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
