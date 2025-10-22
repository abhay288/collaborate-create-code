import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="font-heading font-bold text-xl">Avsar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/careers" className="text-foreground hover:text-primary transition-colors">
              Careers
            </Link>
            <Link to="/colleges" className="text-foreground hover:text-primary transition-colors">
              Colleges
            </Link>
            <Link to="/scholarships" className="text-foreground hover:text-primary transition-colors">
              Scholarships
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
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
              <Button variant="outline" asChild onClick={toggleMenu}>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild onClick={toggleMenu}>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
