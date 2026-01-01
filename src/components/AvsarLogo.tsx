import { Link } from "react-router-dom";
import avsarLogo from "@/assets/avsar-logo.png";

interface AvsarLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  linkTo?: string;
  className?: string;
  grayscale?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12"
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
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src={avsarLogo} 
        alt="Avsar Logo" 
        className={`${sizeClasses[size]} object-contain ${grayscale ? 'grayscale opacity-70' : ''}`}
        loading="lazy"
      />
      {showText && (
        <span className={`font-heading font-bold ${textSizeClasses[size]} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
          Avsar
        </span>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="hover:opacity-90 transition-opacity">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default AvsarLogo;
