import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/NotificationBell";
import avsarLogo from "@/assets/avsar-logo.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src={avsarLogo} 
              alt="AVSAR Logo" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-110 transition-transform"
              loading="lazy"
            />
            <span className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:inline">
              AVSAR
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="relative text-foreground hover:text-primary transition-all group">
              <span>Dashboard</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/careers" className="relative text-foreground hover:text-primary transition-all group">
              <span>Careers</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/colleges" className="relative text-foreground hover:text-primary transition-all group">
              <span>Colleges</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link to="/scholarships" className="relative text-foreground hover:text-primary transition-all group">
              <span>Scholarships</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-accent"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in">
            <Link
              to="/dashboard"
              className="block px-4 py-2 hover:bg-accent rounded-md transition-colors"
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
            <Link
              to="/careers"
              className="block px-4 py-2 hover:bg-accent rounded-md transition-colors"
              onClick={toggleMenu}
            >
              Careers
            </Link>
            <Link
              to="/colleges"
              className="block px-4 py-2 hover:bg-accent rounded-md transition-colors"
              onClick={toggleMenu}
            >
              Colleges
            </Link>
            <Link
              to="/scholarships"
              className="block px-4 py-2 hover:bg-accent rounded-md transition-colors"
              onClick={toggleMenu}
            >
              Scholarships
            </Link>
            <div className="flex flex-col space-y-2 px-4 pt-4 border-t">
              {user ? (
                <>
                  <Button variant="outline" asChild onClick={toggleMenu}>
                    <Link to="/profile">Profile</Link>
                  </Button>
                  <Button variant="destructive" onClick={() => { handleSignOut(); toggleMenu(); }}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild onClick={toggleMenu}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild onClick={toggleMenu}>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
