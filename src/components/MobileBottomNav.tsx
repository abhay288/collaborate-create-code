import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, GraduationCap, Award, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/careers", label: "Careers", icon: BookOpen },
  { href: "/colleges", label: "Colleges", icon: GraduationCap },
  { href: "/scholarships", label: "Awards", icon: Award },
  { href: "/profile", label: "Profile", icon: User },
];

const MobileBottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Hide on landing, auth, and admin pages
  const hiddenPaths = ["/", "/login", "/register", "/forgot-password", "/admin"];
  if (hiddenPaths.some((p) => location.pathname === p || location.pathname.startsWith("/admin"))) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
