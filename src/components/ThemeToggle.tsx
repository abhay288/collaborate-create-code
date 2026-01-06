import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const ThemeToggle = ({ className, size = 'sm' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-full transition-all duration-300",
        "hover:bg-accent/20 hover:scale-105",
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun 
        className={cn(
          "h-4 w-4 transition-all duration-300 absolute",
          theme === 'dark' 
            ? "rotate-90 scale-0 opacity-0" 
            : "rotate-0 scale-100 opacity-100"
        )} 
      />
      <Moon 
        className={cn(
          "h-4 w-4 transition-all duration-300 absolute",
          theme === 'dark' 
            ? "rotate-0 scale-100 opacity-100" 
            : "-rotate-90 scale-0 opacity-0"
        )} 
      />
    </Button>
  );
};

export default ThemeToggle;
