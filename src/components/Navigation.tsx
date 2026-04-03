import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, ChevronDown, Heart, Download, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import AvsarLogo from "@/components/AvsarLogo";
import { cn } from "@/lib/utils";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { canInstall, promptInstall } = useInstallPrompt();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    
    // Update Supabase if user is logged in
    if (user) {
      supabase.from('profiles').update({ preferred_language: newLang }).eq('id', user.id).then(({ error }) => {
        if (error) console.error('Error updating language preference:', error);
      });
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { href: "/dashboard", label: t('nav.dashboard') },
    { href: "/careers", label: t('nav.careers') },
    { href: "/colleges", label: t('nav.colleges') },
    { href: "/scholarships", label: t('nav.scholarships') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <AvsarLogo size="md" showText={false} linkTo="" />
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
                AVSAR
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-muted-foreground -mt-0.5 font-medium">
                Career Atlas
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative",
                  isActive(link.href)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3.5 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 flex items-center gap-1">
                  More <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem asChild>
                  <Link to="/study-materials" className="cursor-pointer">Study Materials</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ngos" className="cursor-pointer">NGOs</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-1.5">
            {canInstall && (
              <Button variant="outline" size="sm" onClick={promptInstall} className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 h-8">
                <Download className="h-3.5 w-3.5" />
                Install
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-1.5 h-8 px-2 text-muted-foreground hover:text-foreground">
              <Languages className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">{i18n.language}</span>
            </Button>
            <ThemeToggle />
            {user ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="gap-1.5 h-8 px-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex items-center gap-2">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-result" className="cursor-pointer flex items-center gap-2">
                        <Heart className="h-4 w-4" /> My Results
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="h-8 text-sm">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="h-8 text-sm bg-primary hover:bg-primary/90 shadow-sm">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-muted/60 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/40 animate-fade-in">
            <div className="space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "block px-4 py-2.5 rounded-lg transition-colors text-sm",
                    isActive(link.href)
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={toggleMenu}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/study-materials" className={cn("block px-4 py-2.5 rounded-lg transition-colors text-sm", isActive("/study-materials") ? "bg-primary/8 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")} onClick={toggleMenu}>
                Study Materials
              </Link>
              <Link to="/ngos" className={cn("block px-4 py-2.5 rounded-lg transition-colors text-sm", isActive("/ngos") ? "bg-primary/8 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")} onClick={toggleMenu}>
                NGOs
              </Link>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border/40 space-y-2 px-4">
              {canInstall && (
                <Button variant="outline" className="w-full justify-start gap-2 border-primary/30 text-primary" onClick={() => { promptInstall(); toggleMenu(); }}>
                  <Download className="h-4 w-4" /> Install AVSAR App
                </Button>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Language / भाषा</span>
                <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2 h-9 px-3">
                  <Languages className="h-4 w-4" />
                  <span className="font-bold uppercase">{i18n.language === 'en' ? 'English' : 'हिन्दी'}</span>
                </Button>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              {user ? (
                <>
                  <Button variant="outline" className="w-full justify-start" asChild onClick={toggleMenu}>
                    <Link to="/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { handleSignOut(); toggleMenu(); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild onClick={toggleMenu}>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild onClick={toggleMenu}>
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
