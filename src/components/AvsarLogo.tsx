import { Link } from "react-router-dom";
import avsarLogo from "@/assets/avsar-logo.png";
import { cn } from "@/lib/utils";

interface AvsarLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  linkTo?: string;
  className?: string;
  grayscale?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-9 w-9",
  lg: "h-11 w-11",
  xl: "h-14 w-14"
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl"
};

const AvsarLogo = ({ 
  size = "md", 
  showText = true, 
  linkTo = "/",
  className = "",
  grayscale = false
}: AvsarLogoProps) => {
  const logoContent = (
    <div className={cn("flex items-center space-x-3 group transition-all duration-300", className)}>
      <div className={cn(
        "relative flex items-center justify-center rounded-full bg-white shadow-md ring-1 ring-primary/10 overflow-hidden",
        sizeClasses[size],
        grayscale && "grayscale opacity-70"
      )}>
        <img 
          src={avsarLogo} 
          alt="Avsar" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Subtle Gloss Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
      </div>
      
      {showText && (
        <span className={cn(
          "font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight",
          textSizeClasses[size]
        )}>
          Avsar
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-95 transition-opacity inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default AvsarLogo;
