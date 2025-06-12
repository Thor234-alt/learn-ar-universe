
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const getDashboardLinks = () => {
    if (!profile) return [];

    const links = [];
    
    switch (profile.role) {
      case 'admin':
      case 'client':
        links.push({ href: '/admin-dashboard', label: 'Admin Dashboard' });
        break;
      case 'teacher':
        links.push({ href: '/teacher-dashboard', label: 'Teacher Dashboard' });
        break;
      case 'student':
        links.push({ href: '/student-dashboard', label: 'Student Dashboard' });
        break;
    }

    return links;
  };

  const dashboardLinks = getDashboardLinks();
  const isDashboard = location.pathname.includes('dashboard');

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
            {!isDashboard && (
              <>
                <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                <a href="#demo" className="text-slate-600 hover:text-blue-600 transition-colors">Demo</a>
                <a href="#analytics" className="text-slate-600 hover:text-blue-600 transition-colors">Analytics</a>
              </>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard Navigation */}
                {dashboardLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    to={link.href}
                    className={`text-sm transition-colors ${
                      location.pathname === link.href 
                        ? 'text-blue-600 font-medium' 
                        : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-4 w-px bg-slate-300"></div>
                
                <span className="text-sm text-slate-600">
                  {profile?.full_name || user.email}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full capitalize">
                  {profile?.role || 'user'}
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
              {!isDashboard && (
                <>
                  <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors px-2 py-1">Features</a>
                  <a href="#demo" className="text-slate-600 hover:text-blue-600 transition-colors px-2 py-1">Demo</a>
                  <a href="#analytics" className="text-slate-600 hover:text-blue-600 transition-colors px-2 py-1">Analytics</a>
                </>
              )}
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200">
                  {/* Dashboard Navigation */}
                  {dashboardLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      to={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`px-2 py-1 transition-colors ${
                        location.pathname === link.href 
                          ? 'text-blue-600 font-medium' 
                          : 'text-slate-600 hover:text-blue-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="pt-2 border-t border-slate-200">
                    <div className="px-2 py-1">
                      <span className="text-sm text-slate-600 block">
                        {profile?.full_name || user.email}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full capitalize inline-block mt-1">
                        {profile?.role || 'user'}
                      </span>
                    </div>
                    <Button variant="outline" onClick={handleSignOut} className="mx-2 mt-2 w-auto">
                      Sign Out
                    </Button>
                  </div>
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
